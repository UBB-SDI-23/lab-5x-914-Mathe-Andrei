from django.db.models import Sum, Count, OuterRef, Subquery
from django.db.models.functions import Length, Coalesce
from rest_framework import generics, mixins, views, status, pagination
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response

from brainbox.permissions import *
from brainbox.dbutils import *
from brainbox.serializers import *


class Pagination(pagination.PageNumberPagination):
    page_size = 25
    page_size_query_param = 'page_size'
    page_query_param = 'page'

    def get_page_size(self, request):
        if self.page_size_query_param:
            try:
                return int(request.query_params[self.page_size_query_param])
            except KeyError:
                pass
        if request.user.is_anonymous:
            return self.page_size
        return request.user.profile.page_size

    def get_paginated_response(self, data):
        return Response({
            'count': self.page.paginator.count,
            'page_size': self.get_page_size(self.request),
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'results': data
        })


class RegisterEndpoint(generics.CreateAPIView):
    serializer_class = UserSerializerList
    authentication_classes = []
    permission_classes = []


class RegistrationConfirmView(views.APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request, code):
        try:
            registration_code = RegistrationCode.objects.get(code=code)
        except RegistrationCode.DoesNotExist:
            return Response({'detail': 'Invalid confirmation code.'}, status=status.HTTP_400_BAD_REQUEST)

        user = registration_code.user
        if registration_code.expires_at < timezone.now():
            user.delete()
            return Response({'detail': 'Confirmation code has expired.'}, status=status.HTTP_400_BAD_REQUEST)

        user.is_active = True
        user.save()
        registration_code.delete()
        return Response({'detail': 'Account activated.'}, status=status.HTTP_200_OK)


