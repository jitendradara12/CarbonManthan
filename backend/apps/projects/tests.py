from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from django.core.files.uploadedfile import SimpleUploadedFile
from io import BytesIO
from PIL import Image
from django.contrib.auth import get_user_model
from .models import Project


User = get_user_model()


class TestProjectFlow(TestCase):
	def setUp(self):
		self.client = APIClient()
		# Create NGO user and login
		self.ngo = User.objects.create_user(username='ngo1', password='Password123', role='NGO')
		token = self.client.post(reverse('token_obtain_pair'), {'username': 'ngo1', 'password': 'Password123'}).data['access']
		self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

	def test_ngo_create_list_get_and_update_with_image(self):
		# Create project
		resp = self.client.post(
			reverse('ngo-project-list-create'),
			{
				'name': 'Sunderbans',
				'description': 'Mangrove drive',
				'location_lat': '22.000001',
				'location_lon': '88.000001',
				'area_hectares': '10.5',
			},
			format='json',
		)
		self.assertEqual(resp.status_code, 201)
		project_id = resp.data['id']

		# List own
		resp = self.client.get(reverse('ngo-project-list-create'))
		self.assertEqual(resp.status_code, 200)
		self.assertEqual(len(resp.data['results']), 1)

		# Get detail
		resp = self.client.get(reverse('ngo-project-detail', args=[project_id]))
		self.assertEqual(resp.status_code, 200)

		# Upload update with image
		# Create a small valid image in memory
		buffer = BytesIO()
		img = Image.new('RGB', (10, 10), color='green')
		img.save(buffer, format='PNG')
		buffer.seek(0)
		image = SimpleUploadedFile('test.png', buffer.read(), content_type='image/png')
		resp = self.client.post(reverse('ngo-project-update-create', args=[project_id]), {'notes': 'Week 1', 'image': image})
		self.assertEqual(resp.status_code, 201)

	def test_ngo_project_validations_and_updates_list(self):
		# invalid lat
		resp = self.client.post(
			reverse('ngo-project-list-create'),
			{
				'name': 'BadLat',
				'description': 'x',
				'location_lat': '200',
				'location_lon': '0',
				'area_hectares': '1',
			},
			format='json',
		)
		self.assertEqual(resp.status_code, 400)

		# create valid then list updates
		resp = self.client.post(
			reverse('ngo-project-list-create'),
			{
				'name': 'Good',
				'description': 'ok',
				'location_lat': '22',
				'location_lon': '88',
				'area_hectares': '2',
			},
			format='json',
		)
		project_id = resp.data['id']
		resp = self.client.get(reverse('ngo-project-update-list', args=[project_id]))
		self.assertEqual(resp.status_code, 200)
		self.assertEqual(resp.data['count'], 0)


class TestAdminApproval(TestCase):
	def setUp(self):
		self.client = APIClient()
		self.admin = User.objects.create_user(username='admin2', password='Password123', role='ADMIN')
		self.ngo = User.objects.create_user(username='ngo2', password='Password123', role='NGO')
		self.project = Project.objects.create(
			owner=self.ngo,
			name='Coastal',
			description='Restoration',
			location_lat=10.0,
			location_lon=20.0,
			area_hectares=5.5,
		)
		token = self.client.post(reverse('token_obtain_pair'), {'username': 'admin2', 'password': 'Password123'}).data['access']
		self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

	def test_admin_list_and_patch_status(self):
		resp = self.client.get(reverse('admin-project-list'))
		self.assertEqual(resp.status_code, 200)
		self.assertEqual(resp.data['results'][0]['name'], 'Coastal')

		resp = self.client.patch(reverse('admin-project-detail', args=[self.project.id]), {'status': 'Approved'}, format='json')
		self.assertEqual(resp.status_code, 200)
		self.project.refresh_from_db()
		self.assertEqual(self.project.status, 'Approved')

	def test_admin_get_detail_and_list_updates(self):
		# detail
		resp = self.client.get(reverse('admin-project-detail', args=[self.project.id]))
		self.assertEqual(resp.status_code, 200)
		# updates list
		resp = self.client.get(reverse('admin-project-update-list', args=[self.project.id]))
		self.assertEqual(resp.status_code, 200)

# Create your tests here.
