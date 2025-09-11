import hashlib
from datetime import timezone as dt_timezone
from django.db.models import Q
from django.views.decorators.cache import cache_page
from django.utils.decorators import method_decorator
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework.permissions import AllowAny
from .models import Project, ProjectUpdate


def project_to_feature(p: Project):
    lon = float(p.longitude or p.location_lon)
    lat = float(p.latitude or p.location_lat)
    # cover image fallback to latest update image
    cover = p.cover_image_url or ""
    if not cover:
        latest_img = (
            ProjectUpdate.objects.filter(project=p)
            .order_by('-created_at')
            .values_list('image', flat=True)
            .first()
        )
        cover = latest_img or ""
    props = {
        "id": p.id,
        "name": p.name,
        "status": p.status,
        "location_text": p.location_text or "",
        "area_hectares": float(p.area_hectares) if p.area_hectares is not None else None,
        "cover_image_url": cover,
        "onchain_project_id": p.onchain_project_id,
        "total_credits_minted": int(p.total_credits_minted or 0),
        "updated_at": p.updated_at.astimezone(dt_timezone.utc).isoformat().replace('+00:00', 'Z'),
    }
    return {
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [lon, lat]},
        "properties": props,
    }


@method_decorator(cache_page(60), name='dispatch')
class PublicProjectsGeoJSON(APIView):
    throttle_classes = [AnonRateThrottle]
    permission_classes = [AllowAny]

    def get(self, request):
        qs = Project.objects.all()
        status = request.GET.get('status')
        if status in {"Approved", "Pending", "Rejected"}:
            qs = qs.filter(status=status)
        q = request.GET.get('q')
        if q:
            qs = qs.filter(Q(name__icontains=q) | Q(location_text__icontains=q))
        bbox = request.GET.get('bbox')
        if bbox:
            try:
                minx, miny, maxx, maxy = map(float, bbox.split(','))
                qs = qs.filter(longitude__gte=minx, longitude__lte=maxx, latitude__gte=miny, latitude__lte=maxy)
            except Exception:
                pass
        features = [project_to_feature(p) for p in qs if (p.latitude or p.location_lat) and (p.longitude or p.location_lon)]
        payload = {"type": "FeatureCollection", "features": features}
        # lightweight ETag/Last-Modified
        latest = qs.order_by('-updated_at').values_list('updated_at', flat=True).first()
        etag_src = f"{len(features)}:{str(latest)}".encode()
        resp = Response(payload, content_type='application/geo+json')
        resp['ETag'] = hashlib.md5(etag_src).hexdigest()
        if latest:
            resp['Last-Modified'] = latest.astimezone(dt_timezone.utc).strftime('%a, %d %b %Y %H:%M:%S GMT')
        return resp


@method_decorator(cache_page(60), name='dispatch')
class PublicProjectDetail(APIView):
    throttle_classes = [AnonRateThrottle]
    permission_classes = [AllowAny]

    def get(self, request, pk: int):
        try:
            p = Project.objects.get(pk=pk)
        except Project.DoesNotExist:
            return Response({"detail": "Not found"}, status=404)
        images = list(ProjectUpdate.objects.filter(project=p).order_by('-created_at').values_list('image', flat=True)[:5])
        latest_updates = list(ProjectUpdate.objects.filter(project=p).order_by('-created_at').values('notes', 'image', 'created_at')[:3])
        data = {
            "id": p.id,
            "name": p.name,
            "description": p.description[:400],
            "status": p.status,
            "location_text": p.location_text,
            "area_hectares": float(p.area_hectares) if p.area_hectares is not None else None,
            "coordinates": {"lat": float(p.latitude or p.location_lat), "lon": float(p.longitude or p.location_lon)},
            "images": images,
            "latest_updates": [
                {"title": (u.get('notes') or '')[:60], "image_url": u.get('image'), "created_at": u.get('created_at')} for u in latest_updates
            ],
            "chain": {
                "onchain_project_id": p.onchain_project_id,
                "total_credits_minted": int(p.total_credits_minted or 0),
                "tx_register": None,
                "tx_approve": None,
            },
        }
        resp = Response(data)
        resp['ETag'] = hashlib.md5(f"detail:{p.id}:{p.updated_at.isoformat()}".encode()).hexdigest()
        resp['Last-Modified'] = p.updated_at.astimezone(dt_timezone.utc).strftime('%a, %d %b %Y %H:%M:%S GMT')
        return resp
