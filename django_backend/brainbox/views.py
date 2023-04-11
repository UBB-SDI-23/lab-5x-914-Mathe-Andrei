from django.db.models import Sum, Count
from django.db.models.functions import Length
from rest_framework import generics, mixins, views, status
from rest_framework.response import Response

from brainbox.serializers import *


class UsersEndpoint(generics.ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializerList


class UserEndpoint(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializerDetail


class FoldersEndpoint(generics.ListCreateAPIView):
    queryset = Folder.objects.all()
    serializer_class = FolderSerializerList


class FolderEndpoint(generics.RetrieveUpdateDestroyAPIView):
    queryset = Folder.objects.all()
    serializer_class = FolderSerializerDetail

    def get_serializer(self, *args, **kwargs):
        serializer_class = self.get_serializer_class()
        kwargs.setdefault('context', self.get_serializer_context())
        serializer = serializer_class(*args, **kwargs)
        if self.request.method in ('PUT', 'PATCH'):
            serializer.fields['parent_folder'] = serializers.PrimaryKeyRelatedField(allow_null=True, queryset=Folder.objects.all(), required=False)
        return serializer


class FilesEndpoint(generics.ListCreateAPIView):
    queryset = File.objects.all()
    serializer_class = FileSerializerList


class FileEndpoint(generics.RetrieveUpdateDestroyAPIView):
    queryset = File.objects.all()
    serializer_class = FileSerializerDetail

    def get_serializer(self, *args, **kwargs):
        serializer_class = self.get_serializer_class()
        kwargs.setdefault('context', self.get_serializer_context())
        serializer = serializer_class(*args, **kwargs)
        if self.request.method in ('PUT', 'PATCH'):
            serializer.fields['folder'] = serializers.PrimaryKeyRelatedField(allow_null=True, queryset=Folder.objects.all(), required=False)
        return serializer


class UserSharedFilesEndpoint(views.APIView):
    def post(self, request, pk):
        serializer = SharedFileSerializer(data=request.data, exclude_fields=['user'])
        user = get_object_or_404(User, id=pk)
        serializer.initial_data['user'] = user
        if serializer.is_valid():
            serializer.save(user=user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_204_NO_CONTENT)


class FileSharedFilesEndpoint(views.APIView):
    def post(self, request, pk):
        serializer = SharedFileSerializer(data=request.data, exclude_fields=['file'])
        file = get_object_or_404(File, id=pk)
        serializer.initial_data['file'] = file
        if serializer.is_valid():
            serializer.save(file=file)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_204_NO_CONTENT)


class SharedFileEndpoint(mixins.UpdateModelMixin, mixins.DestroyModelMixin, generics.GenericAPIView):
    queryset = SharedFile.objects.all()
    serializer_class = SharedFileSerializer

    def get_serializer(self, *args, **kwargs):
        serializer_class = self.get_serializer_class()
        kwargs.setdefault('context', self.get_serializer_context())
        kwargs['exclude_fields'] = ['user', 'file']
        return serializer_class(*args, **kwargs)

    def get_object(self):
        user_id = self.kwargs['user_id']
        file_id = self.kwargs['file_id']
        shared_file = get_object_or_404(SharedFile, user=user_id, file_id=file_id)
        return shared_file

    def patch(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        return self.destroy(request, *args, **kwargs)


class UsersByCharsWritten(generics.ListAPIView):
    serializer_class = UsersByCharsWrittenSerializer

    def get_queryset(self):
        queryset = User.objects.annotate(written_chars=Sum(Length('personal_files__content'))).order_by('-written_chars')
        return queryset


class FoldersByFilesSharedUsers(generics.ListAPIView):
    serializer_class = FoldersByFilesSharedUsersSerializer

    def get_queryset(self):
        queryset = Folder.objects.annotate(num_shared_users=Count('files__shared_users')).order_by('-num_shared_users')
        return queryset


class FolderFilesEndpoint(views.APIView):
    def post(self, request, pk):
        serializer = FolderFilesSerializerList(data=request.data, many=True)
        folder = get_object_or_404(Folder, id=pk)
        serializer.context['folder'] = folder
        if serializer.is_valid():
            serializer.save(folder=folder, using='')
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_204_NO_CONTENT)