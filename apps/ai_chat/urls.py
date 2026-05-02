# apps/ai_chat/urls.py — пурра иваз кунед

from django.urls import path
from . import views

urlpatterns = [
    # AI chat барои маҳсулот
    path('ai/chat/<uuid:product_id>/', views.ai_chat, name='ai_chat'),
    path('ai/history/<uuid:product_id>/', views.delete_chat, name='delete_chat'),
    # AI ёрдамчии умумӣ — НАВИ
    path('ai/general/', views.general_ai_chat, name='general_ai_chat'),
    # Direct chat
    path('chat/<uuid:product_id>/', views.direct_chat, name='direct_chat'),
    path('chats/', views.my_chats, name='my_chats'),
]