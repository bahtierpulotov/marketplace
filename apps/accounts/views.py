import json
from datetime import timedelta
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST, require_GET
from django.utils import timezone
from django.shortcuts import get_object_or_404

from .models import User, EmailVerificationCode
from .utils import (
    generate_tokens, decode_jwt, generate_code,
    send_verification_email, send_reset_email, user_to_dict
)
from middleware.jwt_auth import require_auth


# ─── REGISTER ────────────────────────────────────────────────────────────────

@csrf_exempt
@require_POST
def register(request):
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    email = data.get('email', '').lower().strip()
    password = data.get('password', '')
    full_name = data.get('full_name', '').strip()

    if not email or not password:
        return JsonResponse({'error': 'Email and password are required'}, status=400)
    if len(password) < 8:
        return JsonResponse({'error': 'Password must be at least 8 characters'}, status=400)
    if User.objects.filter(email=email).exists():
        return JsonResponse({'error': 'Email already registered'}, status=400)

    user = User.objects.create_user(
        email=email, password=password, full_name=full_name, is_verified=False
    )

    code = generate_code()
    EmailVerificationCode.objects.create(
        user=user, code=code, purpose='verify',
        expires_at=timezone.now() + timedelta(minutes=15)
    )
    try:
        send_verification_email(email, code)
    except Exception:
        pass  # Don't fail registration if email fails; log in production

    return JsonResponse({'message': 'Registration successful. Check your email for the verification code.'}, status=201)


# ─── VERIFY EMAIL ─────────────────────────────────────────────────────────────

@csrf_exempt
@require_POST
def verify_email(request):
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    email = data.get('email', '').lower().strip()
    code = data.get('code', '').strip()

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)

    vc = EmailVerificationCode.objects.filter(
        user=user, code=code, purpose='verify', used=False
    ).order_by('-created_at').first()

    if not vc or not vc.is_valid():
        return JsonResponse({'error': 'Invalid or expired code'}, status=400)

    user.is_verified = True
    user.save()
    vc.used = True
    vc.save()

    tokens = generate_tokens(user)
    return JsonResponse({
        'message': 'Email verified successfully',
        'user': user_to_dict(user, include_private=True),
        **tokens,
    })


# ─── RESEND VERIFICATION ──────────────────────────────────────────────────────

@csrf_exempt
@require_POST
def resend_verification(request):
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    email = data.get('email', '').lower().strip()
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)

    if user.is_verified:
        return JsonResponse({'error': 'Email already verified'}, status=400)

    code = generate_code()
    EmailVerificationCode.objects.create(
        user=user, code=code, purpose='verify',
        expires_at=timezone.now() + timedelta(minutes=15)
    )
    try:
        send_verification_email(email, code)
    except Exception:
        pass

    return JsonResponse({'message': 'Verification code sent'})


# ─── LOGIN ────────────────────────────────────────────────────────────────────

@csrf_exempt
@require_POST
def login(request):
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    email = data.get('email', '').lower().strip()
    password = data.get('password', '')

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return JsonResponse({'error': 'Invalid credentials'}, status=401)

    if not user.check_password(password):
        return JsonResponse({'error': 'Invalid credentials'}, status=401)
    if not user.is_verified:
        return JsonResponse({'error': 'Please verify your email first'}, status=403)
    if user.is_banned:
        return JsonResponse({'error': 'Account is banned'}, status=403)
    if not user.is_active:
        return JsonResponse({'error': 'Account is deactivated. Use /api/restore/ to restore it.'}, status=403)

    tokens = generate_tokens(user)
    return JsonResponse({'user': user_to_dict(user, include_private=True), **tokens})


# ─── TOKEN REFRESH ────────────────────────────────────────────────────────────

@csrf_exempt
@require_POST
def token_refresh(request):
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    refresh_token = data.get('refresh', '')
    try:
        payload = decode_jwt(refresh_token)
        if payload.get('type') != 'refresh':
            raise ValueError('Not a refresh token')
        user = User.objects.get(id=payload['user_id'])
        from .utils import generate_jwt
        access = generate_jwt(user, 'access')
        return JsonResponse({'access': access})
    except Exception:
        return JsonResponse({'error': 'Invalid or expired refresh token'}, status=401)


# ─── FORGOT PASSWORD ──────────────────────────────────────────────────────────

