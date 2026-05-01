import jwt
import random
import string
from datetime import timedelta
from django.conf import settings
from django.utils import timezone
from django.core.mail import send_mail


def generate_jwt(user, token_type='access'):
    """Generate access (15min) or refresh (7d) JWT token."""
    exp = timezone.now() + (
        timedelta(minutes=15) if token_type == 'access' else timedelta(days=7)
    )
    payload = {
        'user_id': str(user.id),
        'email': user.email,
        'type': token_type,
        'exp': exp,
        'iat': timezone.now(),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm='HS256')


def decode_jwt(token):
    return jwt.decode(token, settings.JWT_SECRET, algorithms=['HS256'])


def generate_tokens(user):
    return {
        'access': generate_jwt(user, 'access'),
        'refresh': generate_jwt(user, 'refresh'),
    }


def generate_code():
    return ''.join(random.choices(string.digits, k=6))


def send_verification_email(email, code):
    send_mail(
        subject='Your verification code — Marketplace',
        message=f'Your verification code is: {code}\n\nValid for 15 minutes.',
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[email],
        fail_silently=False,
    )


def send_reset_email(email, code):
    send_mail(
        subject='Password reset code — Marketplace',
        message=f'Your password reset code is: {code}\n\nValid for 15 minutes.',
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[email],
        fail_silently=False,
    )


def user_to_dict(user, include_private=False):
    data = {
        'id': str(user.id),
        'email': user.email,
        'full_name': user.full_name,
        'phone': user.phone if include_private else None,
        'avatar': user.avatar.url if user.avatar else None,
        'is_verified': user.is_verified,
        'is_active': user.is_active,
        'created_at': user.created_at.isoformat(),
    }
    if not include_private:
        data.pop('phone')
    return data
