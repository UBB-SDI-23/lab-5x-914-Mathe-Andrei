from django.urls import path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from brainbox import views

urlpatterns = [
    path('schema/', SpectacularAPIView.as_view(), name='schema'),
    path('schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('schema/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    path('login/', TokenObtainPairView.as_view()),
    path('login/refresh/', TokenRefreshView.as_view()),
    path('register/', views.RegisterEndpoint.as_view()),
    path('register/confirm/<str:code>/', views.RegistrationConfirmView.as_view()),

    path('users/', views.UsersEndpoint.as_view()),
    path('user/<int:pk>/', views.UserEndpoint.as_view()),
    path('user/<int:pk>/shared-files/', views.UserSharedFilesEndpoint.as_view()),
    path('user/<int:user_id>/shared-file/<int:file_id>/', views.SharedFileEndpoint.as_view()),
    path('folders/', views.FoldersEndpoint.as_view()),
    path('folder/<int:pk>/', views.FolderEndpoint.as_view()),
    path('files/', views.FilesEndpoint.as_view()),
    path('file/<int:pk>/', views.FileEndpoint.as_view()),
    path('file/<int:pk>/shared-users/', views.FileSharedFilesEndpoint.as_view()),
    path('file/<int:file_id>/shared-user/<int:user_id>/', views.SharedFileEndpoint.as_view()),

    path('statistics/users-by-chars-written/', views.UsersByCharsWritten.as_view(), name='users-by-chars-written'),
    path('statistics/folders-by-shared-users/', views.FoldersByFilesSharedUsers.as_view(), name='folders-by-shared-users'),
    path('statistics/folders-by-num-files/', views.FoldersByNumFiles.as_view(), name='folders-by-num-files'),
]
