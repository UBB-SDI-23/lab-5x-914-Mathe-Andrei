import random
import string
from datetime import timedelta

from django.contrib.auth.base_user import AbstractBaseUser
from django.contrib.auth.models import PermissionsMixin
from django.db import models
from django.utils import timezone

from brainbox.managers import UserManager


class User(AbstractBaseUser, PermissionsMixin):
    class Roles(models.TextChoices):
        USER = ('user', 'User')
        MODERATOR = ('moderator', 'Moderator')
        ADMIN = ('admin', 'Admin')

    username = models.CharField(max_length=50, unique=True)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=50, choices=Roles.choices, default=Roles.USER)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    EMAIL_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    objects = UserManager()

    def __str__(self):
        return f"username: {self.username}\temail: {self.email}"


class RegistrationCode(models.Model):
    code = models.CharField(max_length=5, unique=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    expires_at = models.DateTimeField()

    @staticmethod
    def generate_code(user):
        code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=5))
        expires_at = timezone.now() + timedelta(minutes=10)
        registration_code = RegistrationCode.objects.create(code=code, user=user, expires_at=expires_at)
        return registration_code


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(max_length=2000, blank=True)
    birthday = models.DateField(null=True, blank=True)
    website = models.URLField(blank=True)
    dark_mode = models.BooleanField(default=False, blank=True)
    page_size = models.PositiveIntegerField(default=25, blank=True)

    def __str__(self):
        return f"profile of user: {self.user.username}"


class Folder(models.Model):
    name = models.CharField(max_length=100, db_index=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='folders')
    parent_folder = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='child_folders')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"name: {self.name}"


class File(models.Model):
    name = models.CharField(max_length=100)
    content = models.TextField(blank=True, default='')
    folder = models.ForeignKey(Folder, on_delete=models.CASCADE, null=True, blank=True, related_name='files')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='personal_files')
    shared_users = models.ManyToManyField(User, through='SharedFile')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"name: {self.name}"


class SharedFile(models.Model):
    class Permissions(models.TextChoices):
        R = ('R', 'Read-Only')
        RW = ('RW', 'Read-Write')

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='shared_files')
    file = models.ForeignKey(File, on_delete=models.CASCADE)
    permission = models.CharField(max_length=2, choices=Permissions.choices)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'file'], name='unique_shared_file')
        ]
