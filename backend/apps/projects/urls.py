from django.urls import path
from .views import (
    NGOProjectListCreateView,
    NGOProjectDetailView,
    NGOProjectUpdateCreateView,
    AdminProjectListView,
    AdminProjectStatusUpdateView,
)


urlpatterns = [
    # NGO
    path('projects/', NGOProjectListCreateView.as_view(), name='ngo-project-list-create'),
    path('projects/<int:pk>/', NGOProjectDetailView.as_view(), name='ngo-project-detail'),
    path('projects/<int:pk>/updates/', NGOProjectUpdateCreateView.as_view(), name='ngo-project-update-create'),

    # Admin
    path('admin/projects/', AdminProjectListView.as_view(), name='admin-project-list'),
    path('admin/projects/<int:pk>/', AdminProjectStatusUpdateView.as_view(), name='admin-project-status-update'),
]
