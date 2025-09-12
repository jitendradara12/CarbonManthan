from django.db import models
from apps.accounts.models import User


class Project(models.Model):
	PROJECT_STATUS_CHOICES = (
		("Pending", "Pending"),
		("Approved", "Approved"),
		("Rejected", "Rejected"),
	)

	owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="projects")
	name = models.CharField(max_length=255)
	description = models.TextField()
	location_lat = models.DecimalField(max_digits=9, decimal_places=6)
	location_lon = models.DecimalField(max_digits=9, decimal_places=6)
	area_hectares = models.DecimalField(max_digits=10, decimal_places=2)
	status = models.CharField(max_length=10, choices=PROJECT_STATUS_CHOICES, default="Pending")
	# Map-first fields (Phase 2)
	latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
	longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
	location_text = models.CharField(max_length=255, blank=True, default="")
	cover_image_url = models.URLField(blank=True, default="")
	onchain_project_id = models.BigIntegerField(null=True, blank=True)
	total_credits_minted = models.BigIntegerField(default=0)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	def __str__(self):
		return self.name

	class Meta:
		indexes = [
			models.Index(fields=["owner", "status"]),
			models.Index(fields=["-created_at"]),
			models.Index(fields=["latitude", "longitude"]),
		]
		constraints = [
			models.UniqueConstraint(fields=["owner", "name"], name="unique_owner_project_name")
		]


class ProjectUpdate(models.Model):
	project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="updates")
	notes = models.TextField()
	image = models.ImageField(upload_to="project_updates/")
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return f"Update for {self.project.name} at {self.created_at.strftime('%Y-%m-%d')}"
