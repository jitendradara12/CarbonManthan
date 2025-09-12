from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.shortcuts import get_object_or_404
from apps.projects.models import Project
from apps.accounts.permissions import IsAdmin
from .service import mint, burn
from .models import Purchase


class AdminMintView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request, pk: int):
        credits = int(request.data.get('credits', 0))
        if credits <= 0:
            return Response({'detail': 'credits must be > 0'}, status=400)
        project = get_object_or_404(Project, pk=pk)
        res = mint(project, credits, meta={'by': request.user.id})
        return Response({'ok': True, 'tx_hash': res.tx_hash, 'simulated': res.simulated, 'total_credits_minted': project.total_credits_minted})


class BuyerPurchaseView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk: int):
        # Require buyer role? For now, any authenticated can purchase
        credits = int(request.data.get('credits', 0))
        price = request.data.get('price_per_credit')
        if credits <= 0:
            return Response({'detail': 'credits must be > 0'}, status=400)
        project = get_object_or_404(Project, pk=pk)
        # Simulate transfer/mint to buyer account later; for now, just record purchase
        p = Purchase.objects.create(buyer=request.user, project=project, credits=credits, price_per_credit=price or 0)
        return Response({'ok': True, 'purchase_id': p.id})


class BuyerBurnView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk: int):
        credits = int(request.data.get('credits', 0))
        if credits <= 0:
            return Response({'detail': 'credits must be > 0'}, status=400)
        project = get_object_or_404(Project, pk=pk)
        res = burn(project, credits, meta={'by': request.user.id, 'type': 'buyer-burn'})
        return Response({'ok': True, 'tx_hash': res.tx_hash, 'simulated': res.simulated, 'total_credits_minted': project.total_credits_minted})
