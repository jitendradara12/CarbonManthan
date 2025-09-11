from django.urls import path
from .views import (
    NGOProjectListCreateView,
    NGOProjectDetailView,
    NGOProjectUpdateCreateView,
    NGOProjectUpdateListView,
    AdminProjectListView,
    AdminProjectRetrieveUpdateView,
    AdminProjectUpdateListView,
)
from .public_views import PublicProjectsGeoJSON, PublicProjectDetail


urlpatterns = [
    # NGO
    path('projects/', NGOProjectListCreateView.as_view(), name='ngo-project-list-create'),
    path('projects/<int:pk>/', NGOProjectDetailView.as_view(), name='ngo-project-detail'),
    path('projects/<int:pk>/updates/', NGOProjectUpdateCreateView.as_view(), name='ngo-project-update-create'),
    path('projects/<int:pk>/updates/list/', NGOProjectUpdateListView.as_view(), name='ngo-project-update-list'),

    # Admin
    path('admin/projects/', AdminProjectListView.as_view(), name='admin-project-list'),
    path('admin/projects/<int:pk>/', AdminProjectRetrieveUpdateView.as_view(), name='admin-project-detail'),
    path('admin/projects/<int:pk>/updates/', AdminProjectUpdateListView.as_view(), name='admin-project-update-list'),

    # Public map & explorer
    path('public/projects.geojson', PublicProjectsGeoJSON.as_view(), name='public-projects-geojson'),
    path('public/projects/<int:pk>/', PublicProjectDetail.as_view(), name='public-project-detail'),
]
