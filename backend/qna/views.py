# pyrefly: ignore [missing-import]
from rest_framework import status
# pyrefly: ignore [missing-import]
from rest_framework.decorators import api_view, permission_classes
# pyrefly: ignore [missing-import]
from rest_framework.permissions import AllowAny, IsAuthenticated
# pyrefly: ignore [missing-import]
from rest_framework.response import Response
# pyrefly: ignore [missing-import]
from rest_framework_simplejwt.tokens import RefreshToken
# pyrefly: ignore [missing-import]
from django.contrib.auth import authenticate
from .models import Question, Answer
from .serializers import RegisterSerializer, QuestionWithAnswerSerializer
from .services import generate_answer, is_electrical_topic, REJECTION_MESSAGE


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """Register a new user and return JWT tokens."""
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'message': 'Registration successful',
            'user': {'id': user.id, 'username': user.username},
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """Authenticate user and return JWT tokens."""
    username = request.data.get('username', '')
    password = request.data.get('password', '')

    user = authenticate(username=username, password=password)
    if user is not None:
        refresh = RefreshToken.for_user(user)
        return Response({
            'message': 'Login successful',
            'user': {'id': user.id, 'username': user.username},
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }
        })
    return Response(
        {'error': 'Invalid username or password'},
        status=status.HTTP_401_UNAUTHORIZED
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ask_question_view(request):
    """Accept a question, validate topic, build conversation context, get AI response."""
    question_text = request.data.get('question', '').strip()
    if not question_text:
        return Response(
            {'error': 'Question text is required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Save question to database
    question = Question.objects.create(
        user=request.user,
        question_text=question_text
    )

    # Backend guardrail: check topic BEFORE calling Gemini API
    if not is_electrical_topic(question_text):
        # Check if the question might be a follow-up (context-dependent)
        # by looking at recent conversation — if user was discussing electrical
        # topics, allow contextual follow-ups like "explain more", "its losses"
        recent_questions = (
            Question.objects
            .filter(user=request.user)
            .select_related('answer')
            .order_by('-created_at')[:10]
        )
        has_electrical_context = any(
            is_electrical_topic(q.question_text) for q in recent_questions
            if q.id != question.id
        )

        # Allow contextual follow-ups only if recent conversation was electrical
        contextual_phrases = [
            "explain", "more", "detail", "example", "derive", "why",
            "how", "what", "its", "this", "that", "these", "those",
            "tell me", "elaborate", "continue", "go on", "losses",
            "types", "difference", "compare", "formula", "equation",
            "diagram", "working", "principle", "application", "advantage",
        ]
        is_followup = any(p in question_text.lower() for p in contextual_phrases)

        if not (has_electrical_context and is_followup):
            Answer.objects.create(
                question=question,
                answer_text=REJECTION_MESSAGE
            )
            return Response({
                'question': question_text,
                'answer': REJECTION_MESSAGE,
            })

    # Build conversation history from last 10 messages for context
    recent_qna = (
        Question.objects
        .filter(user=request.user)
        .select_related('answer')
        .order_by('-created_at')[:10]
    )

    conversation_history = []
    for q in reversed(list(recent_qna)):
        if q.id == question.id:
            continue
        conversation_history.append({"role": "user", "text": q.question_text})
        if hasattr(q, 'answer'):
            conversation_history.append({"role": "model", "text": q.answer.answer_text})

    # Get AI-generated answer with full conversation context
    ai_response = generate_answer(question_text, conversation_history)

    Answer.objects.create(
        question=question,
        answer_text=ai_response
    )

    return Response({
        'question': question_text,
        'answer': ai_response,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def question_history_view(request):
    """Return the authenticated user's question history with answers."""
    questions = (
        Question.objects
        .filter(user=request.user)
        .select_related('answer')
        .order_by('-created_at')
    )
    serializer = QuestionWithAnswerSerializer(questions, many=True)
    return Response(serializer.data)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def clear_history_view(request):
    """Delete all question history for the authenticated user."""
    Question.objects.filter(user=request.user).delete()
    return Response({'message': 'Chat history cleared successfully.'}, status=status.HTTP_200_OK)
