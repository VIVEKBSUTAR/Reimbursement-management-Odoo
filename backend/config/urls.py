"""
URL configuration for IRMS project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.authentication.urls')),
    path('api/companies/', include('apps.companies.urls')),
    path('api/users/', include('apps.users.urls')),
    path('api/expenses/', include('apps.expenses.urls')),
    path('api/approvals/', include('apps.approvals.urls')),
    path('api/rules/', include('apps.rules.urls')),
    path('api/currencies/', include('apps.currencies.urls')),
    path('api/audit/', include('apps.audit.urls')),
    path('api/ocr/', include('apps.ocr.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