class UsersEndpoint(generics.ListAPIView):
    serializer_class = UserSerializerList
    pagination_class = Pagination

    def get_permissions(self):
        permissions = [IsAuthenticatedOrReadOnly]

        if self.request.method == "DELETE":
            permissions += [IsAdmin]

        return [permission() for permission in permissions]

    def get_queryset(self):
        queryset = User.objects.all()

        username = self.request.query_params.get('username')
        year = self.request.query_params.get('year')
        agg = self.request.query_params.get('agg')

        if agg:
            queryset = User.objects.annotate(
                num_personal_files=Coalesce(Subquery(
                    File.objects.filter(user=OuterRef('pk')).values('user').annotate(count=Count('id')).values('count')
                ), 0)
            )

        filters = {}
        if username:
            filters['username__icontains'] = username
        if year:
            filters['created_at__year__gte'] = year

        if filters:
            queryset = queryset.filter(**filters)
            if year:
                queryset = queryset.order_by('created_at')

        return queryset

    def delete(self, request, format=None):
        instances = self.get_queryset()
        instances.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class UserEndpoint(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializerDetail

    def get_permissions(self):
        user = self.request.user
        permissions = [IsAuthenticatedOrReadOnly]

        if user.is_authenticated:
            if user.role == User.Roles.USER:
                permissions += [IsOwnerOrReadOnly]
            else:
                if self.request.method in ["PUT", "PATCH", "DELETE"]:
                    permissions += [HasHigherRoleOrIsOwnerPermission]

        return [permission() for permission in permissions]


class UserRoleEndpoint(generics.UpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRoleSerializer
    permission_classes = [IsAdmin]


class UsersPageSizeEndpoint(views.APIView):
    def put(self, request, format=None):
        page_size = request.data.get('page_size', None)
        if page_size is None:
            return Response({'page_size': ['This field is required.']}, status=status.HTTP_400_BAD_REQUEST)

        try:
            page_size = int(page_size)
            if page_size <= 0:
                return Response({'page_size': ['Page size must be strictly positive.']}, status=status.HTTP_400_BAD_REQUEST)
        except ValueError:
            return Response({'page_size': ['A valid integer is required.']}, status=status.HTTP_400_BAD_REQUEST)

        instances = UserProfile.objects.all()
        instances.update(page_size=page_size)
        return Response({'detail': ['Updated successfully.']}, status=status.HTTP_200_OK)


class FoldersEndpoint(generics.ListCreateAPIView):
    serializer_class = FolderSerializerList
    pagination_class = Pagination

    def get_permissions(self):
        permissions = [IsAuthenticatedOrReadOnly]

        if self.request.method == "DELETE":
            permissions += [IsAdmin]

        return [permission() for permission in permissions]

    def get_queryset(self):
        queryset = Folder.objects.all()

        username = self.request.query_params.get('username')
        name = self.request.query_params.get('name')
        agg = self.request.query_params.get('agg')

        if agg:
            queryset = Folder.objects.annotate(
                num_files=Coalesce(Subquery(
                    File.objects.filter(folder=OuterRef('pk')).values('folder').annotate(count=Count('id')).values(
                        'count')
                ), 0)
            )

        filters = {}
        if username:
            filters['user__username'] = username
        if name:
            filters['name__icontains'] = name

        if filters:
            queryset = Folder.objects.filter(**filters)

        return queryset

    def delete(self, request, format=None):
        instances = self.get_queryset()
        instances.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class FolderEndpoint(generics.RetrieveUpdateDestroyAPIView):
    queryset = Folder.objects.all()
    serializer_class = FolderSerializerDetail

    def get_permissions(self):
        user = self.request.user
        permissions = [IsAuthenticatedOrReadOnly]

        if user.is_authenticated:
            if user.role == User.Roles.USER:
                permissions += [IsOwnerOrReadOnly]
            else:
                if self.request.method in ["PUT", "PATCH", "DELETE"]:
                    permissions += [HasHigherRoleOrIsOwnerPermission]

        return [permission() for permission in permissions]

    def get_serializer(self, *args, **kwargs):
        serializer_class = self.get_serializer_class()
        kwargs.setdefault('context', self.get_serializer_context())
        serializer = serializer_class(*args, **kwargs)
        if self.request.method in ('PUT', 'PATCH'):
            serializer.fields['parent_folder'] = serializers.PrimaryKeyRelatedField(allow_null=True, queryset=Folder.objects.all(), required=False)
        return serializer


class FilesEndpoint(generics.ListCreateAPIView):
    serializer_class = FileSerializerList
    pagination_class = Pagination

    def get_permissions(self):
        permissions = [IsAuthenticatedOrReadOnly]

        if self.request.method == "DELETE":
            permissions += [IsAdmin]

        return [permission() for permission in permissions]

    def get_queryset(self):
        queryset = File.objects.all()

        agg = self.request.query_params.get('agg')

        if agg:
            queryset = File.objects.annotate(
                num_shared_users=Coalesce(Subquery(
                    SharedFile.objects.filter(file=OuterRef('pk')).values('file').annotate(count=Count('id')).values(
                        'count')
                ), 0)
            )

        return queryset

    def delete(self, request, format=None):
        instances = self.get_queryset()
        instances.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class FileEndpoint(generics.RetrieveUpdateDestroyAPIView):
    queryset = File.objects.all()
    serializer_class = FileSerializerDetail

    def get_permissions(self):
        user = self.request.user
        permissions = [IsAuthenticatedOrReadOnly]

        if user.is_authenticated:
            if user.role == User.Roles.USER:
                permissions += [IsOwnerOrReadOnly]
            else:
                if self.request.method in ["PUT", "PATCH", "DELETE"]:
                    permissions = [HasHigherRoleOrIsOwnerPermission]

        return [permission() for permission in permissions]

    def get_serializer(self, *args, **kwargs):
        serializer_class = self.get_serializer_class()
        kwargs.setdefault('context', self.get_serializer_context())
        serializer = serializer_class(*args, **kwargs)
        if self.request.method in ('PUT', 'PATCH'):
            serializer.fields['folder'] = serializers.PrimaryKeyRelatedField(allow_null=True, queryset=Folder.objects.all(), required=False)
        return serializer


# class UserSharedFilesEndpoint(views.APIView):
#     def post(self, request, pk):
#         serializer = SharedFileSerializer(data=request.data, exclude_fields=['user'])
#         serializer.fields['file'] = serializers.PrimaryKeyRelatedField(queryset=File.objects.all())
#         user = get_object_or_404(User, id=pk)
#         serializer.initial_data['user'] = user
#         if serializer.is_valid():
#             serializer.save(user=user)
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class FileSharedFilesEndpoint(views.APIView):
    def check_permissions(self, request):
        message = 'You do not have permission to perform this action.'
        if not request.user or not request.user.is_authenticated:
            self.permission_denied(request, message)

        file = get_object_or_404(File, id=self.kwargs['pk'])
        if request.user.role == User.Roles.USER:
            if request.user != file.user:
                self.permission_denied(request, message)

        if request.user.role == User.Roles.MODERATOR:
            if request.user != file.user and file.user.role != User.Roles.USER:
                self.permission_denied(request, message)

    def post(self, request, pk):
        serializer = SharedFileSerializer(data=request.data, exclude_fields=['file'])
        serializer.fields['user'] = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
        file = get_object_or_404(File, id=pk)
        serializer.initial_data['file'] = file
        if serializer.is_valid():
            serializer.save(file=file)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SharedFilesEndpoint(views.APIView):
    permission_classes = [IsAdmin]

    def delete(self, request, format=None):
        instances = SharedFile.objects.all()
        instances.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class SharedFileEndpoint(mixins.UpdateModelMixin, mixins.DestroyModelMixin, generics.GenericAPIView):
    queryset = SharedFile.objects.all()
    serializer_class = SharedFileSerializer

    def check_object_permissions(self, request, obj):
        message = 'You do not have permission to perform this action.'
        if not request.user or not request.user.is_authenticated:
            self.permission_denied(request, message)

        if request.user.role == User.Roles.USER:
            if request.user != obj.file.user:
                self.permission_denied(request, message)

        if request.user.role == User.Roles.MODERATOR:
            if request.user != obj.user and obj.user.role != User.Roles.USER:
                self.permission_denied(request, message)

    def get_serializer(self, *args, **kwargs):
        serializer_class = self.get_serializer_class()
        kwargs.setdefault('context', self.get_serializer_context())
        kwargs['exclude_fields'] = ['user', 'file']
        return serializer_class(*args, **kwargs)

    def get_object(self):
        user_id = self.kwargs['user_id']
        file_id = self.kwargs['file_id']
        shared_file = get_object_or_404(SharedFile, user=user_id, file_id=file_id)
        self.check_object_permissions(self.request, shared_file)
        return shared_file

    def patch(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        return self.destroy(request, *args, **kwargs)


class UsersByCharsWritten(generics.ListAPIView):
    serializer_class = UsersByCharsWrittenSerializer
    pagination_class = Pagination
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = User.objects.annotate(written_chars=Sum(Length('personal_files__content'))).order_by('-written_chars')
        return queryset


class FoldersByFilesSharedUsers(generics.ListAPIView):
    serializer_class = FoldersByFilesSharedUsersSerializer
    pagination_class = Pagination
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Folder.objects.annotate(num_shared_users=Count('files__shared_users')).order_by('-num_shared_users')
        return queryset


class FoldersByNumFiles(generics.ListAPIView):
    serializer_class = FoldersByNumFilesSerializer
    pagination_class = Pagination
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Folder.objects.annotate(num_files=Count('files')).order_by('-num_files')
        return queryset


class PopulateUsersEndpoint(views.APIView):
    permission_classes = [IsAdmin]

    def post(self, request, format=True):
        if 'sqlite3' in os.getenv('DB_ENGINE'):
            execute_sqlite('brainbox/fake_data/user_data.sql')
            execute_sqlite('brainbox/fake_data/userprofile_data.sql')
            return Response({'details': ['Done.']}, status=status.HTTP_200_OK)

        if 'postgresql' in os.getenv('DB_ENGINE'):
            execute_postgresql('brainbox/fake_data/user_data.sql')
            execute_postgresql('brainbox/fake_data/userprofile_data.sql')
            return Response({'details': ['Done.']}, status=status.HTTP_200_OK)

        return Response({'details': ['An error has occurred.']}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PopulateFoldersEndpoint(views.APIView):
    permission_classes = [IsAdmin]

    def post(self, request, format=True):
        if 'sqlite3' in os.getenv('DB_ENGINE'):
            execute_sqlite('brainbox/fake_data/folder_data.sql')
            return Response({'details': ['Done.']}, status=status.HTTP_200_OK)

        if 'postgresql' in os.getenv('DB_ENGINE'):
            execute_postgresql('brainbox/fake_data/folder_data.sql')
            return Response({'details': ['Done.']}, status=status.HTTP_200_OK)

        return Response({'details': ['An error has occurred.']}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PopulateFilesEndpoint(views.APIView):
    permission_classes = [IsAdmin]

    def post(self, request, format=True):
        if 'sqlite3' in os.getenv('DB_ENGINE'):
            execute_sqlite('brainbox/fake_data/file_data.sql')
            return Response({'details': ['Done.']}, status=status.HTTP_200_OK)

        if 'postgresql' in os.getenv('DB_ENGINE'):
            execute_postgresql('brainbox/fake_data/file_data.sql')
            return Response({'details': ['Done.']}, status=status.HTTP_200_OK)

        return Response({'details': ['An error has occurred.']}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PopulateSharedFilesEndpoint(views.APIView):
    permission_classes = [IsAdmin]

    def post(self, request, format=True):
        if 'sqlite3' in os.getenv('DB_ENGINE'):
            execute_sqlite('brainbox/fake_data/sharedfile_data.sql')
            return Response({'details': ['Done.']}, status=status.HTTP_200_OK)

        if 'postgresql' in os.getenv('DB_ENGINE'):
            execute_postgresql('brainbox/fake_data/sharedfile_data.sql')
            return Response({'details': ['Done.']}, status=status.HTTP_200_OK)

        return Response({'details': ['An error has occurred.']}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
