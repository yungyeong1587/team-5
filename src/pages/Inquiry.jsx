// src/pages/Inquiry.jsx
import React from 'react';
import { ArrowLeft, Send } from 'lucide-react';

export default function Inquiry({ onBack, onSubmit }) {
  return (
    <div className="flex flex-col items-center min-h-screen px-4 pt-24 bg-slate-50">
      <div className="w-full max-w-2xl animate-fade-in">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white rounded-full transition-colors"
          >
            <ArrowLeft className="text-slate-600" />
          </button>
          <h2 className="text-3xl font-extrabold text-slate-800">문의하기</h2>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
          <p className="text-slate-500 mb-6">
            서비스 이용 중 불편한 점이나 궁금한 점을 남겨주세요.
            <br />
            담당자가 확인 후 빠르게 답변 드리겠습니다.
          </p>

          <form className="space-y-6" onSubmit={onSubmit}>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                이메일 주소
              </label>
              <input
                type="email"
                placeholder="답변 받을 이메일을 입력하세요"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                문의 유형
              </label>
              <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors">
                <option>분석 결과 문의</option>
                <option>서비스 오류 신고</option>
                <option>제휴 및 기타 문의</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                제목
              </label>
              <input
                type="text"
                placeholder="문의 제목을 입력하세요"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                내용
              </label>
              <textarea
                placeholder="문의 내용을 상세히 적어주세요"
                rows={5}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors resize-none"
                required
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Send size={18} /> 문의 접수하기
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
