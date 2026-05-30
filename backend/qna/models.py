# pyrefly: ignore [missing-import]
from django.db import models
# pyrefly: ignore [missing-import]
from django.contrib.auth.models import User

class Question(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="questions")
    question_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Question {self.id} by {self.user.username}"

class Answer(models.Model):
    question = models.OneToOneField(Question, on_delete=models.CASCADE, related_name="answer")
    answer_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Answer for Question {self.question.id}"
