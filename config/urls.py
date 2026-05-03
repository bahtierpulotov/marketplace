from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

# ── Admin: сарлавҳаҳо (брендинг дар base_site низ ҳастанд) ──
admin.site.site_header = 'Bozor — панели идоракунӣ'
admin.site.site_title = 'Bozor Admin'
admin.site.index_title = 'Намои умумӣ'

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('apps.accounts.urls')),
    path('api/', include('apps.products.urls')),
    path('api/', include('apps.ai_chat.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) + [
    path('', include('apps.pages.urls')),
]