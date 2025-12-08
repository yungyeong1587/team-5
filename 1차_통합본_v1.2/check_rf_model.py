"""
Random Forest 모델 정보 확인
"""
import joblib
import numpy as np
from pathlib import Path

# 모델 로드
rf_path = Path("ai_models/random_forest.pkl")

if not rf_path.exists():
    print(f"❌ 모델 파일 없음: {rf_path}")
    exit(1)

print(f"📂 모델 경로: {rf_path}")
print("="*60)

rf_model = joblib.load(str(rf_path))

print("🌲 Random Forest 모델 정보")
print("="*60)
print(f"Feature 수: {rf_model.n_features_in_}")
print(f"트리 개수: {rf_model.n_estimators}")
print(f"클래스 수: {rf_model.n_classes_}")
print(f"클래스: {rf_model.classes_}")
print(f"Max depth: {rf_model.max_depth}")
print("="*60)

# 테스트 예측
print("\n🧪 테스트 예측")
print("="*60)

# Feature 수에 맞게 테스트 데이터 생성
n_features = rf_model.n_features_in_

test_cases = [
    ("긍정 텍스트 + 5점", [0.9, 5] + [0] * (n_features - 2)),
    ("부정 텍스트 + 5점 (조작 의심)", [0.2, 5] + [0] * (n_features - 2)),
    ("긍정 텍스트 + 1점 (이상)", [0.9, 1] + [0] * (n_features - 2)),
    ("부정 텍스트 + 1점", [0.2, 1] + [0] * (n_features - 2)),
    ("중립 텍스트 + 3점", [0.5, 3] + [0] * (n_features - 2)),
]

for name, features in test_cases:
    X = np.array([features])
    pred = rf_model.predict(X)[0]
    proba = rf_model.predict_proba(X)[0]
    
    print(f"{name:30s} → 예측: {pred}, 확률: {proba[1]*100:.1f}%")

print("="*60)

# Feature Importance
print("\n📊 Feature Importance")
print("="*60)
importances = rf_model.feature_importances_

feature_names = ["ELECTRA", "Rating"] + [f"Feature_{i}" for i in range(2, n_features)]

for name, imp in zip(feature_names, importances):
    print(f"{name:15s}: {imp:.4f} {'█' * int(imp * 50)}")

print("="*60)