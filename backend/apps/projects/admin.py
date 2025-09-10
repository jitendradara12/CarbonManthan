from django.contrib import admin
from .models import Project, ProjectUpdate


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
	list_display = ("name", "owner", "status", "area_hectares", "created_at")
	list_filter = ("status", "created_at")
	search_fields = ("name", "owner__username")


@admin.register(ProjectUpdate)
class ProjectUpdateAdmin(admin.ModelAdmin):
	list_display = ("project", "created_at")
	list_filter = ("created_at",)
