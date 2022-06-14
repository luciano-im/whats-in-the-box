from tabnanny import verbose
from django.db import models
from django.utils.translation import gettext_lazy as _
from tinymce.models import HTMLField

class Container(models.Model):
    name = models.CharField(max_length=150, verbose_name=_('Name'))
    content = HTMLField(verbose_name=_('Content'))

    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = _('Container')
        verbose_name_plural = _('Containers')