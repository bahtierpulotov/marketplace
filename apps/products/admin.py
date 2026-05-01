from django.contrib import admin
from django.utils.html import format_html
from .models import Category, Location, Product, ProductImage, Like, View


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('icon', 'name', 'slug', 'product_count', 'created_at')
    search_fields = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}

    def product_count(self, obj):
        return obj.products.count()
    product_count.short_description = 'Products'


@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = ('name', 'region', 'order', 'product_count')
    search_fields = ('name', 'region')
    list_editable = ('order',)

    def product_count(self, obj):
        return obj.products.count()
    product_count.short_description = 'Products'


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 0
    readonly_fields = ('preview',)

    def preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="height:60px;border-radius:4px"/>', obj.image.url)
        return '-'
    preview.short_description = 'Preview'


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('title', 'owner', 'category', 'location', 'price', 'views_count', 'likes_count', 'is_active', 'created_at')
    list_filter = ('is_active', 'category', 'location', 'created_at')
    search_fields = ('title', 'description', 'owner__email')
    readonly_fields = ('id', 'views_count', 'likes_count', 'created_at', 'updated_at')
    inlines = [ProductImageInline]
    actions = ['deactivate_products', 'activate_products']

    def deactivate_products(self, request, queryset):
        queryset.update(is_active=False)
    deactivate_products.short_description = '🚫 Deactivate'

    def activate_products(self, request, queryset):
        queryset.update(is_active=True)
    activate_products.short_description = '✅ Activate'


@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = ('user', 'product', 'created_at')

@admin.register(View)
class ViewAdmin(admin.ModelAdmin):
    list_display = ('product', 'ip_address', 'viewed_at')
