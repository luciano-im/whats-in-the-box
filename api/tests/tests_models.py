from django.test import TestCase

from api.models import Container

class ContainerModelTest(TestCase):

    def setUp(self):
        html_content = '<ul><li>Object 1</li><li>Object 2</li><li>Object 3</li></ul>'
        self.object = Container.objects.create(name='Box', content=html_content)
    
    def test_container_creation(self):
        """ Testing creation of a Container """
        self.object.full_clean()
        self.assertTrue(isinstance(self.object, Container))
    
    def test_container_str_method(self):
        """ Testing creation of a Container """
        container = Container.objects.get(id=1)
        self.assertTrue(str(container), 'Box')