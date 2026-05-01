from django.urls import path
from . import views

urlpatterns = [
    # Auth
    path('register/', views.register, name='register'),
    path('verify-email/', views.verify_email, name='verify_email'),
    path('resend-verification/', views.resend_verification, name='resend_verification'),
    path('login/', views.login, name='login'),
    path('token/refresh/', views.token_refresh, name='token_refresh'),
    path('forgot-password/', views.forgot_password, name='forgot_password'),
    path('reset-password/', views.reset_password, name='reset_password'),

    # Profile
    path('user/me/', views.profile, name='profile'),
    path('user/<uuid:user_id>/', views.public_profile, name='public_profile'),

    # Account lifecycle
    path('user/deactivate/', views.deactivate_account, name='deactivate_account'),
    path('user/restore/', views.restore_account, name='restore_account'),
    path('user/delete/', views.delete_account, name='delete_account'),

    # Admin
    path('admin/users/<uuid:user_id>/ban/', views.admin_ban_user, name='admin_ban_user'),
    path('admin/users/<uuid:user_id>/unban/', views.admin_unban_user, name='admin_unban_user'),
]
