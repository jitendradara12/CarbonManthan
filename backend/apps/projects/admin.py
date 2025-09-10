from django.contrib import admin
from .models import Project, ProjectUpdate


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
	list_display = ("name", "owner", "status", "area_hectares", "created_at")
	list_filter = ("status", "created_at")
	search_fields = ("name", "owner__username")
	list_select_related = ("owner",)

	actions = ("mark_approved", "mark_rejected")

	def mark_approved(self, request, queryset):
		queryset.update(status="Approved")
	mark_approved.short_description = "Mark selected projects as Approved"

	def mark_rejected(self, request, queryset):
		queryset.update(status="Rejected")
	mark_rejected.short_description = "Mark selected projects as Rejected"


@admin.register(ProjectUpdate)
class ProjectUpdateAdmin(admin.ModelAdmin):
	list_display = ("project", "created_at")
	list_filter = ("created_at",)
