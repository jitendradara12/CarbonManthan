from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.projects.models import Project
from decimal import Decimal


COASTAL_DEMOS = [
    ("Mumbai Mangrove Restoration", 19.0760, 72.8777, "Mumbai, Maharashtra, IN", "https://images.unsplash.com/photo-1618477461854-6e6ad87a0034?q=80&w=1600&auto=format&fit=crop"),
    ("Goa Coastal Blue Carbon", 15.2993, 74.1240, "Goa, IN", "https://images.unsplash.com/photo-1585060544812-6b60e8d6ac6f?q=80&w=1600&auto=format&fit=crop"),
    ("Kochi Estuary Replanting", 9.9312, 76.2673, "Kochi, Kerala, IN", "https://images.unsplash.com/photo-1599382107353-8febac5902ff?q=80&w=1600&auto=format&fit=crop"),
    ("Chennai Coastal Rehabilitation", 13.0827, 80.2707, "Chennai, Tamil Nadu, IN", "https://images.unsplash.com/photo-1602415771531-39f195c53d0c?q=80&w=1600&auto=format&fit=crop"),
    ("Visakhapatnam Mangroves", 17.6868, 83.2185, "Visakhapatnam, Andhra Pradesh, IN", "https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=1600&auto=format&fit=crop"),
    ("Sundarbans Community Project", 21.9497, 89.1833, "Sundarbans, WB, IN", "https://images.unsplash.com/photo-1589138908411-acd894dc6817?q=80&w=1600&auto=format&fit=crop"),
    ("Andaman Creek Restoration", 11.7401, 92.6586, "Port Blair, Andaman & Nicobar, IN", "https://images.unsplash.com/photo-1558980664-10a882c27071?q=80&w=1600&auto=format&fit=crop"),
    ("Kutch Coastal Wetlands", 23.7337, 69.8597, "Kutch, Gujarat, IN", "https://images.unsplash.com/photo-1603286259572-7049b24d7a46?q=80&w=1600&auto=format&fit=crop"),
    ("Mangalore Tidal Flats", 12.9141, 74.8560, "Mangaluru, Karnataka, IN", "https://images.unsplash.com/photo-1524850011238-e3d235e1b258?q=80&w=1600&auto=format&fit=crop"),
    ("Cuddalore Mangroves", 11.7447, 79.7680, "Cuddalore, Tamil Nadu, IN", "https://images.unsplash.com/photo-1526694051516-5c83f59d118d?q=80&w=1600&auto=format&fit=crop"),
    ("Paradeep Blue Carbon", 20.3160, 86.6100, "Jagatsinghpur, Odisha, IN", "https://images.unsplash.com/photo-1546484959-febd9a037219?q=80&w=1600&auto=format&fit=crop"),
    ("Digha Coastal Belt", 21.6273, 87.5074, "Digha, West Bengal, IN", "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1600&auto=format&fit=crop"),
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
        statuses = ['Approved', 'Pending', 'Rejected']
        idx = 0
        for name, lat, lon, loc, img in COASTAL_DEMOS:
            status = statuses[idx % len(statuses)]
            # Seed some minted credits for Approved to enable supply demos
            minted = 1000 + (idx * 100) if status == 'Approved' else 0
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
                    status=status,
                    cover_image_url=img,
                    total_credits_minted=minted,
                )
            )
            created += 1 if was_created else 0
            idx += 1
        self.stdout.write(self.style.SUCCESS(f"Seeded {created} demo projects (or already present)."))
