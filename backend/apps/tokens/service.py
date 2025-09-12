from dataclasses import dataclass
from decimal import Decimal
from django.conf import settings
from .models import TokenLedger
from apps.projects.models import Project


@dataclass
class TxResult:
    tx_hash: str
    simulated: bool


def _get_w3():
    if settings.TOKEN_DRY_RUN or not settings.WEB3_RPC_URL:
        return None
    try:
        from web3 import Web3
        from web3.middleware import geth_poa_middleware
    except Exception:
        # Web3 not available; treat as dry-run for now
        return None
    w3 = Web3(Web3.HTTPProvider(settings.WEB3_RPC_URL, request_kwargs={'timeout': 20}))
    # For networks like Polygon
    try:
        w3.middleware_onion.inject(geth_poa_middleware, layer=0)
    except Exception:
        pass
    return w3


def _to_units(credits: int) -> int:
    # credits are whole tokens; convert to smallest units using decimals
    return int(Decimal(credits) * (10 ** settings.TOKEN_DECIMALS))


def mint(project: Project, credits: int, meta: dict | None = None) -> TxResult:
    amount = _to_units(credits)
    if settings.TOKEN_DRY_RUN:
        rec = TokenLedger.objects.create(project=project, action='MINT', amount=amount, tx_hash='dryrun', meta=meta or {})
        project.total_credits_minted = (project.total_credits_minted or 0) + credits
        project.save(update_fields=['total_credits_minted', 'updated_at'])
        return TxResult(tx_hash=rec.tx_hash, simulated=True)
    # Real chain call would go here (requires ABI and contract binding). Deferred for now.
    rec = TokenLedger.objects.create(project=project, action='MINT', amount=amount, tx_hash='todo-real', meta=meta or {})
    return TxResult(tx_hash=rec.tx_hash, simulated=False)


def burn(project: Project, credits: int, meta: dict | None = None) -> TxResult:
    amount = _to_units(credits)
    if settings.TOKEN_DRY_RUN:
        rec = TokenLedger.objects.create(project=project, action='BURN', amount=amount, tx_hash='dryrun', meta=meta or {})
        project.total_credits_minted = max(0, (project.total_credits_minted or 0) - credits)
        project.save(update_fields=['total_credits_minted', 'updated_at'])
        return TxResult(tx_hash=rec.tx_hash, simulated=True)
    rec = TokenLedger.objects.create(project=project, action='BURN', amount=amount, tx_hash='todo-real', meta=meta or {})
    return TxResult(tx_hash=rec.tx_hash, simulated=False)
