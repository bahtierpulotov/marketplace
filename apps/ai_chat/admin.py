from django.contrib import admin
from .models import ChatSession, ChatMessage


class ChatMessageInline(admin.TabularInline):
    model = ChatMessage
    extra = 0
    readonly_fields = ('id', 'role', 'content', 'timestamp')
    can_delete = False


@admin.register(ChatSession)
class ChatSessionAdmin(admin.ModelAdmin):
    list_display = ('user', 'product', 'message_count', 'created_at', 'updated_at')
    search_fields = ('user__email', 'product__title')
    readonly_fields = ('id', 'created_at', 'updated_at')
    inlines = [ChatMessageInline]

    def message_count(self, obj):
        return obj.messages.count()
    message_count.short_description = 'Messages'


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ('session', 'role', 'short_content', 'timestamp')
    list_filter = ('role', 'timestamp')
    search_fields = ('content', 'session__user__email')
    readonly_fields = ('id', 'timestamp')

    def short_content(self, obj):
        return obj.content[:80] + '...' if len(obj.content) > 80 else obj.content
    short_content.short_description = 'Content'
