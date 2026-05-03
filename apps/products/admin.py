from django.contrib import admin
from django.utils.html import format_html
from django.db.models import Count, Sum
from .models import Category, Location, Product, ProductImage, Like, View


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('icon_display', 'name', 'slug', 'product_count_badge', 'created_at')
    list_display_links = ('name',)
    search_fields = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}
    list_per_page = 20

    def get_queryset(self, request):
        return super().get_queryset(request).annotate(_count=Count('products'))

    def icon_display(self, obj):
        return format_html('<span style="font-size:22px">{}</span>', obj.icon or '📦')
    icon_display.short_description = ''

    def product_count_badge(self, obj):
        return format_html(
            '<span style="background:#ede9fe;color:#7c3aed;padding:3px 10px;'
            'border-radius:99px;font-weight:700;font-size:12px">{}</span>', obj._count
        )
    product_count_badge.short_description = 'Эълонҳо'
    product_count_badge.admin_order_field = '_count'


@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = ('name', 'region', 'order', 'product_count_badge')
    search_fields = ('name', 'region')
    list_editable = ('order',)
    list_per_page = 30

    def get_queryset(self, request):
        return super().get_queryset(request).annotate(_count=Count('products'))

    def product_count_badge(self, obj):
        return format_html(
            '<span style="background:#dbeafe;color:#1d4ed8;padding:3px 10px;'
            'border-radius:99px;font-weight:600;font-size:12px">{}</span>', obj._count
        )
    product_count_badge.short_description = 'Эълонҳо'


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 0
    readonly_fields = ('preview',)
    fields = ('preview', 'image', 'is_primary')

    def preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="height:70px;width:70px;object-fit:cover;border-radius:8px"/>',
                obj.image.url
            )
        return '—'
    preview.short_description = 'Сурат'


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        'image_preview', 'title', 'owner_link', 'category_badge',
        'location', 'price_display', 'stats_display', 'status_badge', 'created_at'
    )
    list_display_links = ('title',)
    list_filter = ('is_active', 'category', 'location', 'created_at')
    search_fields = ('title', 'description', 'owner__email', 'owner__full_name')
    readonly_fields = ('id', 'views_count', 'likes_count', 'created_at', 'updated_at')
    inlines = [ProductImageInline]
    actions = ['deactivate_products', 'activate_products']
    list_per_page = 20
    date_hierarchy = 'created_at'

    fieldsets = (
        ('📦 Маҳсулот', {'fields': ('id', 'title', 'description', 'price')}),
        ('🏷️ Категория ва ҷойгоҳ', {'fields': ('category', 'location')}),
        ('👤 Соҳиб', {'fields': ('owner',)}),
        ('📊 Статистика', {'fields': ('views_count', 'likes_count', 'is_active')}),
        ('🕐 Вақт', {'fields': ('created_at', 'updated_at')}),
    )

    def image_preview(self, obj):
        img = obj.images.filter(is_primary=True).first() or obj.images.first()
        if img:
            return format_html(
                '<img src="{}" style="width:48px;height:48px;object-fit:cover;border-radius:8px"/>',
                img.image.url
            )
        return format_html('<span style="font-size:24px">📦</span>')
    image_preview.short_description = ''

    def owner_link(self, obj):
        return format_html(
            '<a href="/admin/accounts/user/{}/change/" style="color:#6366f1;font-weight:500">{}</a>',
            obj.owner.id, obj.owner.full_name or obj.owner.email
        )
    owner_link.short_description = 'Соҳиб'

    def category_badge(self, obj):
        if obj.category:
            return format_html(
                '<span style="background:#ede9fe;color:#7c3aed;padding:2px 8px;'
                'border-radius:99px;font-size:12px;font-weight:500">{} {}</span>',
                obj.category.icon or '', obj.category.name
            )
        return '—'
    category_badge.short_description = 'Категория'

    def price_display(self, obj):
        return format_html(
            '<span style="font-weight:700;color:#6366f1">{} TJS</span>',
            f'{obj.price:,.0f}'
        )
    price_display.short_description = 'Нарх'
    price_display.admin_order_field = 'price'

    def stats_display(self, obj):
        return format_html(
            '<span style="color:#6b7280;font-size:12px">👁 {} &nbsp; ❤️ {}</span>',
            obj.views_count, obj.likes_count
        )
    stats_display.short_description = 'Статистика'

    def status_badge(self, obj):
        if obj.is_active:
            return format_html(
                '<span style="background:#dcfce7;color:#16a34a;padding:3px 10px;'
                'border-radius:99px;font-size:12px;font-weight:600">✅ Фаъол</span>'
            )
        return format_html(
            '<span style="background:#fef2f2;color:#dc2626;padding:3px 10px;'
            'border-radius:99px;font-size:12px;font-weight:600">❌ Ғайрифаъол</span>'
        )
    status_badge.short_description = 'Ҳолат'
    status_badge.admin_order_field = 'is_active'

    def deactivate_products(self, request, queryset):
        count = queryset.update(is_active=False)
        self.message_user(request, f'🚫 {count} эълон ғайрифаъол шуд.')
    deactivate_products.short_description = '🚫 Ғайрифаъол кардан'

    def activate_products(self, request, queryset):
        count = queryset.update(is_active=True)
        self.message_user(request, f'✅ {count} эълон фаъол шуд.')
    activate_products.short_description = '✅ Фаъол кардан'


@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = ('user', 'product_link', 'created_at')
    search_fields = ('user__email', 'product__title')
    list_per_page = 30

    def product_link(self, obj):
        return format_html(
            '<a href="/admin/products/product/{}/change/" style="color:#6366f1">{}</a>',
            obj.product.id, obj.product.title
        )
    product_link.short_description = 'Маҳсулот'


@admin.register(View)
class ViewAdmin(admin.ModelAdmin):
    list_display = ('product', 'ip_address', 'viewed_at')
    list_filter = ('viewed_at',)
    search_fields = ('product__title', 'ip_address')
    list_per_page = 30