from django.urls import path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

from brainbox import views

urlpatterns = [
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/schema/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    path('api/users/', views.UsersEndpoint.as_view()),
    path('api/user/<int:pk>/', views.UserEndpoint.as_view()),
    path('api/user/<int:pk>/shared-files/', views.UserSharedFilesEndpoint.as_view()),
    path('api/user/<int:user_id>/shared-file/<int:file_id>/', views.SharedFileEndpoint.as_view()),
    path('api/folders/', views.FoldersEndpoint.as_view()),
    path('api/folder/<int:pk>/', views.FolderEndpoint.as_view()),
    path('api/files/', views.FilesEndpoint.as_view()),
    path('api/file/<int:pk>/', views.FileEndpoint.as_view()),
    path('api/file/<int:pk>/shared-users/', views.FileSharedFilesEndpoint.as_view()),
    path('api/file/<int:file_id>/shared-user/<int:user_id>/', views.SharedFileEndpoint.as_view()),

    path('api/users-by-chars-written/', views.UsersByCharsWritten.as_view(), name='users-by-chars-written'),
    path('api/folders-by-shared-files/', views.FoldersByFilesSharedUsers.as_view(), name='folders-by-shared-files'),

    path('api/folder/<int:pk>/files/', views.FolderFilesEndpoint.as_view()),
]
