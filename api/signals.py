import qrcode
import os
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from api.models import Container

@receiver(post_save, sender=Container, dispatch_uid='postSave_Container')
def create_qr(sender, instance, created, **kwargs):
    if created == True:
        id = instance.pk
        qr = qrcode.QRCode(
            version=2,
            error_correction=qrcode.constants.ERROR_CORRECT_H,
            box_size=10,
            border=4,
        )
        qr.add_data(id)
        img = qr.make_image(fill_color="black", back_color="white").convert('RGB')
        img.save(os.path.join(settings.MEDIA_ROOT, 'QR', f'qr-{id}.png'))