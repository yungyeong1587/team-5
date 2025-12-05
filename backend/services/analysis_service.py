"""
분석 서비스 (독립적)
"""
from sqlalchemy.orm import Session
from models.analysis import Analysis
from services.musinsa_api_crawler import MusinsaCrawler
from services.gemini_summarizer import GeminiSummarizer
import logging
import random
import json
import subprocess
import sys
import os

logger = logging.getLogger(__name__)

class AnalysisService:
    
    @staticmethod
    def create_analysis(db: Session, review_url: str) -> Analysis:
        analysis = Analysis(review_url=review_url, status='queued')
        db.add(analysis)
        db.commit()
        db.refresh(analysis)
        return analysis
    
    @staticmethod
    def get_analysis(db: Session, analysis_id: int) -> Analysis:
        return db.query(Analysis).filter(Analysis.analysis_id == analysis_id).first()
    
    @staticmethod
    def list_analyses(db: Session, status: str = None, skip: int = 0, limit: int = 10) -> list:
        query = db.query(Analysis)
        if status: query = query.filter(Analysis.status == status)
        analyses = query.order_by(Analysis.created_at.desc()).offset(skip).limit(limit).all()
        return [analysis.to_dict() for analysis in analyses]
    
    @staticmethod
    def update_analysis_status(db: Session, analysis_id: int, status: str, **kwargs):
        analysis = db.query(Analysis).filter(Analysis.analysis_id == analysis_id).first()
        if analysis:
            analysis.status = status
            for key, value in kwargs.items():
                if hasattr(analysis, key) and value is not None:
                    setattr(analysis, key, value)
            db.commit()
            db.refresh(analysis)
        return analysis
    
    @staticmethod
    async def analyze_with_ai(reviews: list, analysis_id: int, db: Session) -> dict:
        """AI 서버(subprocess) 실행 및 결과 반환"""
        try:
            input_data = {'reviews': reviews, 'analysis_id': analysis_id}
            input_json = json.dumps(input_data, ensure_ascii=False)
            
            my_env = os.environ.copy()
            my_env["PYTHONIOENCODING"] = "utf-8"

            # ai_analyzer.py 실행 (타임아웃 5분)
            process = subprocess.run(
                [sys.executable, 'services/ai_analyzer.py'],
                input=input_json,
                capture_output=True,
                text=True,
                encoding='utf-8', 
                env=my_env,
                timeout=300
            )
            
            if process.returncode != 0:
                raise Exception(f"AI 프로세스 오류: {process.stderr}")
            
            output_data = json.loads(process.stdout)
            if not output_data.get('success'):
                raise Exception(output_data.get('error', 'Unknown Error'))
            
            return output_data['result']
            
        except Exception as e:
            logger.error(f"[Analysis {analysis_id}] AI 분석 실패: {e}")
            # 실패 시 로직 중단 방지를 위해 기본값 반환
            return {'verdict': 'error', 'confidence': 0, 'enriched_reviews': reviews}

    @staticmethod
    async def process_analysis(analysis_id: int, review_url: str, db: Session):
        """전체 분석 파이프라인"""
        try:
            logger.info(f"[Analysis {analysis_id}] 🚀 분석 시작")
            AnalysisService.update_analysis_status(db, analysis_id, 'processing')
            
            # 1. 크롤링
            crawler = MusinsaCrawler()
            crawl_result = crawler.crawl_reviews(product_url=review_url, max_reviews=500)
            if not crawl_result['success']:
                raise Exception(crawl_result['message'])
            
            raw_reviews = crawl_result['reviews']
            logger.info(f"크롤링 완료: {len(raw_reviews)}개")

            # 2. AI 분석 실행
            ai_result = await AnalysisService.analyze_with_ai(raw_reviews, analysis_id, db)
            
            # 점수가 포함된 리뷰 리스트 가져오기 (없으면 원본)
            enriched_reviews = ai_result.get('enriched_reviews', raw_reviews)

            # 3. 데이터 포맷 통일 및 상위/하위 추출
            def normalize(r):
                """프론트엔드 호환 포맷 변환"""
                return {
                    "content": r.get('text') or r.get('content', ''),
                    "rating": int(r.get('rating', 0)),
                    "date": r.get('date', ''),
                    "author": r.get('author', '***'),
                    # AI 분석 결과 필드 (중요!)
                    "reliability_score": r.get('reliability_score', 0),
                    "analysis_label": r.get('analysis_label', '분석 대기'),
                    "color_class": r.get('color_class', 'status-gray')
                }

            # 평점 기준 분리
            high_rated = [r for r in enriched_reviews if r.get('rating', 0) >= 4]
            low_rated = [r for r in enriched_reviews if r.get('rating', 0) <= 2]
            
            # 랜덤 섞기
            random.shuffle(high_rated)
            random.shuffle(low_rated)
            
            # 상위 10개, 하위 10개 추출
            top_reviews = [normalize(r) for r in high_rated[:10]]
            worst_reviews = [normalize(r) for r in low_rated[:10]]

            # 4. Gemini 요약
            gemini_summary = ""
            try:
                summarizer = GeminiSummarizer()
                gemini_summary = summarizer.summarize_reviews(raw_reviews, max_reviews=50)
            except Exception as e:
                logger.error(f"Gemini 요약 실패: {e}")

            # 5. DB 저장
            AnalysisService.update_analysis_status(
                db, analysis_id, 'completed',
                verdict=ai_result.get('verdict'),
                confidence=ai_result.get('confidence'),
                review_count=len(raw_reviews),
                top_reviews=top_reviews,      
                worst_reviews=worst_reviews,
                summary=gemini_summary
            )
            logger.info(f"[Analysis {analysis_id}] ✅ 분석 완료")

        except Exception as e:
            logger.error(f"파이프라인 오류: {e}")
            AnalysisService.update_analysis_status(db, analysis_id, 'failed', error_message=str(e))