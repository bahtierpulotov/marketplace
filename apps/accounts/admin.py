from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, EmailVerificationCode


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'full_name', 'phone', 'is_verified', 'is_active', 'is_banned', 'is_staff', 'created_at')
    list_filter = ('is_verified', 'is_active', 'is_banned', 'is_staff', 'created_at')
    search_fields = ('email', 'full_name', 'phone')
    ordering = ('-created_at',)
    readonly_fields = ('id', 'created_at', 'updated_at')
    actions = ['ban_users', 'unban_users', 'activate_users', 'deactivate_users']

    fieldsets = (
        ('Account', {'fields': ('id', 'email', 'password')}),
        ('Personal Info', {'fields': ('full_name', 'phone', 'avatar')}),
        ('Status', {'fields': ('is_verified', 'is_active', 'is_banned', 'is_staff', 'is_superuser')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'full_name', 'password1', 'password2', 'is_staff', 'is_verified'),
        }),
    )

    def ban_users(self, request, queryset):
        queryset.update(is_banned=True)
        self.message_user(request, f'{queryset.count()} user(s) banned.')
    ban_users.short_description = '🚫 Ban selected users'

    def unban_users(self, request, queryset):
        queryset.update(is_banned=False)
        self.message_user(request, f'{queryset.count()} user(s) unbanned.')
    unban_users.short_description = '✅ Unban selected users'

    def activate_users(self, request, queryset):
        queryset.update(is_active=True)
        self.message_user(request, f'{queryset.count()} user(s) activated.')
    activate_users.short_description = '▶️ Activate selected users'

    def deactivate_users(self, request, queryset):
        queryset.update(is_active=False)
    deactivate_users.short_description = '⏸ Deactivate selected users'


@admin.register(EmailVerificationCode)
class EmailVerificationCodeAdmin(admin.ModelAdmin):
    list_display = ('user', 'purpose', 'code', 'used', 'expires_at', 'created_at')
    list_filter = ('purpose', 'used')
    search_fields = ('user__email', 'code')
    readonly_fields = ('id', 'created_at')
