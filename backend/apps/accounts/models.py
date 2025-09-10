from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
	USER_ROLE_CHOICES = (
		("NGO", "NGO/Community"),
		("ADMIN", "NCCR Admin"),
		("BUYER", "Corporate/Buyer"),
	)
	role = models.CharField(max_length=10, choices=USER_ROLE_CHOICES)
