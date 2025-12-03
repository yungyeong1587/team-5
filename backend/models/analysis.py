# backend/models/analysis.py
from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from datetime import datetime
from models.database import Base 

class Analysis(Base):
    __tablename__ = "analyses"  # DB의 실제 테이블 이름

    # DB 테이블의 컬럼과 똑같이 맞춰줍니다.
    # (sqlite viewer로 확인하셨을 때 컬럼명이 id라면 analysis_id 대신 id로 적어야 합니다)
    analysis_id = Column(Integer, primary_key=True, index=True) # 만약 DB 컬럼이 id라면 변수명을 id로 변경
    url = Column(String(500), index=True)
    reliability = Column(Float)
    created_at = Column(DateTime, default=datetime.now)