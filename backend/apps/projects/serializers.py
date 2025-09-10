from rest_framework import serializers
from .models import Project, ProjectUpdate


class ProjectSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.id')

    class Meta:
        model = Project
        fields = (
            'id', 'owner', 'name', 'description', 'location_lat', 'location_lon',
            'area_hectares', 'status', 'created_at', 'updated_at'
        )
        read_only_fields = ('status', 'created_at', 'updated_at')

    def validate_location_lat(self, value):
        if value < -90 or value > 90:
            raise serializers.ValidationError('Latitude must be between -90 and 90')
        return value

    def validate_location_lon(self, value):
        if value < -180 or value > 180:
            raise serializers.ValidationError('Longitude must be between -180 and 180')
        return value

    def validate_area_hectares(self, value):
        if value <= 0:
            raise serializers.ValidationError('Area must be greater than 0')
        return value


class ProjectUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectUpdate
        fields = ('id', 'project', 'notes', 'image', 'created_at')
        read_only_fields = ('project', 'created_at')


class AdminProjectStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ('id', 'status')
