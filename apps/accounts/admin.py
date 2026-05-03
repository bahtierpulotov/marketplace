from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from django.db.models import Count
from .models import User, EmailVerificationCode


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = (
        'avatar_preview', 'email', 'full_name', 'phone',
        'products_count', 'is_verified', 'is_active', 'is_banned', 'is_staff', 'created_at'
    )
    list_display_links = ('email', 'full_name')
    list_filter = ('is_verified', 'is_active', 'is_banned', 'is_staff', 'created_at')
    search_fields = ('email', 'full_name', 'phone')
    ordering = ('-created_at',)
    readonly_fields = ('id', 'created_at', 'updated_at', 'avatar_preview_large')
    actions = ['ban_users', 'unban_users', 'activate_users', 'deactivate_users', 'verify_users']
    list_per_page = 25

    fieldsets = (
        ('🔐 Аккаунт', {'fields': ('id', 'email', 'password')}),
        ('👤 Маълумоти шахсӣ', {'fields': ('full_name', 'phone', 'avatar', 'avatar_preview_large')}),
        ('✅ Ҳолат', {'fields': ('is_verified', 'is_active', 'is_banned', 'is_staff', 'is_superuser')}),
        ('🕐 Вақт', {'fields': ('created_at', 'updated_at')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'full_name', 'phone', 'password1', 'password2', 'is_staff', 'is_verified'),
        }),
    )

    def get_queryset(self, request):
        return super().get_queryset(request).annotate(
            _products_count=Count('products')
        )

    def avatar_preview(self, obj):
        if obj.avatar:
            return format_html(
                '<img src="{}" style="width:36px;height:36px;border-radius:50%;object-fit:cover"/>',
                obj.avatar.url
            )
        initials = (obj.full_name or obj.email)[0].upper()
        return format_html(
            '<div style="width:36px;height:36px;border-radius:50%;background:#6366f1;'
            'color:#fff;display:flex;align-items:center;justify-content:center;'
            'font-weight:700;font-size:14px">{}</div>', initials
        )
    avatar_preview.short_description = ''

    def avatar_preview_large(self, obj):
        if obj.avatar:
            return format_html(
                '<img src="{}" style="width:80px;height:80px;border-radius:50%;object-fit:cover"/>',
                obj.avatar.url
            )
        return '-'
    avatar_preview_large.short_description = 'Аватар'

    def products_count(self, obj):
        count = obj._products_count
        if count > 0:
            return format_html(
                '<span style="background:#ede9fe;color:#7c3aed;padding:2px 8px;'
                'border-radius:99px;font-weight:600;font-size:12px">{}</span>', count
            )
        return format_html('<span style="color:#9ca3af">0</span>')
    products_count.short_description = 'Эълонҳо'
    products_count.admin_order_field = '_products_count'

    def ban_users(self, request, queryset):
        count = queryset.update(is_banned=True)
        self.message_user(request, f'🚫 {count} корбар бан шуд.')
    ban_users.short_description = '🚫 Бан кардан'

    def unban_users(self, request, queryset):
        count = queryset.update(is_banned=False)
        self.message_user(request, f'✅ {count} корбар аз бан озод шуд.')
    unban_users.short_description = '✅ Аз бан озод кардан'

    def activate_users(self, request, queryset):
        count = queryset.update(is_active=True)
        self.message_user(request, f'▶️ {count} корбар фаъол шуд.')
    activate_users.short_description = '▶️ Фаъол кардан'

    def deactivate_users(self, request, queryset):
        count = queryset.update(is_active=False)
        self.message_user(request, f'⏸ {count} корбар ғайрифаъол шуд.')
    deactivate_users.short_description = '⏸ Ғайрифаъол кардан'

    def verify_users(self, request, queryset):
        count = queryset.update(is_verified=True)
        self.message_user(request, f'✔️ {count} корбар тасдиқ шуд.')
    verify_users.short_description = '✔️ Тасдиқ кардан'


@admin.register(EmailVerificationCode)
class EmailVerificationCodeAdmin(admin.ModelAdmin):
    list_display = ('user', 'purpose', 'code', 'status_badge', 'expires_at', 'created_at')
    list_filter = ('purpose', 'used')
    search_fields = ('user__email', 'code')
    readonly_fields = ('id', 'created_at')
    list_per_page = 30

    def status_badge(self, obj):
        if obj.used:
            return format_html(
                '<span style="background:#dcfce7;color:#16a34a;padding:2px 8px;border-radius:99px;font-size:12px">✅ Истифода шуд</span>'
            )
        from django.utils import timezone
        if timezone.now() > obj.expires_at:
            return format_html(
                '<span style="background:#fef2f2;color:#dc2626;padding:2px 8px;border-radius:99px;font-size:12px">❌ Мӯҳлат гузашт</span>'
            )
        return format_html(
            '<span style="background:#fef9c3;color:#854d0e;padding:2px 8px;border-radius:99px;font-size:12px">⏳ Фаъол</span>'
        )
    status_badge.short_description = 'Ҳолат'