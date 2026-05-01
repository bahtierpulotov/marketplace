from django.urls import path, re_path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('login/', views.page_login, name='login'),
    path('register/', views.page_register, name='register'),
    path('verify/', views.page_verify, name='verify'),
    path('forgot-password/', views.page_forgot_password, name='forgot_password'),
    path('restore/', views.page_restore, name='restore'),
    path('profile/', views.page_profile, name='profile'),
    path('create/', views.page_create_product, name='create_product'),
    path('product/<uuid:product_id>/', views.page_product_detail, name='product_detail'),
    path('product/<uuid:product_id>/edit/', views.page_product_edit, name='product_edit'),
    path('chat/<uuid:product_id>/', views.page_direct_chat, name='direct_chat'),
    path('user/<uuid:user_id>/', views.page_public_profile, name='public_profile'),
    re_path(r'^.+$', views.page_not_found),
]
