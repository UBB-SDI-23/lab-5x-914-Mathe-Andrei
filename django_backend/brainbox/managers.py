from django.contrib.auth.base_user import BaseUserManager
from django.core.mail import send_mail
from rest_framework import exceptions


class SMTPError(exceptions.APIException):
    status_code = 500
    default_detail = 'Could not send confirmation email.'
    default_code = 'smtp_error'


class UserManager(BaseUserManager):
    """
    Custom user model manager where email is the unique identifiers
    for authentication instead of usernames.
    """
    def create_user(self, username, email, password, **extra_fields):
        """
        Create and save an inactive user with the given email and password.
        Send a registration code via email.
        """
        if not username:
            raise ValueError('The Username must be set.')
        if not email:
            raise ValueError('The Email must be set.')
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save()

        # create user profile
        from brainbox.models import UserProfile
        profile = UserProfile.objects.create(user=user)
        profile.save()

        # generate registration code
        from brainbox.models import RegistrationCode
        registration_code = RegistrationCode.generate_code(user)

        # send confirmation email
        from django_backend import settings
        subject = 'Brainbox - Confirm your account'
        message = f"Your confirmation code is {registration_code.code}. The code will expire in 10 minutes."
        try:
            send_mail(subject, message, settings.EMAIL_HOST_USER, [email], fail_silently=False)
        except Exception as e:
            user.delete()
            raise SMTPError()

        return user

    def update_user(self, user, username=None, email=None, password=None, **extra_fields):
        """
        Update the specified user with the given data.
        """
        if username:
            user.username = username
        if email:
            user.email = self.normalize_email(email)
        if password:
            user.set_password(password)
        for key, value in extra_fields.items():
            setattr(user, key, value)
        user.save()
        return user

    def create_superuser(self, username, email, password, **extra_fields):
        """
        Create and save a SuperUser with the given email and password.
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        return self.create_user(username, email, password, **extra_fields)
