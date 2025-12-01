// src/pages/Result.jsx
import React from "react";
import { Info, ThumbsUp, ThumbsDown, BadgeCheck } from "lucide-react";
import ReviewCheckIcon from "../components/icons/ReviewCheckIcon";

function getScoreInfo(score) {
  if (score >= 76)
    return {
      color: "text-green-600",
      bg: "bg-green-100",
      border: "border-green-500",
      label: "매우 도움됨",
    };
  if (score >= 36)
    return {
      color: "text-orange-500",
      bg: "bg-orange-100",
      border: "border-orange-400",
      label: "일부 도움됨",
    };
  return {
    color: "text-red-500",
    bg: "bg-red-100",
    border: "border-red-500",
    label: "도움 안 됨",
  };
}

/**
 * 문장 안에서 positive / negative 구간을
 * 파란/빨간 형광펜 느낌으로 하이라이트
 */
function HighlightedReview({ content, highlight }) {
  if (!highlight) return <span>{content}</span>;

  const { positive = [], negative = [] } = highlight;

  let result = content;

  // 부정 → 긍정 순서로 마킹
  negative.forEach((phrase) => {
    if (!phrase) return;
    result = result.replaceAll(
      phrase,
      `[[NEG_START]]${phrase}[[NEG_END]]`
    );
  });

  positive.forEach((phrase) => {
    if (!phrase) return;
    result = result.replaceAll(
      phrase,
      `[[POS_START]]${phrase}[[POS_END]]`
    );
  });

  const parts = result
    .split(
      /(\[\[POS_START\]\]|\[\[POS_END\]\]|\[\[NEG_START\]\]|\[\[NEG_END\]\])/
    )
    .filter(Boolean);

  let mode = "normal";
  const tokens = [];

  parts.forEach((part, idx) => {
    if (part === "[[POS_START]]") {
      mode = "pos";
      return;
    }
    if (part === "[[POS_END]]") {
      mode = "normal";
      return;
    }
    if (part === "[[NEG_START]]") {
      mode = "neg";
      return;
    }
    if (part === "[[NEG_END]]") {
      mode = "normal";
      return;
    }

    if (mode === "pos") {
      // 파란 형광펜
      tokens.push(
        <span
          key={idx}
          className="bg-blue-100 text-blue-700 font-semibold rounded-sm px-0.5"
        >
          {part}
        </span>
      );
    } else if (mode === "neg") {
      // 빨간 형광펜
      tokens.push(
        <span
          key={idx}
          className="bg-red-100 text-red-600 font-semibold rounded-sm px-0.5"
        >
          {part}
        </span>
      );
    } else {
      tokens.push(<span key={idx}>{part}</span>);
    }
  });

  return <>{tokens}</>;
}

export default function Result({
  analysisResult,
  urlInput,
  onNewAnalyze,
  onOpenInfoModal,
}) {
  if (!analysisResult) return null;

  const { score, overallSummary, reviews = [] } = analysisResult;
  const { color, bg, border, label } = {
    ...analysisResult,
    ...getScoreInfo(score),
  };

  return (
    <div className="flex flex-col items-center min-h-screen px-4 pt-28 pb-12 bg-slate-50">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-fade-in">
        {/* 헤더 */}
        <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-800">
              분석 결과 리포트
            </h2>
            <button
              onClick={onOpenInfoModal}
              className="text-slate-400 hover:text-blue-600 transition-colors"
              title="신뢰도 점수 기준 보기"
            >
              <Info size={18} />
            </button>
          </div>
          <button
            onClick={onNewAnalyze}
            className="text-blue-600 text-sm font-semibold hover:underline"
          >
            새로운 분석하기
          </button>
        </div>

        {/* URL 표시 */}
        <div className="px-8 py-2 bg-slate-50/50 border-b border-slate-100 text-slate-500 text-sm truncate">
          {urlInput}
        </div>

        <div className="p-8">
          {/* 상단 그리드 (점수 + 리뷰 테이블) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* 왼쪽: 점수 영역 */}
            <div className="lg:col-span-1 flex flex-col items-center justify-center space-y-6">
              <div
                className={`w-48 h-48 rounded-full flex items-center justify-center border-8 ${border} ${bg} transition-all duration-500`}
              >
                <div className="text-center">
                  <span className={`text-5xl font-extrabold ${color}`}>
                    {score}
                  </span>
                  <span className="text-slate-400 text-lg">/100</span>
                </div>
              </div>

              <div
                className={`px-4 py-2 rounded-full font-bold text-lg ${bg} ${color}`}
              >
                {label}
              </div>
            </div>

            {/* 오른쪽: 리뷰 상세 분석 테이블 */}
            <div className="lg:col-span-2">
              <h3 className="font-bold text-slate-700 mb-4">
                리뷰 상세 분석 (샘플 10개)
              </h3>

              <div className="border border-slate-100 rounded-2xl overflow-hidden">
                {/* 테이블 헤더 */}
                <div className="grid grid-cols-12 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500">
                  <div className="col-span-7">리뷰 내용</div>
                  <div className="col-span-2 text-center">신뢰도</div>
                  <div className="col-span-3 text-center">분석 근거</div>
                </div>

                {/* 스크롤 되는 바디 (5개 정도 보이고, 더 있으면 스크롤) */}
                <div className="max-h-80 overflow-y-auto">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="grid grid-cols-12 px-4 py-3 text-sm border-t border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <div className="col-span-7 pr-3 leading-relaxed text-slate-700">
                        <HighlightedReview
                          content={review.content}
                          highlight={review.highlight}
                        />
                      </div>
                      <div className="col-span-2 flex items-center justify-center font-semibold text-slate-800">
                        {review.trust}
                      </div>
                      <div className="col-span-3 flex items-center justify-center text-xs text-slate-500 text-center px-2">
                        {review.reason}
                      </div>
                    </div>
                  ))}

                  {reviews.length === 0 && (
                    <div className="px-4 py-6 text-center text-slate-400 text-sm">
                      표시할 리뷰가 없습니다.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 전체 리뷰 요약 – 점수 밑(왼쪽 아래)에 오는 느낌으로, 카드 한 줄 */}
          {overallSummary && (
  <div className="mt-8 flex items-start gap-3 bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4">
    <div className="mt-0.5">
  <ReviewCheckIcon className="w-5 h-5 text-blue-500" />
</div>
    <div className="text-sm leading-relaxed text-slate-700">
      <div className="font-semibold text-slate-800 mb-1">
        전체 리뷰 요약
      </div>
      <div>{overallSummary}</div>
    </div>
  </div>
)}

          {/* 도움 됐나요? 영역 */}
          <div className="mt-10 border-t border-slate-100 pt-6">
            <p className="text-center text-slate-500 text-sm mb-4">
              이 분석 결과가 도움이 되셨나요?
            </p>
            <div className="flex justify-center gap-4">
              <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl text-slate-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all shadow-sm">
                <ThumbsUp size={18} />
                <span>네, 도움됨</span>
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl text-slate-600 hover:border-red-500 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm">
                <ThumbsDown size={18} />
                <span>아니요</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
