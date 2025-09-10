from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model


User = get_user_model()


class TestAuth(TestCase):
	def setUp(self):
		self.client = APIClient()

	def test_register_and_login(self):
		# Register
		resp = self.client.post(
			reverse('register'),
			{
				'username': 'neha',
				'email': 'neha@example.com',
				'password': 'Password123',
				'role': 'NGO',
			},
			format='json',
		)
		self.assertEqual(resp.status_code, 201)
		self.assertTrue(User.objects.filter(username='neha').exists())

		# Login
		resp = self.client.post(
			reverse('token_obtain_pair'),
			{'username': 'neha', 'password': 'Password123'},
			format='json',
		)
		self.assertEqual(resp.status_code, 200)
		self.assertIn('access', resp.data)
		self.assertIn('refresh', resp.data)

# Create your tests here.
