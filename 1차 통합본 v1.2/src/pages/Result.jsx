// src/pages/Result.jsx
import React, { useState } from "react";
import {
  ArrowLeft,
  Info,
  ThumbsUp,
  ThumbsDown,
  Star,
  AlertCircle,
  X,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import ReviewCheckIcon from "../components/icons/ReviewCheckIcon";

// ----------------------------------------------------------------------
// 0. 리뷰 문장 하이라이트용 헬퍼들
// ----------------------------------------------------------------------

// 👍 긍정 키워드들
const POSITIVE_KEYWORDS = [
  "좋아요",
  "좋았",
  "좋은",
  "만족",
  "추천",
  "예쁘",
  "이쁘",
  "맘에 들어",
  "맘에들",
  "잘 맞",
  "잘맞",
  "편하",
  "편해",
  "따뜻",
  "최고",
  "괜찮",
  "만족도",
  "존예",
  "존예탬",
  "존맛",
  "존좋",
  "미쳤다",
  "미쳤어요",
  "미쳤음",
  "미쳤네",
  "대박",
  "대박이야",
  "레전드",
  "찐이다",
  "인생템",
  "최애템",
  "최애",
  "갓템",
  "강추",
  "강력추천",
  "재구매",
  "또 살",
  "재구매각",
  "역대급",
  "혜자",
  "가성비 좋",
  "갓성비",
  "퀄리티 좋",
  "퀄리티 미쳤",
  "핏 예쁘",
  "핏이 미쳤",
  "핏 미쳤",
  "색감 예쁘",
  "색감 미쳤",
  "부드럽",
  "쫀쫀",
  "포근",
  "따숩",
  "따수워",
  "데일리로 딱",
  "데일리템",
  "매일 입게됨",
  "손이 자주 가요",
  "느좋",
  "찰떡",
  "찰떡이에요",
  "찰떡이네",
  "찰떡핏",
  "핏이 진짜",
  "핏 짱",
  "핏 최고",
  "핏 굿",
  "핏 완전",
  "완전 만족",
  "완전 좋아",
  "완전 추천",
  "진짜 예쁨",
  "진짜 좋아요",
  "진짜 편함",
  "진짜 괜찮",
  "진짜 미쳤",
  "인생핏",
  "인생착용",
  "인생템 인정",
  "기대 이상",
  "기대한 것 이상",
  "예상 이상",
  "생각보다 좋",
  "생각한 것보다 좋",
  "색감 대박",
  "색감 존예",
  "색감 굿",
  "색감 예뻐요",
  "착용감 좋",
  "착용감 미쳤",
  "촉감 좋",
  "촉감 부드럽",
  "질감 좋",
  "재질 좋",
  "재질 굿",
  "재질 미쳤",
  "탄탄",
  "탄탄하",
  "가볍고 좋",
  "가벼워서 좋",
  "가볍고 편해",
  "여리여리",
  "여리핏",
  "부담없",
  "무난하게 좋",
  "무난템",
  "실물이 더 예쁘",
  "실물이 미쳤",
  "사진보다 예쁨",
  "사진이랑 똑같",
  "사진과 동일",
  "빠른 배송",
  "배송 빨랐",
  "배송 굿",
  "포장 깔끔",
  "포장 예쁨",
  "가격 대비 굿",
  "가격 대비 괜찮",
  "가격대비 최고",
  "가성비 갑",
  "마음에 쏙",
  "마음에 쏙 들어요",
  "너무 만족",
  "너무 좋아요",
  "너무 이뻐요",
  "너무 예뻐요",
  "너무 좋아서",
  "너무 마음에",
  "완전 마음에",
  "완전 예쁨",
  "완전 만족",
  "완전 굿",
  "세련된",
  "깔끔하",
  "다양하게 코디 가능",
  "코디하기 좋",
  "어디에나 잘 어울",
  "데일리로 최고",
  "데일리 추천",
  "데일리로 자주 입",
  "재구매 의사",
  "또 사고 싶어요",
  "또 구매할 예정",
  "대만족",
  "괜찮음",
  "괜찮아요",
];

// 👎 부정 키워드들
const NEGATIVE_KEYWORDS = [
  "불만족",
  "별로",
  "최악",
  "실망",
  "실망스러",
  "안 좋",
  "안좋",
  "아쉽",
  "불편",
  "다시 사지",
  "다시는 사지",
  "비추",
  "후회",
  "짜증",
  "별로였",
  "별로에요",
  "최악이었",
  "별로였어요",
  "구림",
  "구려요",
  "구렸",
  "구리",
  "구리네요",
  "엉망",
  "엉망이었",
  "형편없",
  "형편없었",
  "형편없네요",
  "거지같",
  "별로임",
  "별로임니다",
  "다신 안",
  "다시는 안",
  "두번 안",
  "두 번 다시",
  "돈 아까",
  "돈아까",
  "돈값 못",
  "돈값 못하",
  "돈값 못함",
  "돈낭비",
  "비싸기만",
  "값어치 없",
  "퀄리티 떨어",
  "퀄리티 별로",
  "퀄리티 낮",
  "저렴해 보",
  "싸보여",
  "싸보임",
  "잡티",
  "보풀",
  "보풀이",
  "늘어남",
  "늘어나요",
  "찢어",
  "색 다름",
  "색상이 다름",
  "사진이랑 다름",
  "사진과 달라요",
  "별로다 진짜",
  "노답",
  "답없",
  "ㅈ같",
  "노잼",
  "구데기",
  "별로에요 ㅠ",
  "실망임",
  "실망각",
  "실망했어요",
  "민폐",
  "개별로",
  "개실망",
  "개노답",
  "헛돈",
  "현타",
  "핵별로",
  "쌉별로",
  "에바",
  "개에바",
  "에바임",
  "애바",
  "오바임",
  "오바야",
  "말도안됨",
  "어이없",
  "정떨어",
  "정떨",
  "정뚝떨",
  "극혐",
  "혐오",
  "진심 별로",
  "진짜 별로",
  "좀 별로",
  "좀 아쉽",
  "망했",
  "망함",
  "망했어요",
  "배송 늦",
  "배송 느림",
  "배송 지연",
  "포장 엉망",
  "구김",
  "냄새",
  "냄새 심함",
  "냄새나요",
  "오염",
  "얼룩",
  "하자",
  "하자있음",
  "하자 있습니다",
  "불량",
  "불량품",
  "이염",
  "박음질 엉망",
  "박음질 별로",
  "박음질 안좋",
  "핏 안예쁨",
  "핏 망",
  "핏 별로",
  "핏 이상",
  "불편함",
  "답답",
  "꾸깃",
];

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// 단어들을 하나의 정규식으로 묶기
const SENTIMENT_REGEX =
  POSITIVE_KEYWORDS.length || NEGATIVE_KEYWORDS.length
    ? new RegExp(
        `(${[...POSITIVE_KEYWORDS, ...NEGATIVE_KEYWORDS]
          .map(escapeRegExp)
          .join("|")})`,
        "gi"
      )
    : null;

const POS_REGEX =
  POSITIVE_KEYWORDS.length > 0
    ? new RegExp(POSITIVE_KEYWORDS.map(escapeRegExp).join("|"), "i")
    : null;

const NEG_REGEX =
  NEGATIVE_KEYWORDS.length > 0
    ? new RegExp(NEGATIVE_KEYWORDS.map(escapeRegExp).join("|"), "i")
    : null;

/**
 * 리뷰 문장 안에서 긍/부정 키워드를 찾아서
 * 긍정 → 파란 형광, 부정 → 빨간 형광으로 표시
 */
function highlightReviewText(text) {
  if (!text || !SENTIMENT_REGEX) return text;

  const parts = text.split(SENTIMENT_REGEX);

  return parts.map((part, idx) => {
    if (!part) return null;

    const isNegative = NEG_REGEX && NEG_REGEX.test(part);
    const isPositive = POS_REGEX && POS_REGEX.test(part);

    if (isNegative) {
      return (
        <mark key={idx} className="bg-red-100 text-slate-900 rounded px-0.5">
          {part}
        </mark>
      );
    }

    if (isPositive) {
      return (
        <mark key={idx} className="bg-blue-100 text-slate-900 rounded px-0.5">
          {part}
        </mark>
      );
    }

    return <span key={idx}>{part}</span>;
  });
}

// ----------------------------------------------------------------------
// 1. 헬퍼 함수 (점수별 색상/텍스트 로직)
// ----------------------------------------------------------------------
function getScoreInfo(score) {
  if (score >= 76)
    return {
      color: "text-green-600",
      bg: "bg-green-50",
      border: "border-green-500",
      label: "매우 도움됨",
    };

  if (score >= 36)
    return {
      color: "text-orange-500",
      bg: "bg-orange-50",
      border: "border-orange-400",
      label: "부분적으로 도움됨",
    };

  return {
    color: "text-red-500",
    bg: "bg-red-50",
    border: "border-red-400",
    label: "도움 안 됨",
  };
}

// ----------------------------------------------------------------------
// 2. 메인 컴포넌트
// ----------------------------------------------------------------------
export default function Result({ result, onBack, onNewAnalyze }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <p className="text-slate-500 mb-4">분석 결과가 없습니다.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          홈으로 돌아가기
        </button>
      </div>
    );
  }

  const {
    review_url,
    confidence,
    top_reviews = [],
    worst_reviews = [],
    summary,
    avg_rating, // ⭐ 백엔드 평균 별점
  } = result;

  // 디버깅: avg_rating 값 확인
  console.log("📊 avg_rating 값:", avg_rating, "타입:", typeof avg_rating);

  const score = confidence ? Math.round(confidence) : 0;
  const { color, bg, label } = getScoreInfo(score);

  // avg_rating이 숫자이고 0보다 크면 표시
  const ratingFromBackend =
    typeof avg_rating === "number" &&
    !Number.isNaN(avg_rating) &&
    avg_rating > 0
      ? avg_rating
      : null;

  const filledStars =
    ratingFromBackend !== null
      ? Math.round(Math.min(Math.max(ratingFromBackend, 0), 5))
      : 0;

  // 원형 게이지용 색상 / 진행도
  const clampedScore = Math.max(0, Math.min(score, 100));
  const ringColor =
    clampedScore >= 76 ? "#22c55e" : clampedScore >= 36 ? "#fb923c" : "#ef4444";

  return (
    <div className="min-h-screen bg-slate-50 pb-20 relative">
      {/* 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-[90%] max-w-md rounded-2xl shadow-2xl p-6 relative animate-scale-up border border-slate-200">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={24} />
            </button>

            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              신뢰도 점수 기준
            </h3>

            <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="font-bold text-red-600 text-lg">0% ~ 35%</span>
              </div>
              <p className="text-red-500 text-sm leading-relaxed font-medium">
                상품 구매에 도움이 되지 않는 리뷰가 많습니다.
              </p>
            </div>

            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <span className="font-bold text-orange-600 text-lg">
                  36% ~ 75%
                </span>
              </div>
              <p className="text-orange-500 text-sm leading-relaxed font-medium">
                상품 구매에 도움이 되는 정보가 일부 포함되어 있습니다.
              </p>
            </div>

            <div className="bg-green-50 border border-green-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="font-bold text-green-700 text-lg">
                  76% ~ 100%
                </span>
              </div>
              <p className="text-green-600 text-sm leading-relaxed font-medium">
                상품 구매에 실질적인 도움을 주는 신뢰할 수 있는 리뷰입니다.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 헤더 */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-bold">다른 상품 분석하기</span>
          </button>
          <div className="flex items-center gap-2">
            <ReviewCheckIcon className="w-6 h-6 text-blue-600" />
            <span className="font-extrabold text-slate-800">Review Check</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 animate-fade-in-up">
        {/* 상단: 점수 카드 */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
          {/* 타이틀 영역 */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-slate-800">
                분석 결과 리포트
              </h2>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-blue-600 transition-colors"
              >
                <Info size={16} />
                <span>신뢰도 기준</span>
              </button>
            </div>

            <button
              onClick={onNewAnalyze || onBack}
              className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
            >
              <RotateCcw size={14} />
              새로운 분석하기
            </button>
          </div>

          {/* URL 표시 */}
          <div className="px-4 py-3 mb-4 rounded-xl bg-slate-50 text-slate-500 text-sm border border-slate-100 truncate">
            {review_url}
          </div>

          {/* 메인 지표 영역 */}
          <div className="mt-8">
            <div className="w-full max-w-4xl mx-auto bg-slate-50/50 rounded-3xl border border-slate-200 p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center justify-center gap-12 lg:gap-20">
                {/* 1. 왼쪽: 평균 별점 */}
                {ratingFromBackend !== null ? (
                  <div className="flex flex-col items-center">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                      전체 리뷰 평균 별점
                    </p>

                    <div className="flex items-end gap-2 mb-2">
                      <span className="text-6xl font-black text-slate-800 leading-none">
                        {ratingFromBackend.toFixed(1)}
                      </span>
                      <span className="text-2xl text-slate-400 font-medium pb-1">
                        / 5.0
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={24}
                          className={
                            i < filledStars
                              ? "text-yellow-400 fill-yellow-400 drop-shadow-[0_2px_4px_rgba(250,204,21,0.4)]"
                              : "text-slate-200 fill-slate-100"
                          }
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                      전체 리뷰 평균 별점
                    </p>
                    <div className="flex items-end gap-2 mb-2">
                      <span className="text-4xl font-black text-slate-300 leading-none">
                        평점 정보 없음
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                      별점 데이터를 불러올 수 없습니다
                    </p>
                  </div>
                )}

                {/* 가운데 구분선 (데스크톱) */}
                <div className="hidden md:block w-px h-32 bg-gradient-to-b from-transparent via-slate-300 to-transparent" />

                {/* 2. 오른쪽: 종합 신뢰도 지표 */}
                <div className="flex flex-col items-center">
                  <div className="relative w-56 h-56 md:w-64 md:h-64">
                    {/* 바깥 게이지 */}
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: `conic-gradient(${ringColor} ${
                          clampedScore * 3.6
                        }deg, #e5e7eb 0deg)`,
                      }}
                    />
                    {/* 안쪽 흰 원 */}
                    <div className="absolute inset-[10px] rounded-full bg-white flex flex-col items-center justify-center shadow-inner">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                        종합 리뷰 지표
                      </span>
                      <div className="flex items-baseline">
                        <span
                          className={`mr-0.5 text-6xl md:text-7xl font-black ${color}`}
                        >
                          {score}
                        </span>
                        <span className="text-lg text-slate-400 font-medium">
                          /100
                        </span>
                      </div>

                      {/* 점수 라벨 */}
                      <span
                        className={`mt-4 px-4 py-1 rounded-full text-xs font-semibold ${color} ${bg}`}
                      >
                        {label}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ReviewListCard
            title="높은 평점 리뷰 (Top 10)"
            reviews={top_reviews}
            variant="best"
          />
          <ReviewListCard
            title="낮은 평점 리뷰 (Top 10)"
            reviews={worst_reviews}
            variant="worst"
          />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <ReviewCheckIcon className="w-5 h-5 text-blue-600" />
            AI 리뷰 요약
          </h2>

          <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 text-slate-700 leading-relaxed whitespace-pre-line">
            {summary || "요약 정보가 없습니다."}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm">
              이 분석 결과가 도움이 되었나요?
            </p>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 text-slate-600 hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-all">
                <ThumbsUp size={16} /> 도움이 됨
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all">
                <ThumbsDown size={16} /> 부족함
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// ----------------------------------------------------------------------
// 3. 리스트 카드 컴포넌트 (카드 형식 + 상세보기)
// ----------------------------------------------------------------------
function ReviewListCard({ title, reviews, variant }) {
  const [openIndex, setOpenIndex] = useState(null);

  const isBest = variant === "best";
  const headerBg = isBest ? "bg-emerald-50" : "bg-rose-50";
  const headerBorder = isBest ? "border-emerald-200" : "border-rose-200";
  const headerText = isBest ? "text-emerald-700" : "text-rose-700";
  const iconBg = isBest ? "text-emerald-500" : "text-rose-500";

  return (
    <div
      className={`rounded-3xl shadow-sm border ${headerBorder} bg-white flex flex-col h-[620px]`}
    >
      {/* 헤더 */}
      <div
        className={`${headerBg} border-b ${headerBorder} rounded-t-3xl px-6 py-4 flex items-center gap-2`}
      >
        <span className={iconBg}>
          {isBest ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
        </span>
        <h3 className={`font-bold text-sm ${headerText}`}>{title}</h3>
      </div>

      {/* 내용 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 custom-scrollbar">
        {!reviews || reviews.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-400 text-sm">
            리뷰 데이터가 없습니다.
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review, idx) => {
              const isOpen = openIndex === idx;
              const reliability = review.reliability_score ?? 0;

              return (
                <div
                  key={idx}
                  className="bg-white border border-slate-200 rounded-2xl shadow-[0_4px_10px_rgba(15,23,42,0.04)] overflow-hidden"
                >
                  {/* 카드 상단 */}
                  <div className="px-5 py-4 flex flex-col gap-2">
                    {/* 메타 정보 줄 */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {review.author || "익명"}
                        </span>
                        <span>•</span>
                        <span>
                          {review.date
                            ? new Date(review.date).toLocaleDateString()
                            : "-"}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-amber-400 font-semibold">
                          <Star size={14} className="fill-amber-400" />
                          <span className="text-xs text-slate-700">
                            {review.rating ?? "-"}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500">
                          신뢰도{" "}
                          <span className="font-semibold text-slate-800">
                            {reliability}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 내용 (하이라이팅 적용) */}
                    <p className="text-sm text-slate-900 leading-relaxed">
                      {highlightReviewText(review.content)}
                    </p>
                  </div>

                  {/* 상세보기 토글 */}
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between px-5 py-2.5 text-[11px] text-slate-600 bg-slate-50 hover:bg-slate-100 border-t border-slate-100 transition-all duration-200 group"
                  >
                    <span className="flex items-center gap-1.5">
                      <svg
                        className="w-3.5 h-3.5 text-blue-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        />
                      </svg>
                      <span className="font-medium">
                        {isOpen ? "분석 근거 닫기" : "AI 분석 근거 보기"}
                      </span>
                    </span>
                    <span className="text-[10px] text-slate-400 group-hover:text-slate-600 transition-colors">
                      {isOpen ? "▲" : "▼"}
                    </span>
                  </button>

                  {/* 분석 근거 영역 */}
                  {isOpen && (
                    <div className="px-5 py-3 bg-gradient-to-br from-slate-50 to-slate-100 border-t border-slate-200">
                      <div className="flex items-start gap-2">
                        {/* 아이콘 */}
                        <div className="flex-shrink-0 mt-0.5">
                          <svg
                            className="w-4 h-4 text-blue-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                            />
                          </svg>
                        </div>

                        {/* 텍스트 */}
                        <div className="flex-1">
                          <p className="text-[10px] font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                            AI 분석 근거
                            {review.analysis_reason && (
                              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[9px] font-medium">
                                Gemini
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            {review.analysis_reason ||
                              `AI 분석 결과 ${reliability}%의 신뢰도를 산출했습니다. 리뷰 내용, 작성 패턴, 키워드 분석 등을 종합하여 평가했습니다.`}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 4. 배지 컴포넌트
// ----------------------------------------------------------------------
function StatusBadge({ label, colorClass, score }) {
  let finalColorClass = "";
  let finalLabel = label;

  if (colorClass) {
    if (colorClass === "status-green")
      finalColorClass = "bg-green-100 text-green-700 border-green-200";
    else if (colorClass === "status-orange")
      finalColorClass = "bg-orange-100 text-orange-700 border-orange-200";
    else if (colorClass === "status-red")
      finalColorClass = "bg-red-100 text-red-700 border-red-200";
    else finalColorClass = "bg-slate-100 text-slate-600 border-slate-200";
  } else {
    if (score >= 76) {
      finalColorClass = "bg-green-100 text-green-700 border-green-200";
      if (!finalLabel) finalLabel = "매우 도움됨";
    } else if (score >= 36) {
      finalColorClass = "bg-orange-100 text-orange-700 border-orange-200";
      if (!finalLabel) finalLabel = "부분적으로 도움됨";
    } else {
      finalColorClass = "bg-red-100 text-red-700 border-red-200";
      if (!finalLabel) finalLabel = "도움 안됨";
    }
  }

  return (
    <span
      className={`inline-block px-2 py-1 rounded-md text-xs font-bold border ${finalColorClass} whitespace-nowrap`}
    >
      {finalLabel || "-"}
    </span>
  );
}
