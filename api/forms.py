from dataclasses import field, fields
from django import forms
from tinymce.widgets import TinyMCE
from api.models import Container

class ContainerForm(forms.ModelForm):
    content = forms.CharField(widget=TinyMCE(attrs={'cols': 80, 'rows': 30}))

    class Meta:
        model = Container
        fields = ['name', 'content']