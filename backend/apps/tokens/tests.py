from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from apps.projects.models import Project
from apps.tokens.models import TokenLedger, Purchase


User = get_user_model()


class TestTokenFlows(TestCase):
    def setUp(self):
        self.client = APIClient()
        # Users
        self.admin = User.objects.create_user(username='t_admin', password='Password123', role='ADMIN')
        self.ngo = User.objects.create_user(username='t_ngo', password='Password123', role='NGO')
        self.buyer = User.objects.create_user(username='t_buyer', password='Password123', role='BUYER')
        # Project owned by NGO
        self.project = Project.objects.create(
            owner=self.ngo,
            name='TokenProj',
            description='desc',
            location_lat=10.0,
            location_lon=20.0,
            area_hectares=5.0,
        )

    def auth(self, username, password):
        token = self.client.post(reverse('token_obtain_pair'), {'username': username, 'password': password}).data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

    def test_admin_mint_increments_totals_and_logs_ledger(self):
        self.auth('t_admin', 'Password123')
        url = reverse('token-admin-mint', args=[self.project.id])
        r = self.client.post(url, {'credits': 50}, format='json')
        self.assertEqual(r.status_code, 200)
        self.project.refresh_from_db()
        self.assertEqual(self.project.total_credits_minted, 50)
        self.assertTrue(TokenLedger.objects.filter(project=self.project, action='MINT').exists())

        # subsequent mint adds up
        r = self.client.post(url, {'credits': 30}, format='json')
        self.assertEqual(r.status_code, 200)
        self.project.refresh_from_db()
        self.assertEqual(self.project.total_credits_minted, 80)

    def test_buyer_purchase_and_burn(self):
        # First mint some as admin
        self.auth('t_admin', 'Password123')
        self.client.post(reverse('token-admin-mint', args=[self.project.id]), {'credits': 100}, format='json')

        # Buyer purchases
        self.auth('t_buyer', 'Password123')
        pr = self.client.post(reverse('token-buyer-purchase', args=[self.project.id]), {'credits': 10, 'price_per_credit': '12.5'}, format='json')
        self.assertEqual(pr.status_code, 200)
        self.assertTrue(Purchase.objects.filter(buyer=self.buyer, project=self.project).exists())

        # Buyer burns
        br = self.client.post(reverse('token-buyer-burn', args=[self.project.id]), {'credits': 10}, format='json')
        self.assertEqual(br.status_code, 200)
        self.project.refresh_from_db()
        self.assertEqual(self.project.total_credits_minted, 90)

    def test_permissions_enforced(self):
        # NGO cannot mint
        self.auth('t_ngo', 'Password123')
        r = self.client.post(reverse('token-admin-mint', args=[self.project.id]), {'credits': 5}, format='json')
        self.assertEqual(r.status_code, 403)

        # NGO cannot purchase/burn (buyer-only)
        r = self.client.post(reverse('token-buyer-purchase', args=[self.project.id]), {'credits': 5}, format='json')
        self.assertEqual(r.status_code, 403)
        r = self.client.post(reverse('token-buyer-burn', args=[self.project.id]), {'credits': 5}, format='json')
        self.assertEqual(r.status_code, 403)
