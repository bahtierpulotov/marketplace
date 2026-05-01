from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('apps.accounts.urls')),
    path('api/', include('apps.products.urls')),
    path('api/', include('apps.ai_chat.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) + [
    path('', include('apps.pages.urls')),
]

# Custom admin site header
admin.site.site_header = "Marketplace Admin"
admin.site.site_title = "Marketplace"
admin.site.index_title = "Dashboard"
