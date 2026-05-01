from django.urls import path
from . import views

urlpatterns = [
    path('categories/', views.categories, name='categories'),
    path('categories/<uuid:category_id>/', views.category_detail, name='category_detail'),
    path('locations/', views.location_list, name='location_list'),
    path('locations/create/', views.location_admin, name='location_admin'),
    path('products/', views.product_list, name='product_list'),
    path('products/<uuid:product_id>/', views.product_detail, name='product_detail'),
    path('products/<uuid:product_id>/images/', views.upload_images, name='upload_images'),
    path('products/<uuid:product_id>/like/', views.toggle_like, name='toggle_like'),
    path('user/me/products/', views.my_products, name='my_products'),
]
