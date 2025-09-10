from rest_framework import generics, permissions
from rest_framework.response import Response
from .serializers import RegisterSerializer, MeSerializer
from django.contrib.auth import get_user_model


User = get_user_model()


class RegisterView(generics.CreateAPIView):
	queryset = User.objects.all()
	serializer_class = RegisterSerializer
	permission_classes = [permissions.AllowAny]


class MeView(generics.GenericAPIView):
	serializer_class = MeSerializer
	permission_classes = [permissions.IsAuthenticated]

	def get(self, request):
		return Response(self.serializer_class(request.user).data)
