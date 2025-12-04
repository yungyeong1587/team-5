"""
분석 서비스 (독립적)
리뷰 분석 전담 (크롤링은 MusinsaCrawler에 위임)
"""
from sqlalchemy.orm import Session
from models.analysis import Analysis
from services.musinsa_api_crawler import MusinsaCrawler
from services.gemini_summarizer import GeminiSummarizer  # ✅ Gemini 요약 추가
import logging
import random # ✅ 랜덤 추출용 모듈 추가
import json
import subprocess
import time
import sys
import os

logger = logging.getLogger(__name__)

class AnalysisService:
    """분석 서비스"""
    
    @staticmethod
    def create_analysis(db: Session, review_url: str) -> Analysis:
        """분석 요청 생성"""
        analysis = Analysis(
            review_url=review_url,
            status='queued'
        )
        db.add(analysis)
        db.commit()
        db.refresh(analysis)
        return analysis
    
    @staticmethod
    def get_analysis(db: Session, analysis_id: int) -> Analysis:
        """분석 요청 조회"""
        return db.query(Analysis).filter(Analysis.analysis_id == analysis_id).first()
    
    @staticmethod
    def list_analyses(
        db: Session,
        status: str = None,
        skip: int = 0,
        limit: int = 10
    ) -> list:
        """분석 목록 조회"""
        query = db.query(Analysis)
        
        if status:
            query = query.filter(Analysis.status == status)
        
        analyses = query.order_by(Analysis.created_at.desc()).offset(skip).limit(limit).all()
        return [analysis.to_dict() for analysis in analyses]
    
    @staticmethod
    def update_analysis_status(
        db: Session, 
        analysis_id: int, 
        status: str,
        verdict: str = None,
        confidence: float = None,
        error_message: str = None,
        review_count: int = None,
        top_reviews: list = None,  
        worst_reviews: list = None,
        summary: str = None
    ):
        """분석 상태 업데이트"""
        analysis = db.query(Analysis).filter(Analysis.analysis_id == analysis_id).first()
        if analysis:
            analysis.status = status
            if verdict:
                analysis.verdict = verdict
            if confidence is not None:
                analysis.confidence = confidence
            if error_message:
                analysis.error_message = error_message
            if review_count is not None:
                analysis.review_count = review_count
            
            # ✅ [DB 저장] 리뷰 샘플 리스트 저장
            if top_reviews is not None:
                analysis.top_reviews = top_reviews
            if worst_reviews is not None:
                analysis.worst_reviews = worst_reviews
            if summary: analysis.summary = summary
                
            db.commit()
            db.refresh(analysis)
        return analysis
    
    @staticmethod
    async def analyze_with_ai(reviews: list, analysis_id: int, db: Session) -> dict:
        """
        AI 서버로 리뷰 분석 요청 (subprocess 실행)
        """
        try:
            logger.info(f"[Analysis {analysis_id}] ========================================")
            logger.info(f"[Analysis {analysis_id}] 🤖 AI 분석 시작")
            logger.info(f"[Analysis {analysis_id}] ========================================")
            logger.info(f"[Analysis {analysis_id}] 📊 리뷰 개수: {len(reviews)}개")
            
            # 1. 입력 데이터 준비
            logger.info(f"[Analysis {analysis_id}] 📝 Step 1: 입력 데이터 준비")
            input_data = {
                'reviews': reviews,
                'analysis_id': analysis_id
            }
            input_json = json.dumps(input_data, ensure_ascii=False)
            logger.info(f"[Analysis {analysis_id}] ✅ 입력 데이터 크기: {len(input_json)} bytes")
            
            # 2. AI 스크립트 실행
            logger.info(f"[Analysis {analysis_id}] 🚀 Step 2: AI 스크립트 실행 중...")
            logger.info(f"[Analysis {analysis_id}] 명령: python services/ai_analyzer.py")
            
            start_time = time.time()

            # [수정됨] 윈도우 환경 인코딩 문제 해결을 위한 환경변수 설정
            my_env = os.environ.copy()
            my_env["PYTHONIOENCODING"] = "utf-8"

            process = subprocess.run(
                [sys.executable, 'services/ai_analyzer.py'],
                input=input_json,
                capture_output=True,
                text=True,
                encoding='utf-8', 
                env=my_env,       # [수정됨] 여기에 env 옵션 추가!
                timeout=300,      
                bufsize=1
            )
            
            elapsed_time = time.time() - start_time
            logger.info(f"[Analysis {analysis_id}] ⏱️  실행 시간: {elapsed_time:.2f}초")
            
            # 3. 결과 파싱
            if process.returncode != 0:
                logger.error(f"[Analysis {analysis_id}] ❌ AI 스크립트 실행 실패!")
                logger.error(f"[Analysis {analysis_id}] STDERR: {process.stderr}")
                raise Exception(f"AI 스크립트 실행 실패: {process.stderr}")
            
            output_data = json.loads(process.stdout)
            
            if not output_data.get('success'):
                error_msg = output_data.get('error', 'AI 분석 실패')
                raise Exception(error_msg)
            
            ai_result = output_data['result']
            verdict = ai_result.get('verdict')
            confidence = ai_result.get('confidence', 0)
            
            logger.info(f"[Analysis {analysis_id}] ✅ AI 분석 완료: {verdict} ({confidence}%)")
            
            return {
                'success': True,
                'verdict': verdict,
                'confidence': confidence,
                'details': ai_result.get('details', {}),
                'message': 'AI 분석이 완료되었습니다.'
            }
            
        except subprocess.TimeoutExpired:
            logger.error(f"[Analysis {analysis_id}] ⏱️  AI 분석 타임아웃")
            AnalysisService.update_analysis_status(
                db, analysis_id, 'failed',
                error_message='AI 분석 시간 초과'
            )
            return {'success': False, 'message': 'AI 분석 시간이 초과되었습니다.'}
            
        except Exception as e:
            logger.error(f"[Analysis {analysis_id}] ❌ AI 분석 오류: {str(e)}")
            AnalysisService.update_analysis_status(
                db, analysis_id, 'failed',
                error_message=f'AI 분석 오류: {str(e)}'
            )
            return {'success': False, 'message': f'AI 분석 중 오류가 발생했습니다: {str(e)}'}

    @staticmethod
    async def summarize_with_gemini(reviews: list, analysis_id: int) -> str:
        """
        Gemini API로 리뷰 요약 생성
        
        Args:
            reviews: 리뷰 리스트
            analysis_id: 분석 ID (로깅용)
        
        Returns:
            요약 텍스트
        """
        try:
            logger.info(f"[Analysis {analysis_id}] 📝 Gemini 요약 시작")
            
            summarizer = GeminiSummarizer()
            summary = summarizer.summarize_reviews(
                reviews=reviews,
                max_reviews=200  # 토큰 제한 고려해서 50개만 샘플링
            )
            
            logger.info(f"[Analysis {analysis_id}] ✅ Gemini 요약 완료 ({len(summary)}자)")
            return summary
            
        except Exception as e:
            logger.error(f"[Analysis {analysis_id}] ❌ Gemini 요약 실패: {e}")
            # 실패해도 기본 요약 반환 (GeminiSummarizer가 처리)
            return "리뷰 요약을 생성할 수 없습니다."

    @staticmethod
    async def process_analysis(analysis_id: int, review_url: str, db: Session) -> dict:
        """
        전체 분석 파이프라인 실행
        """
        try:
            logger.info(f"")
            logger.info(f"{'='*70}")
            logger.info(f"[Analysis {analysis_id}] 🚀 분석 파이프라인 시작")
            logger.info(f"{'='*70}")
            
            # 1. 상태 업데이트
            AnalysisService.update_analysis_status(db, analysis_id, 'processing')
            
            # 2. 크롤링
            logger.info(f"[Analysis {analysis_id}] 🕷️  Step 1/4: 리뷰 크롤링")
            crawl_start = time.time()
            
            crawler = MusinsaCrawler()
            crawl_result = crawler.crawl_reviews(product_url=review_url, max_reviews=1000)
            
            crawl_time = time.time() - crawl_start
            
            if not crawl_result['success']:
                raise Exception(crawl_result['message'])
            
            logger.info(f"[Analysis {analysis_id}] ✅ 크롤링 완료 ({crawl_result['raw_count']}개)")

            logger.info(f"[Analysis {analysis_id}] 🎲 리뷰 샘플링 및 데이터 표준화")
            
            all_reviews = crawl_result['reviews']
            
            # ==================================================================
            # ✅ [핵심 수정] 데이터 표준화 함수 (이름표 통일)
            # ==================================================================
            def normalize_review(r):
                # 크롤러가 주는 키가 무엇이든 화면에서 쓰는 'content', 'rating', 'date'로 변환
                content = r.get('content') or r.get('message') or r.get('review_body') or r.get('text') or "내용 없음"
                date = r.get('date') or r.get('reg_date') or r.get('created_at') or ""
                rating = r.get('rating', 0)
                
                return {
                    "content": str(content).strip(),  # 강제로 문자열 변환
                    "rating": int(rating),            # 강제로 정수 변환
                    "date": str(date),
                    "author": r.get('author', '***')
                }
            # ==================================================================

            # 평점 기반 분류
            high_rated_reviews = [r for r in all_reviews if r.get('rating', 0) >= 4]
            low_rated_reviews = [r for r in all_reviews if r.get('rating', 0) <= 2]
            
            # 랜덤 섞기
            random.shuffle(high_rated_reviews)
            random.shuffle(low_rated_reviews)
            
            # 10개씩 추출하면서 동시에 표준화 적용 (!)
            top_reviews = [normalize_review(r) for r in high_rated_reviews[:10]]
            worst_reviews = [normalize_review(r) for r in low_rated_reviews[:10]]
            
            logger.info(f"[Analysis {analysis_id}] 👍 높은 평점 샘플: {len(top_reviews)}개")
            
            # ✅ [디버깅] 실제로 들어가는 데이터 확인 (로그 확인용)
            if top_reviews:
                logger.info(f"[DEBUG] 저장될 리뷰 데이터 예시: {top_reviews[0]}")
            
            # 3. AI 분석
            logger.info(f"[Analysis {analysis_id}] 🤖 Step 2/4: AI 신뢰도 분석")
            ai_start = time.time()
            
            ai_result = await AnalysisService.analyze_with_ai(
                reviews=crawl_result['reviews'],
                analysis_id=analysis_id,
                db=db
            )
            
            ai_time = time.time() - ai_start
            
            if not ai_result['success']:
                raise Exception(ai_result['message'])

            # 4. ✅ Gemini 요약 (새로 추가된 단계!)
            logger.info(f"[Analysis {analysis_id}] 📝 Step 3/4: Gemini 리뷰 요약")
            summary_start = time.time()
            
            # Gemini API로 요약 생성
            gemini_summary = await AnalysisService.summarize_with_gemini(
                reviews=crawl_result['reviews'],
                analysis_id=analysis_id
            )
            
            summary_time = time.time() - summary_start
            logger.info(f"[Analysis {analysis_id}] ✅ 요약 완료 (소요시간: {summary_time:.2f}초)")

            # 5. 최종 저장
            logger.info(f"[Analysis {analysis_id}] 💾 Step 4/4: 결과 저장 및 완료")

            AnalysisService.update_analysis_status(
                db, analysis_id, 'completed',
                verdict=ai_result['verdict'],
                confidence=ai_result['confidence'],
                review_count=len(crawl_result['reviews']),
                top_reviews=top_reviews,      # ✅ 표준화된 데이터 저장
                worst_reviews=worst_reviews,  # ✅ 표준화된 데이터 저장
                summary=gemini_summary        # ✅ Gemini 요약 저장
            )
            
            total_time = crawl_time + ai_time + summary_time
            analysis = AnalysisService.get_analysis(db, analysis_id)
            
            logger.info(f"{'='*70}")
            logger.info(f"[Analysis {analysis_id}] 🎉 분석 완료! (소요시간: {total_time:.2f}초)")
            logger.info(f"[Analysis {analysis_id}]  - 크롤링: {crawl_time:.2f}초")
            logger.info(f"[Analysis {analysis_id}]  - AI 분석: {ai_time:.2f}초")
            logger.info(f"[Analysis {analysis_id}]  - Gemini 요약: {summary_time:.2f}초")
            logger.info(f"{'='*70}")
            
            return {
                'success': True,
                'message': '분석이 완료되었습니다.',
                'analysis_id': analysis.analysis_id,
                'status': analysis.status,
                'verdict': analysis.verdict,
                'confidence': float(analysis.confidence) if analysis.confidence else None,
                'review_count': analysis.review_count,
                'top_reviews': top_reviews,      
                'worst_reviews': worst_reviews,
                'summary': gemini_summary  # ✅ Gemini 요약 반환
            }
            
        except Exception as e:
            logger.error(f"[Analysis {analysis_id}] ❌ 파이프라인 에러: {str(e)}")
            AnalysisService.update_analysis_status(db, analysis_id, 'failed', error_message=str(e))
            return {
                'success': False,
                'message': f'오류 발생: {str(e)}',
                'analysis_id': analysis_id,
                'status': 'failed'
            }