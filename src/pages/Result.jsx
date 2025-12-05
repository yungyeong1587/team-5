import React, { useState } from "react";
import { ArrowLeft, Info, ThumbsUp, ThumbsDown, Star, AlertCircle, X, RotateCcw } from "lucide-react";
import ReviewCheckIcon from "../components/icons/ReviewCheckIcon";

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
  // 모달 상태 관리 (추가됨)
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
  } = result;

  const score = confidence ? Math.round(confidence) : 0;
  const { color, bg, border, label } = getScoreInfo(score);

  return (
    <div className="min-h-screen bg-slate-50 pb-20 relative">
      
      {/* ---------------------------------------------------------------------- */}
      {/* [기능 추가] 신뢰도 점수 기준 모달 (팝업) */}
      {/* ---------------------------------------------------------------------- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-[90%] max-w-md rounded-2xl shadow-2xl p-6 relative animate-scale-up border border-slate-200">
            {/* 닫기 버튼 */}
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={24} />
            </button>

            {/* 모달 헤더 */}
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              신뢰도 점수 기준
            </h3>

            {/* 기준 1: Red */}
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="font-bold text-red-600 text-lg">0% ~ 35%</span>
              </div>
              <p className="text-red-500 text-sm leading-relaxed font-medium">
                상품 구매에 도움이 되지 않는 리뷰가 많습니다.
              </p>
            </div>

            {/* 기준 2: Orange */}
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span className="font-bold text-orange-600 text-lg">36% ~ 75%</span>
              </div>
              <p className="text-orange-500 text-sm leading-relaxed font-medium">
                상품 구매에 도움이 되는 정보가 일부 포함되어 있습니다.
              </p>
            </div>

            {/* 기준 3: Green */}
            <div className="bg-green-50 border border-green-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="font-bold text-green-700 text-lg">76% ~ 100%</span>
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
        {/* 상단: 점수 및 요약 카드 */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8 flex flex-col md:flex-row gap-12">

          {/* 제목 + 버튼 */}
          <div className="w-full">
            <div className="flex items-center justify-between px-2 pb-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold text-slate-800">분석 결과 리포트</h2>
                {/* [수정됨] 클릭 시 모달 열림 */}
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-blue-600 transition-colors"
                >
                  <Info size={16} />
                  <span>신뢰도 기준</span>
                </button>
              </div>

              {/* [수정됨] 새로운 분석하기 버튼 (항상 노출 및 초기화면 이동) */}
              <button
                onClick={onNewAnalyze || onBack}
                className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
              >
                <RotateCcw size={14} />
                새로운 분석하기
              </button>
            </div>

            {/* URL 표시 */}
            <div className="px-2 py-3 bg-slate-50 text-slate-500 text-sm border-b border-slate-200 truncate">
              {review_url}
            </div>

            {/* 종합 점수 UI */}
            <div className="flex justify-center mt-10">
              <div
                className={`w-72 h-72 rounded-full border-[14px] flex flex-col items-center justify-center ${border} ${bg}`}
              >
                <span className="text-sm text-slate-500 mb-1">종합 리뷰 지표</span>
                <div className="flex items-baseline">
                  <span className={`mr-2 text-7xl font-extrabold ${color}`}>{score}</span>
                  <span className="text-2xl text-slate-500">/100</span>
                </div>
                <span className={`mt-3 text-xl font-semibold ${color}`}>{label}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 상세 리뷰 리스트 (변경 없음) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <ReviewListCard
            title="높은 평점 리뷰 분석 (TOP 10)"
            reviews={top_reviews}
            icon={<Star className="text-yellow-400 fill-yellow-400" />}
          />
          <ReviewListCard
            title="낮은 평점 리뷰 분석 (TOP 10)"
            reviews={worst_reviews}
            icon={<AlertCircle className="text-red-400" />}
          />
        </div>

        {/* AI 요약 (변경 없음) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <ReviewCheckIcon className="w-5 h-5 text-blue-600" />
            AI 리뷰 요약
          </h2>

          <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 text-slate-700 leading-relaxed whitespace-pre-line">
            {summary || "요약 정보가 없습니다."}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm">이 분석 결과가 도움이 되었나요?</p>
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
// 3. 리스트 카드 컴포넌트 (변경 없음)
// ----------------------------------------------------------------------
function ReviewListCard({ title, reviews, icon }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[600px]">
      <div className="p-5 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
        {icon}
        <h3 className="font-bold text-slate-800">{title}</h3>
      </div>

      <div className="overflow-y-auto flex-1 p-0 custom-scrollbar">
        {(!reviews || reviews.length === 0) ? (
          <div className="h-full flex items-center justify-center text-slate-400 text-sm">
            리뷰 데이터가 없습니다.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-white sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="p-3 text-xs font-semibold text-slate-500 w-[55%]">리뷰 내용</th>
                <th className="p-3 text-xs font-semibold text-slate-500 text-center w-[15%]">평점</th>
                <th className="p-3 text-xs font-semibold text-slate-500 text-center w-[15%]">신뢰도</th>
                <th className="p-3 text-xs font-semibold text-slate-500 text-center w-[15%]">분석</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reviews.map((review, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 align-top">
                    <p className="text-sm text-slate-700 mb-1" title={review.content}>
                      {review.content}
                    </p>
                    <div className="text-xs text-slate-400 flex items-center gap-2">
                      <span>{review.author || "익명"}</span>
                      <span>•</span>
                      <span>{review.date ? new Date(review.date).toLocaleDateString() : "-"}</span>
                    </div>
                  </td>

                  <td className="p-3 text-center align-middle">
                    <div className="flex items-center justify-center gap-1 text-yellow-500 font-bold text-sm">
                      <Star size={12} fill="currentColor" />
                      {review.rating}
                    </div>
                  </td>

                  <td className="p-3 text-center align-middle">
                    <span className="font-bold text-slate-700 text-sm">
                      {review.reliability_score ? review.reliability_score : 0}%
                    </span>
                  </td>

                  <td className="p-3 text-center align-middle">
                    <StatusBadge
                      label={review.analysis_label}
                      colorClass={review.color_class}
                      score={review.reliability_score}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 4. 배지 컴포넌트 (변경 없음)
// ----------------------------------------------------------------------
function StatusBadge({ label, colorClass, score }) {
  let finalColorClass = "";
  let finalLabel = label;

  if (colorClass) {
    if (colorClass === "status-green") finalColorClass = "bg-green-100 text-green-700 border-green-200";
    else if (colorClass === "status-orange") finalColorClass = "bg-orange-100 text-orange-700 border-orange-200";
    else if (colorClass === "status-red") finalColorClass = "bg-red-100 text-red-700 border-red-200";
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
    <span className={`inline-block px-2 py-1 rounded-md text-xs font-bold border ${finalColorClass} whitespace-nowrap`}>
      {finalLabel || "-"}
    </span>
  );
}