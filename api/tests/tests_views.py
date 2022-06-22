from django.test import TestCase
from django.urls import reverse

from api.models import Container

class ContainerViewsTest(TestCase):

    def setUp(self):
        html_content = '<ul><li>Object 1</li><li>Object 2</li><li>Object 3</li></ul>'
        number_of_containers = 5
        for n in range(number_of_containers):
            Container.objects.create(name=f'Box {n}', content=html_content)
        
        self.object = Container.objects.get(id=1)
    
    # Testing URL's

    def test_container_manage_url_exists(self):
        """ Testing manage container url and reverse url"""
        response = self.client.get('/manage')
        response_reverse = self.client.get(reverse('manage'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response_reverse.status_code, 200)
    
    def test_edit_container_url_exists(self):
        """ Testing edit container URL and reverse url """
        response = self.client.get(f'/manage/container/{self.object.pk}')
        response_reverse = self.client.get(reverse('container-edit', args=[self.object.pk]))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response_reverse.status_code, 200)
    
    def test_create_container_url_exists(self):
        """ Testing creation container URL and reverse url """
        response = self.client.get(f'/manage/container/create')
        response_reverse = self.client.get(reverse('container-create'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response_reverse.status_code, 200)
    
    def test_delete_container_url_exists(self):
        """ Testing delete container URL """
        response = self.client.post(f'/manage/container/{self.object.pk}/delete')
        count = len(Container.objects.all())
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url, '/manage')
        self.assertEqual(count, 4)

    def test_delete_container_reverse_url_exists(self):
        """ Testing delete container reverse url """
        response = self.client.post(reverse('container-delete', args=[self.object.pk]))
        count = len(Container.objects.all())
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url, '/manage')
        self.assertEqual(count, 4)
    
    def test_print_qr_url_exists(self):
        """ Testing print QR URL and reverse url """
        response = self.client.get(f'/manage/print-qr/{self.object.pk}')
        response_reverse = self.client.get(reverse('print-qr', args=[self.object.pk]))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response_reverse.status_code, 200)
    
    def test_scanner_url_exists(self):
        """ Testing scanner URL and reverse url """
        response = self.client.get(f'/scanner')
        response_reverse = self.client.get(reverse('scanner'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response_reverse.status_code, 200)
    
    def test_api_container_url_exists(self):
        """ Testing scanner URL and reverse url """
        response = self.client.get(f'/api/container/{self.object.pk}')
        response_reverse = self.client.get(reverse('api-container', args=[self.object.pk]))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response_reverse.status_code, 200)
    
    # Testing responses

    def test_api_json_response(self):
        """ Testing api json reponse """
        response = self.client.get(f'/api/container/{self.object.pk}', format='json')
        expected_text = f'{{"id": {self.object.pk}, "name": "{self.object.name}", "content": "{self.object.content}"}}'
        self.assertIn('application/json', response._content_type_for_repr)
        self.assertJSONEqual(response.content, expected_text)