# pyrefly: ignore [missing-import]
from django.urls import path
# pyrefly: ignore [missing-import]
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Authentication
    path('register/', views.register_view, name='register'),
    path('login/', views.login_view, name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    # Q&A
    path('ask-question/', views.ask_question_view, name='ask_question'),
    path('questions/', views.question_history_view, name='question_history'),
    path('questions/clear/', views.clear_history_view, name='clear_history'),
]
