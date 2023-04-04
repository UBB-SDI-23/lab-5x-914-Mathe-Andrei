from rest_framework import serializers
from rest_framework.generics import get_object_or_404

from brainbox.models import *


class DynamicFieldsModelSerializer(serializers.ModelSerializer):
    """
    A ModelSerializer that takes an additional `fields` argument that
    controls which fields should be displayed.
    """
    def __init__(self, *args, **kwargs):
        kwargs.pop('fields', None)
        exclude_fields = kwargs.pop('exclude_fields', None)

        # Instantiate the superclass normally
        super().__init__(*args, **kwargs)

        if exclude_fields is not None:
            for field in exclude_fields:
                split = field.split('__')
                to_access = self.fields
                for i in range(len(split)-1):
                    to_access = to_access.get(split[i])
                if isinstance(to_access, serializers.ListSerializer):
                    to_access = to_access.child
                to_access.fields.pop(split[-1])


class UserSerializerList(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'created_at', 'updated_at']


class FolderSerializerList(serializers.ModelSerializer):
    def validate_parent_folder(self, parent_folder):
        if parent_folder is not None:
            user = self.initial_data['user']
            if parent_folder.user != user:
                raise serializers.ValidationError('Parent folder must be created by the same user.')
        return parent_folder

    class Meta:
        model = Folder
        fields = ['id', 'name', 'user', 'parent_folder', 'created_at', 'updated_at']


class FileSerializerList(serializers.ModelSerializer):
    def validate_folder(self, folder):
        if folder is not None:
            user = self.initial_data['user']
            if folder.user != user:
                raise serializers.ValidationError('Folder must be created by the same user.')
        return folder

    class Meta:
        model = File
        fields = ['id', 'name', 'content', 'folder', 'user', 'created_at', 'updated_at']


class SharedFileSerializer(DynamicFieldsModelSerializer):
    def validate(self, data):
        errors = {}
        try:
            data = super().validate(data)
        except serializers.ValidationError as ve:
            errors = ve.detail

        if 'user' in data:
            user = data['user']
            file = self.initial_data['file']
            if file.user != user:
                errors['user'] = ['User cannot be the owner of the file.']
        if 'file' in data:
            file = data['file']
            user = self.initial_data['user']
            if user != file.user:
                errors['file'] = ['File cannot be shared to its owner.']

        if errors:
            raise serializers.ValidationError(errors)

        return data

    class Meta:
        model = SharedFile
        fields = ['id', 'user', 'file', 'permission']


class UserSerializerDetail(serializers.ModelSerializer):
    folders = FolderSerializerList(many=True, read_only=True)
    shared_files = SharedFileSerializer(many=True, read_only=True, exclude_fields=['user'])

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'created_at', 'updated_at', 'folders', 'shared_files']


class FolderSerializerDetail(serializers.ModelSerializer):
    user = UserSerializerList(read_only=True)
    parent_folder = FolderSerializerList()
    files = FileSerializerList(many=True, read_only=True)

    def validate_parent_folder(self, parent_folder):
        if parent_folder is not None:
            user = self.instance.user
            if parent_folder.user != user:
                raise serializers.ValidationError('Parent folder must be created by the same user.')
        return parent_folder

    class Meta:
        model = Folder
        fields = ['id', 'name', 'user', 'parent_folder', 'created_at', 'updated_at', 'files']


class FileSerializerDetail(serializers.ModelSerializer):
    folder = FolderSerializerList()
    user = UserSerializerList(read_only=True)
    shared_users = SharedFileSerializer(many=True, read_only=True, source='sharedfile_set', exclude_fields=['file'])

    # def to_representation(self, instance):
    #     result = super().to_representation(instance)
    #     if result['folder'] is not None:
    #         result['folder'] = FolderSerializerList().to_representation(instance=instance.folder)
    #     return result

    def validate_folder(self, folder):
        if folder is not None:
            user = self.instance.user
            if folder.user != user:
                raise serializers.ValidationError('Folder must be created by the same user.')
        return folder

    class Meta:
        model = File
        fields = ['id', 'name', 'content', 'folder', 'user', 'created_at', 'updated_at', 'shared_users']


class UsersByCharsWrittenSerializer(serializers.ModelSerializer):
    written_chars = serializers.IntegerField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'written_chars', 'created_at', 'updated_at']


class FoldersByFilesSharedUsersSerializer(serializers.ModelSerializer):
    num_shared_users = serializers.IntegerField()

    class Meta:
        model = Folder
        fields = ['id', 'name', 'user', 'parent_folder', 'num_shared_users', 'created_at', 'updated_at']


class FolderFilesSerializerList(serializers.ModelSerializer):
    id = serializers.IntegerField()

    def validate_id(self, file_id):
        file = get_object_or_404(File, pk=file_id)
        folder = self.context['folder']
        if file.user != folder.user:
            raise serializers.ValidationError('File and folder must be created by the same user.')
        return file_id

    def create(self, validated_data):
        file_id = validated_data['id']
        file = get_object_or_404(File, pk=file_id)
        file.folder = validated_data['folder']
        db = validated_data.get('using', None)
        file.save(using=db)
        return file

    class Meta:
        model = File
        fields = ['id']
