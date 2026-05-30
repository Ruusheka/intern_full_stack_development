# pyrefly: ignore [missing-import]
from django.contrib import admin
# pyrefly: ignore [missing-import]
from django.urls import path, include
# pyrefly: ignore [missing-import]
from rest_framework_simplejwt.views import TokenRefreshView
# pyrefly: ignore [missing-import]
from django.http import JsonResponse

def api_root_view(request):
    return JsonResponse({
        "status": "online",
        "message": "Quill Bot Backend API is running.",
        "frontend_url": "http://localhost:5173"
    })

urlpatterns = [
    path('', api_root_view, name='api_root'),
    path('admin/', admin.site.urls),
    path('api/', include('qna.urls')),
]
