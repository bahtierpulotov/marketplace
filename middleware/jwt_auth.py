import jwt
from django.conf import settings
from django.http import JsonResponse
import functools


class JWTAuthMiddleware:
    """Attach authenticated user to every request via JWT Bearer token."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request.user_jwt = None
        auth_header = request.headers.get('Authorization', '')
        if auth_header.startswith('Bearer '):
            token = auth_header[7:]
            try:
                payload = jwt.decode(token, settings.JWT_SECRET, algorithms=['HS256'])
                from apps.accounts.models import User
                user = User.objects.get(id=payload['user_id'])
                if user.is_active and not user.is_banned:
                    request.user_jwt = user
            except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, Exception):
                pass
        return self.get_response(request)


def require_auth(view_func):
    """Decorator: returns 401 if user is not authenticated via JWT."""
    @functools.wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if not request.user_jwt:
            return JsonResponse({'error': 'Authentication required'}, status=401)
        return view_func(request, *args, **kwargs)
    return wrapper


def require_admin(view_func):
    """Decorator: returns 403 if user is not staff/admin."""
    @functools.wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if not request.user_jwt:
            return JsonResponse({'error': 'Authentication required'}, status=401)
        if not request.user_jwt.is_staff:
            return JsonResponse({'error': 'Admin access required'}, status=403)
        return view_func(request, *args, **kwargs)
    return wrapper
