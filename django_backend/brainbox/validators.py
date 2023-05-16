from rest_framework import exceptions
import re


def validate_password(password):
    """
    Verify the strength of 'password'
    Returns a ValidationError indicating the wrong criteria or
    None if 'password' is strong enough
    A password is considered strong if:
        - has 8 characters length or more
        - at least one digit
        - at least one symbol
        - at least one uppercase letter
        - at least one lowercase letter
    """
    length_error = len(password) < 8
    uppercase_error = re.search(r'[A-Z]', password) is None
    lowercase_error = re.search(r'[a-z]', password) is None
    digit_error = re.search(r'\d', password) is None
    symbol_error = re.search(r'[!&$@#%()*+\-/<=>?_^~]', password) is None

    strong_password = not (length_error or uppercase_error or lowercase_error or digit_error or symbol_error)

    if not strong_password:
        error_message = '''\
Password is too weak. It must have:
- at least 8 characters long
- at least one uppercase letter
- at least one lowercase letter
- at least one digit
- at least one symbol from !&$@#%()*+-/<=>?_^~\
'''
        raise exceptions.ValidationError(error_message)
