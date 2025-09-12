from django.urls import path
from .views import AdminMintView, BuyerPurchaseView, BuyerBurnView

urlpatterns = [
    path('admin/projects/<int:pk>/mint/', AdminMintView.as_view(), name='token-admin-mint'),
    path('buyer/projects/<int:pk>/purchase/', BuyerPurchaseView.as_view(), name='token-buyer-purchase'),
    path('buyer/projects/<int:pk>/burn/', BuyerBurnView.as_view(), name='token-buyer-burn'),
]
