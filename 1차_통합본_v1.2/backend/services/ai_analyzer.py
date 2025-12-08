"""
AI 리뷰 분석기 (독립 실행)
입력: JSON (stdin 또는 파일)
출력: JSON (stdout)
"""
import re
import sys
import json
import argparse
from pathlib import Path
import logging
import io
import joblib

# 한글 인코딩 설정
sys.stderr.flush()
sys.stdin = io.TextIOWrapper(sys.stdin.buffer, encoding='utf-8')
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stderr)]
)
logger = logging.getLogger(__name__)

class ReviewAIAnalyzer:
    """리뷰 AI 분석기 (KcELECTRA + Random Forest)"""
    
    def __init__(self, model_path="ai_models", retrain_model_path="backend/scripts/ai_models_retrained"):
        # 프로젝트 루트 기준 모델 경로 설정
        current_file = Path(__file__).resolve()
        project_root = current_file.parent.parent.parent
        
        self.base_model_path = project_root / model_path
        self.retrain_root = project_root / retrain_model_path
        
        # 최신 모델 경로
        self.model_path = self.get_latest_model_path()
        
        # RandomForest는 항상 ai_models에 고정
        self.rf_model_path = project_root / "ai_models" / "random_forest.pkl"

        self.model = None
        self.rf_model = None
        self.tokenizer = None
        self.device = None
        
        logger.info(f"="*60)
        logger.info(f"AI 분석기 초기화")
        logger.info(f"  KcELECTRA: {self.model_path}")
        logger.info(f"  RandomForest: {self.rf_model_path}")
        logger.info(f"="*60)

    def get_latest_model_path(self):
        """재학습된 모델 중 가장 최신 버전을 자동 선택"""
        try:
            if not self.retrain_root.exists():
                logger.info("📂 재학습 폴더 없음 → 기본 모델 사용")
                return self.base_model_path

            # 재학습 폴더 안의 model_YYYYMMDD_HHMMSS 같은 폴더 모두 가져오기
            model_dirs = [
                d for d in self.retrain_root.iterdir()
                if d.is_dir() and re.match(r"model_\d{8}_\d{6}", d.name)
            ]

            if not model_dirs:
                logger.info("📂 재학습 모델 없음 → 기본 모델 사용")
                return self.base_model_path

            # 가장 최근 모델 선택
            latest = max(model_dirs, key=lambda d: d.stat().st_mtime)

            logger.info(f"✅ 최신 재학습 모델 선택: {latest.name}")
            return latest

        except Exception as e:
            logger.error(f"❌ 최신 모델 탐색 실패: {e}")
            return self.base_model_path

    def load_model(self):
        """AI 모델 로드"""
        try:
            import torch
            from transformers import AutoModelForSequenceClassification, AutoTokenizer, AutoConfig
            
            logger.info("="*60)
            logger.info("AI 모델 로딩 시작...")
            logger.info("="*60)
            
            self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
            logger.info(f"🖥️  디바이스: {self.device}")
            
            # KcELECTRA 로드
            logger.info("📋 Config 로딩...")
            config = AutoConfig.from_pretrained(str(self.model_path), local_files_only=True)
            
            logger.info("📝 Tokenizer 로딩...")
            self.tokenizer = AutoTokenizer.from_pretrained(str(self.model_path), local_files_only=True)
            
            logger.info("🤖 KcELECTRA 로딩...")
            self.model = AutoModelForSequenceClassification.from_pretrained(
                str(self.model_path),
                config=config,
                local_files_only=True
            )
            self.model.to(self.device)
            self.model.eval()
            
            logger.info(f"✅ KcELECTRA 로딩 완료")

        except Exception as e:
            logger.error(f"❌ KcELECTRA 로딩 실패: {e}")
            return False
    
        # RandomForest 로드 (선택적)
        try:
            if self.rf_model_path.exists():
                self.rf_model = joblib.load(str(self.rf_model_path))
                logger.info("✅ RandomForest 로딩 완료")
                logger.info(f"   - Features: {self.rf_model.n_features_in_}")
            else:
                logger.warning(f"⚠️ RandomForest 파일 없음: {self.rf_model_path}")
                logger.warning("⚠️ KcELECTRA 단독 모드로 작동")
                self.rf_model = None
        except Exception as e:
            logger.error(f"⚠️ RandomForest 로딩 실패: {e}")
            logger.warning("⚠️ KcELECTRA 단독 모드로 작동")
            self.rf_model = None
        
        logger.info("="*60)
        if self.rf_model:
            logger.info("✅ 2단계 모드 (KcELECTRA + RandomForest)")
        else:
            logger.info("✅ 1단계 모드 (KcELECTRA 단독)")
        logger.info("="*60)
        
        return True

    def preprocess_reviews(self, reviews):
        """전처리: 텍스트가 있는 리뷰만 추출"""
        processed = []
        for review in reviews:
            # text나 content 키가 섞여있을 수 있으므로 둘 다 확인
            text = review.get('text', '') or review.get('content', '')
            if not text:
                continue
            
            # 원본 데이터 보존하며 text 필드 통일
            item = review.copy()
            item['text'] = text.strip()
            processed.append(item)
        
        logger.info(f"📊 전처리 완료: {len(processed)}개 리뷰")
        return processed
    
    def analyze_reviews(self, reviews):
        """리뷰 분석 수행 및 개별 점수 마킹"""
        try:
            import torch
            import torch.nn.functional as F
            
            logger.info("="*60)
            logger.info(f"AI 분석 시작: {len(reviews)}개 리뷰")
            logger.info("="*60)
            
            texts = [r['text'] for r in reviews]
            batch_size = 32
            all_trust_scores = []
            
            # ========================================
            # Step 1: KcELECTRA 텍스트 분석
            # ========================================
            logger.info("[Step 1] KcELECTRA 분석 중...")
            
            for i in range(0, len(texts), batch_size):
                batch_texts = texts[i:i+batch_size]
                
                inputs = self.tokenizer(
                    batch_texts,
                    return_tensors="pt",
                    truncation=True,
                    max_length=128,
                    padding=True
                ).to(self.device)
                
                with torch.no_grad():
                    outputs = self.model(**inputs)
                    probs = F.softmax(outputs.logits, dim=-1)
                    # 1번 클래스(신뢰/긍정) 확률 추출
                    trust_probs = probs[:, 1].cpu().tolist()
                    all_trust_scores.extend(trust_probs)
            
            logger.info(f"✅ KcELECTRA 분석 완료: {len(all_trust_scores)}개 점수")
            
            # ========================================
            # Step 2: RandomForest 2단계 판단 (있을 경우)
            # ========================================
            if self.rf_model is not None:
                logger.info("[Step 2] RandomForest 분석 중...")
                
                import numpy as np

                # 모델 입력 feature 수 자동 감지
                n_features = self.rf_model.n_features_in_

                rf_inputs = []
                for i, r in enumerate(reviews):
                    electra = all_trust_scores[i]
                    rating = r.get("rating", 0)

                    # Feature 수에 맞게 입력 구성
                    if n_features == 5:
                        features = [electra, rating, 0, 0, 0]  # [ELECTRA, 별점, 유저레벨, 도움, 답글]
                    elif n_features == 4:
                        features = [electra, rating, 0, 0]
                    elif n_features == 2:
                        features = [electra, rating]
                    else:
                        raise ValueError(f"지원하지 않는 RF 입력 feature 수: {n_features}")

                    rf_inputs.append(features)

                rf_inputs = np.array(rf_inputs)

                # RandomForest 예측
                rf_probs = self.rf_model.predict_proba(rf_inputs)
                final_scores = rf_probs[:, 1].tolist()   # 신뢰 확률
                
                logger.info(f"✅ RandomForest 분석 완료")
            else:
                # RandomForest 없으면 KcELECTRA 점수 그대로 사용
                logger.info("[Step 2] RandomForest 없음 → KcELECTRA 점수 사용")
                final_scores = all_trust_scores

            # ========================================
            # Step 3: 개별 리뷰에 점수 및 라벨/색상 부착
            # ========================================
            enriched_reviews = []
            for i, review in enumerate(reviews):
                score = final_scores[i] * 100  # 0~100점 변환

                # 라벨링 및 색상 결정
                if score >= 76:
                    label = "매우 도움됨"
                    color = "status-green"
                elif score >= 36:
                    label = "부분적으로 도움됨"
                    color = "status-orange"
                else:
                    label = "도움 안됨"
                    color = "status-red"

                # 리뷰 데이터에 점수 및 라벨 추가
                review["reliability_score"] = round(score, 1)
                review["analysis_label"] = label
                review["color_class"] = color

                enriched_reviews.append(review)
            
            # ========================================
            # Step 4: 전체 통계 및 판정
            # ========================================
            avg_trust = sum(final_scores) / len(final_scores) if final_scores else 0
            
            # 전체 판정 (기존 코드와 호환)
            if avg_trust > 0.7:
                verdict = 'safe'
                verdict_kr = '신뢰할 만함'
            elif avg_trust >= 0.3:
                verdict = 'suspicious'
                verdict_kr = '의심스러움'
            else:
                verdict = 'malicious'
                verdict_kr = '신뢰하기 어려움'

            confidence = round(avg_trust * 100, 2)
            
            result = {
                'verdict': verdict,
                'verdict_kr': verdict_kr,
                'confidence': confidence,
                'enriched_reviews': enriched_reviews,
                'details': {
                    'avg_trust_score': round(avg_trust, 4),
                    'avg_electra_score': round(sum(all_trust_scores)/len(all_trust_scores), 4),
                    'total_reviews': len(reviews),
                    'model_mode': 'KcELECTRA + RandomForest' if self.rf_model else 'KcELECTRA Only'
                }
            }
            
            logger.info("="*60)
            logger.info(f"✅ AI 분석 완료")
            logger.info(f"   - 판정: {verdict_kr}")
            logger.info(f"   - 신뢰도: {confidence}%")
            logger.info(f"   - 모드: {result['details']['model_mode']}")
            logger.info("="*60)
            
            return result
            
        except Exception as e:
            logger.error(f"❌ 분석 실패: {e}")
            import traceback
            traceback.print_exc()
            raise
    
    def run(self, reviews):
        if self.model is None:
            if not self.load_model():
                return {'verdict': 'error', 'confidence': 0, 'error': '모델 로딩 실패'}
        
        processed_reviews = self.preprocess_reviews(reviews)
        if not processed_reviews:
            return {'verdict': 'error', 'confidence': 0, 'error': '분석할 리뷰 없음'}
            
        return self.analyze_reviews(processed_reviews)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--input', type=str)
    parser.add_argument('--output', type=str)
    parser.add_argument('--model', type=str, default='ai_models')
    args = parser.parse_args()
    
    try:
        if args.input:
            with open(args.input, 'r', encoding='utf-8') as f:
                data = json.load(f)
        else:
            data = json.load(sys.stdin)
        
        reviews = data.get('reviews', [])
        
        analyzer = ReviewAIAnalyzer(model_path=args.model)
        result = analyzer.run(reviews)
        
        output_data = {'success': True, 'result': result}
        
        if args.output:
            with open(args.output, 'w', encoding='utf-8') as f:
                json.dump(output_data, f, ensure_ascii=False, indent=2)
        else:
            print(json.dumps(output_data, ensure_ascii=False))
            
    except Exception as e:
        error_data = {'success': False, 'error': str(e)}
        print(json.dumps(error_data, ensure_ascii=False))

if __name__ == "__main__":
    main()