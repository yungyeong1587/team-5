// src/pages/Result.jsx
import React from "react";
import { Info, ThumbsUp, ThumbsDown } from "lucide-react";
import ReviewCheckIcon from "../components/icons/ReviewCheckIcon";

// 점수에 따라 색 / 라벨 결정
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

function HighlightedReview({ content, highlight }) {
  if (!highlight || !content) return <>{content}</>;
  const idx = content.indexOf(highlight);
  if (idx === -1) return <>{content}</>;

  return (
    <>
      {content.slice(0, idx)}
      <span className="bg-yellow-100 text-red-500 font-semibold">
        {highlight}
      </span>
      {content.slice(idx + highlight.length)}
    </>
  );
}

function parseTrust(value) {
  if (typeof value === "number") return value;
  if (!value) return 0;
  const num = parseFloat(String(value).replace("%", ""));
  return Number.isNaN(num) ? 0 : num;
}

export default function Result({
  analysisResult,
  urlInput,
  onNewAnalyze,
  onOpenInfoModal,
}) {
  if (!analysisResult) return null;

  const { score = 0, overallSummary, reviews = [] } = analysisResult;
  const { color, bg, border, label } = getScoreInfo(score);

  const highReviews = [...reviews]
    .sort((a, b) => parseTrust(b.trust) - parseTrust(a.trust))
    .slice(0, 10);

  const lowReviews = [...reviews]
    .sort((a, b) => parseTrust(a.trust) - parseTrust(b.trust))
    .slice(0, 10);

  return (
    <div className="min-h-screen bg-slate-50 flex justify-center px-4 py-8">
      <div className="w-full max-w-6xl pt-8 md:pt-10 lg:pt-12">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100">
          {/* 헤더 */}
          <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 bg-slate-50/60">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-slate-800">
                분석 결과 리포트
              </h2>
              <button
                onClick={onOpenInfoModal}
                className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600"
              >
                <Info size={16} />
                <span>신뢰도 기준</span>
              </button>
            </div>

            <button
              onClick={onNewAnalyze}
              className="text-sm px-4 py-2 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
            >
              새로운 분석하기
            </button>
          </div>

          {/* URL */}
          <div className="px-8 py-2 bg-slate-50/50 border-b border-slate-100 text-slate-500 text-sm truncate">
            {urlInput}
          </div>

          <div className="p-8">
            {/* ⭐ 종합 리뷰 지표 중앙 배치 (디자인 개선 버전) */}
            <div className="flex justify-center mb-12">
              <div
                className={`w-72 h-72 rounded-full border-[14px] flex flex-col items-center justify-center ${border} ${bg} shadow-[0_0_25px_rgba(249,115,22,0.25)]`}
              >
                <span className="text-sm text-slate-500 mb-1 tracking-wide">
                  종합 리뷰 지표
                </span>

                <div className="flex items-baseline">
                  <span
                    className={`mr-2 text-7xl font-extrabold ${color}`}
                  >
                    {score}
                  </span>
                  <span className="text-2xl text-slate-500">/100</span>
                </div>

                <span className={`mt-3 text-xl font-semibold ${color}`}>
                  {label}
                </span>
              </div>
            </div>

            {/* ⭐ 리뷰 테이블 2단 레이아웃 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* 높은 평점 */}
              <div>
                <h3 className="font-bold text-lg text-slate-700 mb-4 border-b border-slate-200 pb-2">
                  높은 평점 TOP 10
                </h3>
                <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                  <div className="grid grid-cols-12 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500">
                    <div className="col-span-7">리뷰 내용</div>
                    <div className="col-span-2 text-center">평점</div>
                    <div className="col-span-3 text-center">분석 근거</div>
                  </div>

                  <div className="max-h-72 overflow-y-auto">
                    {highReviews.map((review) => (
                      <div
                        key={review.id || review.content}
                        className="grid grid-cols-12 px-4 py-3 text-sm border-t border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        <div className="col-span-7 pr-3 leading-relaxed text-slate-700">
                          <HighlightedReview
                            content={review.content}
                            highlight={review.highlight}
                          />
                        </div>
                        <div className="col-span-2 flex items-center justify-center font-semibold text-slate-800">
                          {review.rating}
                        </div>
                        <div className="col-span-3 flex items-center justify-center text-xs text-slate-500 text-center px-2">
                          {review.reason}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 낮은 평점 */}
              <div>
                <h3 className="font-bold text-lg text-slate-700 mb-4 border-b border-slate-200 pb-2">
                  낮은 평점 TOP 10
                </h3>
                <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                  <div className="grid grid-cols-12 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500">
                    <div className="col-span-7">리뷰 내용</div>
                    <div className="col-span-2 text-center">평점</div>
                    <div className="col-span-3 text-center">분석 근거</div>
                  </div>

                  <div className="max-h-72 overflow-y-auto">
                    {lowReviews.map((review) => (
                      <div
                        key={review.id || review.content}
                        className="grid grid-cols-12 px-4 py-3 text-sm border-t border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        <div className="col-span-7 pr-3 leading-relaxed text-slate-700">
                          <HighlightedReview
                            content={review.content}
                            highlight={review.highlight}
                          />
                        </div>
                        <div className="col-span-2 flex items-center justify-center font-semibold text-slate-800">
                          {review.rating}
                        </div>
                        <div className="col-span-3 flex items-center justify-center text-xs text-slate-500 text-center px-2">
                          {review.reason}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 전체 리뷰 요약 */}
            <div className="mt-12 border-t border-slate-100 pt-6">
              <div className="flex items-center gap-2 text-slate-700 mb-3">
                <ReviewCheckIcon className="w-6 h-6 text-blue-600" />
                <span className="text-base font-semibold">전체 리뷰 요약</span>
              </div>

              <p className="text-base leading-relaxed text-slate-700 bg-slate-50 rounded-2xl px-4 py-4 border border-slate-100">
                {overallSummary}
              </p>
            </div>

            {/* 도움 여부 */}
            <div className="mt-8 border-t border-slate-100 pt-6">
              <p className="text-base text-slate-600 mb-3">
                이 분석 결과가 도움이 되었나요?
              </p>

              <div className="flex flex-wrap gap-3">
                <button className="flex items-center gap-2 px-6 py-3 text-base rounded-full border border-slate-200 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all shadow-sm">
                  <ThumbsUp size={20} />
                  <span>네, 도움됨</span>
                </button>

                <button className="flex items-center gap-2 px-6 py-3 text-base rounded-full border border-slate-200 text-slate-500 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm">
                  <ThumbsDown size={20} />
                  <span>아니요</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
