"""
RandomForest 재학습 (🔥 실제 리뷰 데이터 기반, ELECTRA 기반)
ai_analyzer.py와 100% 호환되는 모델만 저장한다.

⚠ 실행 위치: 반드시 backend 폴더에서 실행할 것
"""

import numpy as np
import pandas as pd
import joblib
from pathlib import Path
from tqdm import tqdm

import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix


# ================================================================
# ELECTRA 모델 로드
# ================================================================
MODEL_PATH = "../ai_models"
def load_electra(device):
    tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
    model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH)
    model.to(device)
    model.eval()
    return tokenizer, model


def electra_score(text, tokenizer, model, device):
    """텍스트 → ELECTRA 긍정 확률(softmax)"""
    if not isinstance(text, str) or text.strip() == "":
        return 0.5  # 중립 처리

    inputs = tokenizer(
        text,
        truncation=True,
        padding="max_length",
        max_length=128,
        return_tensors="pt"
    ).to(device)

    with torch.no_grad():
        logits = model(**inputs).logits
        prob = torch.softmax(logits, dim=1)[0][1].item()

    return prob


# ================================================================
# 실제 리뷰 데이터를 로드
# ================================================================
def load_dataset(csv_path):
    """
    CSV 파일 형식:
    review_text,rating
    "바지 만족합니다",5
    "품질 안좋음",1
    """
    df = pd.read_csv(csv_path)

    # 필요 컬럼 검사
    if "review_text" not in df.columns or "rating" not in df.columns:
        raise ValueError("CSV에는 반드시 review_text, rating 컬럼이 포함되어야 합니다.")

    # 라벨 정의: 정상 리뷰 판단 기준 (rating + 감정 일관성)
    # → RF가 학습할 target y
    labels = []

    for text, rating in zip(df["review_text"], df["rating"]):
        # 간단히 rating 기반 기본 라벨: 1=신뢰 / 0=불신
        if rating >= 4:
            labels.append(1)
        elif rating <= 2:
            labels.append(1)  # 별점 낮으면 보통 정당한 부정 리뷰
        else:
            labels.append(0)  # 3점 중립은 불확실

    df["label"] = labels
    return df


# ================================================================
# 재학습 메인 함수
# ================================================================
def train_rf():
    print("🔥 ELECTRA 기반 RandomForest 재학습 시작")

    device = "cuda" if torch.cuda.is_available() else "cpu"
    tokenizer, electra_model = load_electra(device)
    print(f"⚡ Device: {device}")

    # ------------------------------------------------------
    # 1) 실제 리뷰 데이터 불러오기
    # ------------------------------------------------------
    dataset_path = "dataset/reviews_cleaned.csv"  # ← 네가 지정할 경로
    df = load_dataset(dataset_path)
    print(f"📄 데이터 로드: {len(df)}건")

    # ------------------------------------------------------
    # 2) ELECTRA 점수 생성
    # ------------------------------------------------------
    print("🔍 ELECTRA 감정 점수 생성 중...")
    electra_scores = []

    for text in tqdm(df["review_text"], desc="ELECTRA scoring"):
        score = electra_score(text, tokenizer, electra_model, device)
        electra_scores.append(score)

    df["electra_score"] = electra_scores

    # ------------------------------------------------------
    # 3) feature 구성 (기존 구조 유지)
    # ------------------------------------------------------
    X = np.column_stack([df["electra_score"], df["rating"]])
    y = df["label"].to_numpy()

    print("📌 Feature shape:", X.shape)

    # ------------------------------------------------------
    # 4) 학습/검증 분리
    # ------------------------------------------------------
    test_ratio = 0.2 if len(df) >= 20 else 0.4  # 데이터 적으면 test 크게
    X_train, X_test, y_train, y_test = train_test_split(
        X, y,
        test_size=test_ratio,
        random_state=42,
        stratify=y if len(np.unique(y)) > 1 else None
    )

    # ------------------------------------------------------
    # 5) RandomForest 학습
    # ------------------------------------------------------
    rf = RandomForestClassifier(
        n_estimators=150,
        max_depth=10,
        min_samples_leaf=2,
        random_state=42,
        class_weight="balanced",
        n_jobs=-1
    )
    rf.fit(X_train, y_train)

    # ------------------------------------------------------
    # 6) 평가
    # ------------------------------------------------------
    print("📊 평가 결과")
    print("Train acc:", rf.score(X_train, y_train))
    print("Test acc:", rf.score(X_test, y_test))

    print("\nClassification Report:")
    print(classification_report(y_test, rf.predict(X_test)))

    # ------------------------------------------------------
    # 7) 모델 저장 (🔥 ai_analyzer.py와 100% 호환)
    # ------------------------------------------------------
    save_path = Path("../ai_models/random_forest.pkl")
    joblib.dump(rf, save_path)

    print(f"\n🎉 저장 완료 → {save_path.resolve()}")
    print("🔥 새로운 ELECTRA 기반 RF 모델 생성 완료!")


if __name__ == "__main__":
    train_rf()
