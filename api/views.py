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
        obj = Container.objects.get(id=id)
        context['container'] = obj
        context['qr_filename'] = obj.get_qr_url()

        return context


class ContainerAPIDetailView(JSONResponseMixin, BaseDetailView):
    model = Container

    def render_to_response(self, context, **response_kwargs):
        return self.render_to_json_response(context, **response_kwargs)