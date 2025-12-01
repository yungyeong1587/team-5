// src/pages/Notice.jsx
import React from 'react';
import { ArrowLeft, ChevronRight } from 'lucide-react';

export default function Notice({ onBack }) {
  const notices = [
    { id: 1, title: '서비스 점검 안내 (12/25)', date: '2023.12.20' },
    { id: 2, title: '신규 분석 알고리즘 업데이트', date: '2023.12.15' },
    { id: 3, title: '개인정보 처리방침 변경 안내', date: '2023.12.01' },
    { id: 4, title: '리뷰 체크 서비스 오픈 이벤트', date: '2023.11.20' },
  ];

  return (
    <div className="flex flex-col items-center min-h-screen px-4 pt-24 bg-slate-50">
      <div className="w-full max-w-3xl animate-fade-in">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white rounded-full transition-colors"
          >
            <ArrowLeft className="text-slate-600" />
          </button>
          <h2 className="text-3xl font-extrabold text-slate-800">공지사항</h2>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {notices.map((notice) => (
            <div
              key={notice.id}
              className="p-6 border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer group"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-slate-800 text-lg mb-1 group-hover:text-blue-600 transition-colors">
                    {notice.title}
                  </h3>
                  <p className="text-slate-500 text-sm">{notice.date}</p>
                </div>
                <ChevronRight className="text-slate-300 group-hover:text-blue-500" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
