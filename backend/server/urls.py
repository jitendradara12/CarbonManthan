"""
URL configuration for server project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from .views import landing_page
from django.views.generic import RedirectView
from django.views.static import serve as static_serve

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.accounts.urls')),
    path('api/', include('apps.projects.urls')),
    # Serve the new landing page at the root
    path('', landing_page, name='landing_page'),
    # Serve the original app at /app
    path('app/', static_serve, {'document_root': (settings.BASE_DIR / '..' / 'frontend').resolve(), 'path': 'index.html'}),
    # convenience route for the public Explorer map
    path('explorer', RedirectView.as_view(url='/frontend/explorer.html', permanent=False)),
    # Keep serving other frontend assets
    path('frontend/<path:path>', static_serve, {'document_root': (settings.BASE_DIR / '..' / 'frontend').resolve()}),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
