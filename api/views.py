import os
import qrcode

from django.conf import settings
from django.shortcuts import redirect, render
from django.views.generic.base import TemplateView
from django.views.generic.detail import BaseDetailView
from django.views.generic.edit import UpdateView, DeleteView, CreateView
from django.views.generic.list import ListView

from api.mixins import JSONResponseMixin
from api.models import Container
from api.forms import ContainerForm


class ContainersListView(ListView):
    model = Container
    template_name = 'manage.html'


class ContainerCreateView(CreateView):
    model = Container
    template_name = 'create-container.html'
    form_class = ContainerForm
    success_url = '/manage'


class ContainerUpdateView(UpdateView):
    model = Container
    template_name = 'manage-container.html'
    form_class = ContainerForm
    success_url = '/manage'


class ContainerDeleteView(DeleteView):
    model = Container
    success_url = '/manage'


class PrintQRView(TemplateView):
    template_name = 'print-qr.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        id = context['pk']
        qrfile = os.path.join(settings.MEDIA_ROOT, 'QR', f'qr-{id}.png')
        
        if not os.path.exists(qrfile):
            qr = qrcode.QRCode(
                version=2,
                error_correction=qrcode.constants.ERROR_CORRECT_H,
                box_size=10,
                border=4,
            )
            qr.add_data(id)
            img = qr.make_image(fill_color="black", back_color="white").convert('RGB')
            img.save(os.path.join(settings.MEDIA_ROOT, 'QR', f'qr-{id}.png'))

        context['qr_filename'] = f'{settings.MEDIA_URL}/QR/qr-{id}.png'
        context['container'] = Container.objects.get(id=id)

        return context


class ContainerAPIDetailView(JSONResponseMixin, BaseDetailView):
    model = Container

    def render_to_response(self, context, **response_kwargs):
        return self.render_to_json_response(context, **response_kwargs)