"""Шумораҳо барои дашборди админ (танҳо саҳифаи асосӣ)."""
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.db.models import Sum
from django.utils import timezone

from apps.ai_chat.models import DirectChat, DirectMessage
from apps.products.models import Category, Like, Location, Product

User = get_user_model()


def get_admin_dashboard_stats():
    now = timezone.now()
    week_ago = now - timedelta(days=7)

    products_active = Product.objects.filter(is_active=True).count()
    products_inactive = Product.objects.filter(is_active=False).count()
    views_sum = Product.objects.aggregate(s=Sum('views_count'))['s'] or 0

    return {
        'users_total': User.objects.count(),
        'users_new_week': User.objects.filter(created_at__gte=week_ago).count(),
        'users_banned': User.objects.filter(is_banned=True).count(),
        'users_verified': User.objects.filter(is_verified=True).count(),
        'products_active': products_active,
        'products_inactive': products_inactive,
        'products_total': products_active + products_inactive,
        'products_new_week': Product.objects.filter(created_at__gte=week_ago).count(),
        'categories': Category.objects.count(),
        'locations': Location.objects.count(),
        'likes': Like.objects.count(),
        'views_sum': int(views_sum),
        'direct_chats': DirectChat.objects.count(),
        'direct_messages': DirectMessage.objects.count(),
    }
