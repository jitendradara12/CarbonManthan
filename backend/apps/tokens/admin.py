from django.contrib import admin
from .models import TokenLedger, Purchase


@admin.register(TokenLedger)
class TokenLedgerAdmin(admin.ModelAdmin):
    list_display = ('project', 'action', 'amount', 'tx_hash', 'created_at')
    list_filter = ('action', 'created_at')
    search_fields = ('tx_hash', 'project__name')


@admin.register(Purchase)
class PurchaseAdmin(admin.ModelAdmin):
    list_display = ('buyer', 'project', 'credits', 'price_per_credit', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('buyer__username', 'project__name', 'tx_hash')
