import os
import qrcode

from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _
from tinymce.models import HTMLField

class Container(models.Model):
    name = models.CharField(max_length=150, verbose_name=_('Name'))
    content = HTMLField(verbose_name=_('Content'))

    def get_qr_url(self):
        id = self.pk
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
            img.save(qrfile)

        qrurl = f'{settings.MEDIA_URL}QR/qr-{id}.png'
        return qrurl

    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = _('Container')
        verbose_name_plural = _('Containers')