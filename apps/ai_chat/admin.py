from django.contrib import admin
from django.utils.html import format_html
from .models import ChatSession, ChatMessage, DirectChat, DirectMessage


class ChatMessageInline(admin.TabularInline):
    model = ChatMessage
    extra = 0
    readonly_fields = ('role_badge', 'content', 'timestamp')
    fields = ('role_badge', 'content', 'timestamp')
    can_delete = False
    max_num = 0

    def role_badge(self, obj):
        if obj.role == 'user':
            return format_html(
                '<span style="background:#dbeafe;color:#1d4ed8;padding:2px 8px;'
                'border-radius:99px;font-size:12px;font-weight:600">👤 Корбар</span>'
            )
        return format_html(
            '<span style="background:#ede9fe;color:#7c3aed;padding:2px 8px;'
            'border-radius:99px;font-size:12px;font-weight:600">🤖 AI</span>'
        )
    role_badge.short_description = 'Нақш'


@admin.register(ChatSession)
class ChatSessionAdmin(admin.ModelAdmin):
    list_display = ('user', 'product_link', 'message_count_badge', 'created_at', 'updated_at')
    search_fields = ('user__email', 'product__title')
    readonly_fields = ('id', 'created_at', 'updated_at')
    inlines = [ChatMessageInline]
    list_per_page = 25

    def product_link(self, obj):
        return format_html(
            '<a href="/admin/products/product/{}/change/" style="color:#6366f1">{}</a>',
            obj.product.id, obj.product.title
        )
    product_link.short_description = 'Маҳсулот'

    def message_count_badge(self, obj):
        count = obj.messages.count()
        return format_html(
            '<span style="background:#ede9fe;color:#7c3aed;padding:2px 8px;'
            'border-radius:99px;font-weight:600;font-size:12px">{} паём</span>', count
        )
    message_count_badge.short_description = 'Паёмҳо'


class DirectMessageInline(admin.TabularInline):
    model = DirectMessage
    extra = 0
    readonly_fields = ('sender_badge', 'content', 'is_read', 'timestamp')
    fields = ('sender_badge', 'content', 'is_read', 'timestamp')
    can_delete = False
    max_num = 0

    def sender_badge(self, obj):
        return format_html(
            '<span style="font-weight:600;color:var(--primary)">{}</span>',
            obj.sender.full_name or obj.sender.email
        )
    sender_badge.short_description = 'Фиристанда'


@admin.register(DirectChat)
class DirectChatAdmin(admin.ModelAdmin):
    list_display = (
        'buyer_display', 'product_link', 'seller_display',
        'message_count_badge', 'unread_badge', 'updated_at'
    )
    search_fields = ('buyer__email', 'buyer__full_name', 'product__title')
    readonly_fields = ('id', 'created_at', 'updated_at')
    inlines = [DirectMessageInline]
    list_per_page = 25

    def buyer_display(self, obj):
        return format_html(
            '<span style="font-weight:600">👤 {}</span>',
            obj.buyer.full_name or obj.buyer.email
        )
    buyer_display.short_description = 'Харидор'

    def seller_display(self, obj):
        return format_html(
            '<span style="color:#6366f1;font-weight:600">🏪 {}</span>',
            obj.product.owner.full_name or obj.product.owner.email
        )
    seller_display.short_description = 'Фурӯшанда'

    def product_link(self, obj):
        return format_html(
            '<a href="/admin/products/product/{}/change/" style="color:#6366f1">{}</a>',
            obj.product.id, obj.product.title[:40]
        )
    product_link.short_description = 'Маҳсулот'

    def message_count_badge(self, obj):
        count = obj.messages.count()
        return format_html(
            '<span style="background:#f3f4f6;color:#374151;padding:2px 8px;'
            'border-radius:99px;font-size:12px">{} паём</span>', count
        )
    message_count_badge.short_description = 'Паёмҳо'

    def unread_badge(self, obj):
        count = obj.messages.filter(is_read=False).count()
        if count:
            return format_html(
                '<span style="background:#fef2f2;color:#dc2626;padding:2px 8px;'
                'border-radius:99px;font-weight:700;font-size:12px">🔴 {}</span>', count
            )
        return format_html('<span style="color:#9ca3af;font-size:12px">✓ Ҳама хонда шуд</span>')
    unread_badge.short_description = 'Нахондаҳо'