@csrf_exempt
@require_POST
def forgot_password(request):
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    email = data.get('email', '').lower().strip()
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        # Don't reveal whether email exists
        return JsonResponse({'message': 'If that email exists, a code has been sent.'})

    code = generate_code()
    EmailVerificationCode.objects.create(
        user=user, code=code, purpose='reset',
        expires_at=timezone.now() + timedelta(minutes=15)
    )
    try:
        send_reset_email(email, code)
    except Exception:
        pass

    return JsonResponse({'message': 'If that email exists, a code has been sent.'})


# ─── RESET PASSWORD ───────────────────────────────────────────────────────────

@csrf_exempt
@require_POST
def reset_password(request):
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    email = data.get('email', '').lower().strip()
    code = data.get('code', '').strip()
    new_password = data.get('new_password', '')

    if len(new_password) < 8:
        return JsonResponse({'error': 'Password must be at least 8 characters'}, status=400)

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return JsonResponse({'error': 'Invalid request'}, status=400)

    vc = EmailVerificationCode.objects.filter(
        user=user, code=code, purpose='reset', used=False
    ).order_by('-created_at').first()

    if not vc or not vc.is_valid():
        return JsonResponse({'error': 'Invalid or expired code'}, status=400)

    user.set_password(new_password)
    user.save()
    vc.used = True
    vc.save()

    return JsonResponse({'message': 'Password reset successfully'})


# ─── PROFILE ──────────────────────────────────────────────────────────────────

@csrf_exempt
@require_auth
def profile(request):
    user = request.user_jwt

    if request.method == 'GET':
        return JsonResponse({'user': user_to_dict(user, include_private=True)})

    if request.method in ('PUT', 'PATCH'):
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)

        user.full_name = data.get('full_name', user.full_name)
        user.phone = data.get('phone', user.phone)
        user.save()
        return JsonResponse({'user': user_to_dict(user, include_private=True)})

    return JsonResponse({'error': 'Method not allowed'}, status=405)


# ─── PUBLIC PROFILE ───────────────────────────────────────────────────────────

@require_GET
def public_profile(request, user_id):
    user = get_object_or_404(User, id=user_id, is_active=True, is_banned=False)
    return JsonResponse({'user': user_to_dict(user, include_private=False)})


# ─── ACCOUNT LIFECYCLE ────────────────────────────────────────────────────────

@csrf_exempt
@require_auth
@require_POST
def deactivate_account(request):
    user = request.user_jwt
    user.is_active = False
    user.save()
    return JsonResponse({'message': 'Account deactivated. Your listings are now hidden.'})


@csrf_exempt
@require_POST
def restore_account(request):
    """Restore a deactivated account using email + password."""
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    email = data.get('email', '').lower().strip()
    password = data.get('password', '')

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return JsonResponse({'error': 'Invalid credentials'}, status=401)

    if not user.check_password(password):
        return JsonResponse({'error': 'Invalid credentials'}, status=401)
    if user.is_banned:
        return JsonResponse({'error': 'Account is banned and cannot be restored'}, status=403)

    user.is_active = True
    user.save()
    tokens = generate_tokens(user)
    return JsonResponse({'message': 'Account restored successfully', **tokens})


@csrf_exempt
@require_auth
@require_POST
def delete_account(request):
    user = request.user_jwt
    # Soft delete: anonymize and deactivate
    user.email = f'deleted_{user.id}@deleted.marketplace'
    user.full_name = 'Deleted User'
    user.phone = ''
    user.is_active = False
    user.is_verified = False
    user.set_unusable_password()
    user.save()
    return JsonResponse({'message': 'Account permanently deleted'})


# ─── ADMIN: BAN/UNBAN ─────────────────────────────────────────────────────────

@csrf_exempt
def admin_ban_user(request, user_id):
    if not request.user_jwt or not request.user_jwt.is_staff:
        return JsonResponse({'error': 'Admin access required'}, status=403)
    user = get_object_or_404(User, id=user_id)
    user.is_banned = True
    user.save()
    return JsonResponse({'message': f'User {user.email} has been banned'})


@csrf_exempt
def admin_unban_user(request, user_id):
    if not request.user_jwt or not request.user_jwt.is_staff:
        return JsonResponse({'error': 'Admin access required'}, status=403)
    user = get_object_or_404(User, id=user_id)
    user.is_banned = False
    user.save()
    return JsonResponse({'message': f'User {user.email} has been unbanned'})
