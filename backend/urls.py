"""backend URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.0/topics/http/urls/
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
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from django.views.generic.base import TemplateView
from api.views import ContainersListView, ContainerUpdateView, ContainerDeleteView, ContainerCreateView, PrintQRView
from api.views import ContainerAPIDetailView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', TemplateView.as_view(template_name='home.html'), name='home'),
    path('manage', ContainersListView.as_view(), name='manage'),
    path('manage/print-qr/<int:pk>', PrintQRView.as_view(), name='print-qr'),
    path('manage/container/<int:pk>', ContainerUpdateView.as_view(), name='container-edit'),
    path('manage/container/<int:pk>/delete', ContainerDeleteView.as_view(), name='container-delete'),
    path('manage/container/create', ContainerCreateView.as_view(), name='container-create'),
    path('scanner', TemplateView.as_view(template_name='scanner.html'), name='scanner'),
    path('api/container/<int:pk>', ContainerAPIDetailView.as_view(), name='api-container'),
    path('tinymce/', include('tinymce.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
