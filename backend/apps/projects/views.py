from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404

from .models import Project, ProjectUpdate
from .serializers import ProjectSerializer, ProjectUpdateSerializer, AdminProjectStatusSerializer
from apps.accounts.permissions import IsNGO, IsAdmin, IsOwnerOrReadOnly


class NGOProjectListCreateView(generics.ListCreateAPIView):
	serializer_class = ProjectSerializer
	permission_classes = [IsNGO]

	def get_queryset(self):
		return Project.objects.filter(owner=self.request.user).order_by('-created_at')

	def perform_create(self, serializer):
		serializer.save(owner=self.request.user)


class NGOProjectDetailView(generics.RetrieveAPIView):
	serializer_class = ProjectSerializer
	permission_classes = [IsNGO]

	def get_queryset(self):
		return Project.objects.filter(owner=self.request.user)


class NGOProjectUpdateCreateView(generics.CreateAPIView):
	serializer_class = ProjectUpdateSerializer
	permission_classes = [IsNGO]
	parser_classes = [MultiPartParser, FormParser]

	def perform_create(self, serializer):
		project = get_object_or_404(Project, pk=self.kwargs['pk'], owner=self.request.user)
		serializer.save(project=project)


class NGOProjectUpdateListView(generics.ListAPIView):
	serializer_class = ProjectUpdateSerializer
	permission_classes = [IsNGO]

	def get_queryset(self):
		project = get_object_or_404(Project, pk=self.kwargs['pk'], owner=self.request.user)
		return ProjectUpdate.objects.filter(project=project).order_by('-created_at')


class AdminProjectListView(generics.ListAPIView):
	serializer_class = ProjectSerializer
	permission_classes = [IsAdmin]
	queryset = Project.objects.all().order_by('-created_at')


class AdminProjectRetrieveUpdateView(generics.RetrieveUpdateAPIView):
	permission_classes = [IsAdmin]
	queryset = Project.objects.all()
	http_method_names = ['get', 'patch']

	def get_serializer_class(self):
		if self.request.method.lower() == 'patch':
			return AdminProjectStatusSerializer
		return ProjectSerializer


class AdminProjectUpdateListView(generics.ListAPIView):
	serializer_class = ProjectUpdateSerializer
	permission_classes = [IsAdmin]

	def get_queryset(self):
		project = get_object_or_404(Project, pk=self.kwargs['pk'])
		return ProjectUpdate.objects.filter(project=project).order_by('-created_at')

