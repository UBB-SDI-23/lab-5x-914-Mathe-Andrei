from rest_framework.permissions import BasePermission, SAFE_METHODS
from rest_framework.permissions import IsAuthenticatedOrReadOnly

from brainbox.models import *


class IsOwnerOrReadOnly(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True

        if hasattr(obj, "user"):
            return request.user == obj.user
        return request.user == obj


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and request.user.role == User.Roles.ADMIN
        )


class HasHigherRoleOrIsOwnerPermission(BasePermission):
    def has_object_permission(self, request, view, obj):
        auth_user_role = request.user.role
        obj_user_role = obj.user.role if hasattr(obj, "user") else obj.role

        if auth_user_role == User.Roles.MODERATOR and obj_user_role == User.Roles.USER:
            return True
        if auth_user_role == User.Roles.ADMIN:
            return True

        if request.user == (obj.user if hasattr(obj, "user") else obj):
            return True

        return False
