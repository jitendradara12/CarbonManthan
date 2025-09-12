from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.shortcuts import get_object_or_404
from apps.projects.models import Project
from apps.accounts.permissions import IsAdmin, IsBuyer
from .service import mint, burn
from django.db.models import Sum
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
    permission_classes = [IsBuyer]

    def post(self, request, pk: int):
        # Require buyer role? For now, any authenticated can purchase
        credits = int(request.data.get('credits', 0))
        price = request.data.get('price_per_credit')
        if credits <= 0:
            return Response({'detail': 'credits must be > 0'}, status=400)
        project = get_object_or_404(Project, pk=pk)
        # Enforce simple supply cap: available = minted(net) - completed purchases
        purchased = project.purchases.filter(status='Completed').aggregate(s=Sum('credits'))['s'] or 0
        available = max(0, (project.total_credits_minted or 0) - purchased)
        if credits > available:
            return Response({'detail': f'Not enough supply. Available: {available}', 'available': available}, status=409)
        # Simulate transfer/mint to buyer account later; for now, just record purchase
        p = Purchase.objects.create(buyer=request.user, project=project, credits=credits, price_per_credit=price or 0)
        return Response({'ok': True, 'purchase_id': p.id})


class BuyerBurnView(APIView):
    permission_classes = [IsBuyer]

    def post(self, request, pk: int):
        credits = int(request.data.get('credits', 0))
        if credits <= 0:
            return Response({'detail': 'credits must be > 0'}, status=400)
        project = get_object_or_404(Project, pk=pk)
        res = burn(project, credits, meta={'by': request.user.id, 'type': 'buyer-burn'})
        return Response({'ok': True, 'tx_hash': res.tx_hash, 'simulated': res.simulated, 'total_credits_minted': project.total_credits_minted})

class BuyerPurchasesListView(APIView):
    permission_classes = [IsBuyer]

    def get(self, request):
        qs = Purchase.objects.filter(buyer=request.user).order_by('-created_at')[:100]
        data = [
            {
                'id': p.id,
                'project': p.project_id,
                'credits': p.credits,
                'price_per_credit': str(p.price_per_credit),
                'created_at': p.created_at.isoformat(),
                'tx_hash': p.tx_hash,
                'status': p.status,
            }
            for p in qs
        ]
        return Response({'results': data, 'count': qs.count()})
