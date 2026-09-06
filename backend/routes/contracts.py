from fastapi import APIRouter, HTTPException, status
from typing import List, Dict, Any, Optional
from ..models import ContractItem, CracUpdateRequest, PaymentUpdateRequest
from ..database import get_all_contracts, update_contract_crac, update_contract_payment

router = APIRouter(prefix="/api/contracts", tags=["Contracts, CRAC & Payments"])

@router.get("", response_model=List[Dict[str, Any]])
def list_contracts():
    """
    Retrieve all awarded digital contracts and purchase orders (POs).
    """
    return get_all_contracts()

@router.patch("/{po_id}/crac", response_model=Dict[str, Any])
def submit_crac_inspection(po_id: str, payload: CracUpdateRequest):
    """
    Consignee Receipt and Acceptance Certificate (CRAC) inspection approval under GFR 2017.
    """
    updated = update_contract_crac(po_id=po_id, crac_status=payload.cracStatus, notes=payload.inspectionNotes)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Purchase Order '{po_id}' not found."
        )
    return updated

@router.patch("/{po_id}/payment", response_model=Dict[str, Any])
def process_payment_disbursement(po_id: str, payload: PaymentUpdateRequest):
    """
    Trigger 10-day guaranteed digital payment settlement via PFMS Gateway.
    """
    updated = update_contract_payment(po_id=po_id, payment_status=payload.paymentStatus, disbursement_ref=payload.disbursementRef)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Purchase Order '{po_id}' not found."
        )
    return updated
