// src/pages/Home.jsx
import React from 'react';
import { Search } from 'lucide-react';
import ReviewCheckIcon from '../components/icons/ReviewCheckIcon';

export default function Home({
  urlInput,
  setUrlInput,
  isAnalyzing,
  onAnalyze,
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 pt-16 bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="w-full max-w-3xl flex flex-col items-center animate-fade-in-up">
        <div className="flex flex-col items-center mb-8">
          <ReviewCheckIcon className="w-20 h-20 text-blue-600 mb-4 drop-shadow-md" />
          <h1 className="text-5xl font-extrabold text-slate-800 tracking-tight mb-2">
            Review Check
          </h1>
          <p className="text-slate-500 text-lg font-medium">
            패션 쇼핑 플랫폼 리뷰 신뢰도 분석 시스템
          </p>
        </div>

        <div className="w-full bg-white p-2 rounded-2xl shadow-xl border border-blue-100 relative overflow-hidden group hover:shadow-2xl transition-shadow duration-300">
          <div className="relative flex items-center p-2">
            <div className="absolute left-6 text-slate-400 group-focus-within:text-blue-500 transition-colors">
              <Search size={24} />
            </div>
            <input
              type="text"
              className="w-full pl-14 pr-36 py-5 bg-transparent rounded-xl focus:outline-none text-lg text-slate-700 placeholder-slate-400"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onAnalyze()}
            />
            <div
              className={`absolute left-16 transition-all duration-300 pointer-events-none ${
                urlInput ? '-top-2 opacity-0' : 'top-5 text-slate-400'
              }`}
            >
              <span className="text-sm md:text-base">
                분석하고 싶은 쇼핑몰 상품 페이지 URL을 입력하세요
              </span>
            </div>

            <button
              onClick={onAnalyze}
              disabled={isAnalyzing}
              className="absolute right-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-bold shadow-md transition-all transform hover:scale-105 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? '분석중...' : '분석하기'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
