from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Question, Answer


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    password = serializers.CharField(write_only=True, min_length=1)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user


class QuestionSerializer(serializers.ModelSerializer):
    """Serializer for the Question model."""
    class Meta:
        model = Question
        fields = ['id', 'question_text', 'created_at']


class AnswerSerializer(serializers.ModelSerializer):
    """Serializer for the Answer model."""
    class Meta:
        model = Answer
        fields = ['id', 'answer_text', 'created_at']


class QuestionWithAnswerSerializer(serializers.ModelSerializer):
    """Serializer for Question with its nested Answer."""
    answer = AnswerSerializer(read_only=True)

    class Meta:
        model = Question
        fields = ['id', 'question_text', 'created_at', 'answer']
