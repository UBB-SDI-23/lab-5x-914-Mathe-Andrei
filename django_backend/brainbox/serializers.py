import datetime

from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from brainbox.models import *
from brainbox import validators


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['user_role'] = user.role
        return token


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
    password = serializers.CharField(max_length=128, write_only=True)
    role = serializers.ChoiceField(choices=User.Roles.choices, read_only=True)
    num_personal_files = serializers.IntegerField(read_only=True)

    def validate_password(self, password):
        validators.validate_password(password)
        return password

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'role', 'created_at', 'updated_at', 'num_personal_files']


class UserRoleSerializer(serializers.ModelSerializer):
    def update(self, user, validated_data):
        return User.objects.update_user(user, **validated_data)

    class Meta:
        model = User
        fields = ['id', 'role']


class UserProfileSerializerDetail(serializers.ModelSerializer):
    def validate_birthday(self, birthday):
        if birthday is not None:
            if birthday > datetime.datetime.now().date():
                raise serializers.ValidationError('Birthday is invalid.')
        return birthday

    def validate_page_size(self, page_size):
        if page_size is not None:
            if page_size <= 0:
                raise serializers.ValidationError('Page size must be strictly positive.')
        return page_size

    class Meta:
        model = UserProfile
        fields = ['id', 'bio', 'birthday', 'website', 'dark_mode', 'page_size']


class FolderSerializerList(serializers.ModelSerializer):
    num_files = serializers.IntegerField(read_only=True)

    def validate(self, data):
        errors = {}
        try:
            data = super().validate(data)
        except serializers.ValidationError as ve:
            errors = ve.detail

        user = data['user']
        auth_user = self.context['request'].user
        if auth_user.role == User.Roles.USER:
            if auth_user != user:
                errors['user'] = ['User must be the authenticated user.']

        parent_folder = data['parent_folder']
        if parent_folder is not None and user != parent_folder.user:
            errors['parent_folder'] = ['Parent folder must be created by the same user.']

        if errors:
            raise serializers.ValidationError(errors)

        return data

    def to_representation(self, instance):
        if self.context['request'].method == "GET":
            self.fields['user'] = UserSerializerList()
        return super().to_representation(instance)

    class Meta:
        model = Folder
        fields = ['id', 'name', 'user', 'parent_folder', 'created_at', 'updated_at', 'num_files']


class FileSerializerList(serializers.ModelSerializer):
    num_shared_users = serializers.IntegerField(read_only=True)

    def validate(self, data):
        errors = {}
        try:
            data = super().validate(data)
        except serializers.ValidationError as ve:
            errors = ve.detail

        user = data['user']
        auth_user = self.context['request'].user
        if auth_user.role == User.Roles.USER:
            if auth_user != user:
                errors['user'] = ['User must be the authenticated user.']

        folder = data['folder']
        if folder is not None and user != folder.user:
            errors['folder'] = ['Folder must be created by the same user.']

        if errors:
            raise serializers.ValidationError(errors)

        return data

    def to_representation(self, instance):
        if self.context['request'].method == "GET":
            self.fields['user'] = UserSerializerList()
        return super().to_representation(instance)

    class Meta:
        model = File
        fields = ['id', 'name', 'content', 'folder', 'user', 'created_at', 'updated_at', 'num_shared_users']


class SharedFileSerializer(DynamicFieldsModelSerializer):
    user = UserSerializerList(read_only=True)
    file = FileSerializerList(read_only=True)

    def validate(self, data):
        errors = {}
        try:
            data = super().validate(data)
        except serializers.ValidationError as ve:
            errors = ve.detail

        if 'user' in data:
            user = data['user']
            file = self.initial_data['file']
            if file.user == user:
                errors['user'] = ['User cannot be the owner of the file.']
        if 'file' in data:
            file = data['file']
            user = self.initial_data['user']
            if user == file.user:
                errors['file'] = ['File cannot be shared to its owner.']

        if errors:
            raise serializers.ValidationError(errors)

        return data

    class Meta:
        model = SharedFile
        fields = ['id', 'user', 'file', 'permission']


class UserSerializerDetail(serializers.ModelSerializer):
    password = serializers.CharField(max_length=128, write_only=True)
    role = serializers.ChoiceField(choices=User.Roles.choices, read_only=True)
    profile = UserProfileSerializerDetail()
    personal_files = FileSerializerList(many=True, read_only=True)
    folders = FolderSerializerList(many=True, read_only=True)
    shared_files = SharedFileSerializer(many=True, read_only=True, exclude_fields=['user'])

    def update(self, user, validated_data):
        if "profile" in validated_data:
            profile_data = validated_data.pop('profile')
            profile_serializer = UserProfileSerializerDetail(instance=self.instance.profile, data=profile_data, partial=True)
            if profile_serializer.is_valid(raise_exception=True):
                profile_serializer.save()
        return User.objects.update_user(user, **validated_data)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'role', 'created_at', 'updated_at', 'profile', 'personal_files', 'folders', 'shared_files']


class FolderSerializerDetail(serializers.ModelSerializer):
    user = UserSerializerList(read_only=True)
    parent_folder = FolderSerializerList()
    files = FileSerializerList(many=True, read_only=True)

    def validate_parent_folder(self, parent_folder):
        if parent_folder is not None:
            if parent_folder == self.instance:
                raise serializers.ValidationError('Folder cannot be its own parent folder.')
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
        fields = ['id', 'username', 'email', 'written_chars', 'created_at', 'updated_at']


class FoldersByFilesSharedUsersSerializer(serializers.ModelSerializer):
    num_shared_users = serializers.IntegerField()

    class Meta:
        model = Folder
        fields = ['id', 'name', 'user', 'parent_folder', 'num_shared_users', 'created_at', 'updated_at']


class FoldersByNumFilesSerializer(serializers.ModelSerializer):
    num_files = serializers.IntegerField()

    class Meta:
        model = Folder
        fields = ['id', 'name', 'user', 'parent_folder', 'num_files', 'created_at', 'updated_at']
