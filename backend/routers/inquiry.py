from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional, List

from models.database import get_db
from models.admin import Admin
from models.schemas import (
    InquiryCreate,
    InquiryReplyCreate,
    InquirySummaryResponse,
    InquiryListResponse,
    InquiryDetailResponse,
    InquiryCreateResponse,
    InquiryReplyActionResponse,
    InquiryDetailData,
    InquiryReplyData,
)

from services.inquiry_service import (
    create_inquiry,
    get_inquiries,
    get_inquiries_by_user,
    get_inquiry_by_id,
    create_or_update_reply,
    delete_reply_for_inquiry,
)
from utils.dependencies import get_current_admin

router = APIRouter()

# ===== 사용자용 API =====

@router.post("/inquiries", response_model=InquiryCreateResponse, tags=["사용자 문의"])
def create_inquiry_alias(
    inquiry_data: InquiryCreate,
    db: Session = Depends(get_db),
):
    new_inquiry = create_inquiry(db, inquiry_data)
    return InquiryCreateResponse(
        success=True,
        result_code=200,
        message="문의가 성공적으로 등록되었습니다.",
        inquiry=new_inquiry
    )

@router.get("/user/inquiries", response_model=InquiryListResponse, tags=["사용자 문의"])
def get_user_inquiries(
    user_id: Optional[str] = Query(None, description="사용자 식별자"),
    db: Session = Depends(get_db),
):
    try:
        if not user_id:
            return InquiryListResponse(success=True, result_code=200, items=[], total=0)

        inquiries = get_inquiries_by_user(db, user_id)
        
        items = []
        for inq in inquiries:
            reply_data = None
            if inq.reply:
                reply_data = InquiryReplyData.model_validate(inq.reply)

            items.append(InquirySummaryResponse(
                inquiry_id=inq.inquiry_id,
                user_id=inq.user_id,
                title=inq.title,
                status=inq.status,
                created_at=inq.created_at,
                has_reply=(inq.reply is not None),
                content=inq.content,
                reply=reply_data
            ))
        
        return InquiryListResponse(success=True, result_code=200, items=items, total=len(items))
    except Exception as e:
        print(f"❌ 사용자 문의 내역 조회 오류: {e}")
        return InquiryListResponse(success=False, result_code=600, items=[], total=0)


# ===== 관리자용 API =====

@router.get("/admin/inquiries", response_model=InquiryListResponse, tags=["관리자 문의"])
def get_admin_inquiries(
    status: Optional[str] = Query(None),
    q: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    try:
        skip = (page - 1) * size
        inquiries, total = get_inquiries(
            db,
            skip=skip,
            limit=size,
            status=status,
            search_query=q,
        )

        items = []
        for inq in inquiries:
            reply_data = None
            if inq.reply:
                reply_data = InquiryReplyData.model_validate(inq.reply)

            items.append(InquirySummaryResponse(
                inquiry_id=inq.inquiry_id,
                user_id=inq.user_id,
                title=inq.title,
                status=inq.status,
                created_at=inq.created_at,
                has_reply=(inq.reply is not None),
                content=inq.content,
                reply=reply_data
            ))

        return InquiryListResponse(success=True, result_code=200, items=items, total=total)
    except Exception as e:
        print(f"❌ 문의 목록 조회 오류: {e}")
        return InquiryListResponse(success=False, result_code=600, items=[], total=0)

# ... (나머지 상세 조회 및 답변 등록 API는 기존과 동일하게 유지) ...
# 기존 코드의 get_admin_inquiry_detail, create_or_update_admin_reply, delete_admin_reply 등은 그대로 두셔도 됩니다.