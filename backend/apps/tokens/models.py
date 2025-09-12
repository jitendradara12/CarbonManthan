from django.db import models
from apps.projects.models import Project
from apps.accounts.models import User


class TokenLedger(models.Model):
    ACTION_CHOICES = (
        ('MINT', 'Mint'),
        ('BURN', 'Burn'),
        ('TRANSFER', 'Transfer'),
    )
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='token_ledger')
    action = models.CharField(max_length=10, choices=ACTION_CHOICES)
    amount = models.BigIntegerField(help_text='Token units in lowest denomination (wei-like)')
    tx_hash = models.CharField(max_length=100, blank=True, default='')
    meta = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['project', '-created_at']),
        ]


class Purchase(models.Model):
    buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='purchases')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='purchases')
    credits = models.BigIntegerField(help_text='Whole credits purchased (not lowest units)')
    price_per_credit = models.DecimalField(max_digits=12, decimal_places=2, help_text='Fiat price for UI/reference')
    tx_hash = models.CharField(max_length=100, blank=True, default='')
    status = models.CharField(max_length=20, default='Completed')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['buyer', '-created_at']),
            models.Index(fields=['project', '-created_at']),
        ]
