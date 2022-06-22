import os

from django.conf import settings
from django.test import TestCase

from api.models import Container

class ContainerModelTest(TestCase):

    def setUp(self):
        self.html_content = '<ul><li>Object 1</li><li>Object 2</li><li>Object 3</li></ul>'
        self.object = Container.objects.create(name='Box', content=self.html_content)
    
    def test_container_creation(self):
        """ Testing creation of a Container """
        self.object.full_clean()
        self.assertTrue(isinstance(self.object, Container))
    
    def test_container_str_method(self):
        """ Testing creation of a Container """
        container = Container.objects.get(id=1)
        self.assertEqual(str(container), 'Box')
    
    def test_get_qr_url_method(self):
        expected_text = f'{settings.MEDIA_URL}QR/qr-{self.object.pk}.png'
        self.assertEqual(self.object.get_qr_url(), expected_text)
    
    def test_get_qr_url_method_non_existing_object(self):
        obj = Container.objects.create(name='New Box', content=self.html_content)
        # Remove QR file to test QE creation on get_qr_url() method
        os.remove(os.path.join(settings.MEDIA_ROOT, 'QR', f'qr-{obj.pk}.png'))
        expected_text = f'{settings.MEDIA_URL}QR/qr-{obj.pk}.png'
        self.assertEqual(obj.get_qr_url(), expected_text)