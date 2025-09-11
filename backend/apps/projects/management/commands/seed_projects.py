from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.projects.models import Project
from decimal import Decimal


COASTAL_DEMOS = [
    ("Mumbai Mangrove Restoration", 19.0760, 72.8777, "Mumbai, Maharashtra, IN"),
    ("Goa Coastal Blue Carbon", 15.2993, 74.1240, "Goa, IN"),
    ("Kochi Estuary Replanting", 9.9312, 76.2673, "Kochi, Kerala, IN"),
    ("Chennai Coastal Rehabilitation", 13.0827, 80.2707, "Chennai, Tamil Nadu, IN"),
    ("Visakhapatnam Mangroves", 17.6868, 83.2185, "Visakhapatnam, Andhra Pradesh, IN"),
    ("Sundarbans Community Project", 21.9497, 89.1833, "Sundarbans, WB, IN"),
    ("Andaman Creek Restoration", 11.7401, 92.6586, "Port Blair, Andaman & Nicobar, IN"),
    ("Kutch Coastal Wetlands", 23.7337, 69.8597, "Kutch, Gujarat, IN"),
    ("Mangalore Tidal Flats", 12.9141, 74.8560, "Mangaluru, Karnataka, IN"),
    ("Cuddalore Mangroves", 11.7447, 79.7680, "Cuddalore, Tamil Nadu, IN"),
    ("Paradeep Blue Carbon", 20.3160, 86.6100, "Jagatsinghpur, Odisha, IN"),
    ("Digha Coastal Belt", 21.6273, 87.5074, "Digha, West Bengal, IN"),
]


class Command(BaseCommand):
    help = "Seed demo coastal projects with coordinates"

    def handle(self, *args, **options):
        User = get_user_model()
        ngo, _ = User.objects.get_or_create(username='demo_ngo', defaults={
            'email': 'demo@ngo.in', 'role': 'NGO'
        })
        if not ngo.password:
            ngo.set_password('Password123')
            ngo.save()
        created = 0
        for name, lat, lon, loc in COASTAL_DEMOS:
            obj, was_created = Project.objects.get_or_create(
                owner=ngo, name=name,
                defaults=dict(
                    description=f"Seeded project: {name}",
                    location_lat=Decimal(str(lat)),
                    location_lon=Decimal(str(lon)),
                    latitude=Decimal(str(lat)),
                    longitude=Decimal(str(lon)),
                    location_text=loc,
                    area_hectares=Decimal('10.00'),
                    status='Approved',
                    cover_image_url='',
                )
            )
            created += 1 if was_created else 0
        self.stdout.write(self.style.SUCCESS(f"Seeded {created} demo projects (or already present)."))
