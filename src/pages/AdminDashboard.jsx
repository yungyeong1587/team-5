// src/pages/AdminDashboard.jsx
import React, { useState } from 'react';
import {
  MessageSquare,
  FileText,
  Database,
  Cpu,
  Calendar,
  Download,
} from 'lucide-react';

export default function AdminDashboard({ dateRange, setDateRange, onDownload, onGoToHome }) {
  const [activeTab, setActiveTab] = useState('data');

  const tabs = [
    { id: 'inquiry', label: '사용자 문의 관리', icon: <MessageSquare size={18} /> },
    { id: 'notice', label: '공지사항 관리', icon: <FileText size={18} /> },
    { id: 'data', label: '데이터 관리', icon: <Database size={18} /> },
    { id: 'aimodel', label: 'AI 모델 재학습', icon: <Cpu size={18} /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'inquiry':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-800 mb-4">
              최근 들어온 문의
            </h3>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex justify-between items-center"
              >
                <div>
                  <div className="font-bold text-slate-700">
                    분석 결과가 이상해요 #{100 + i}
                  </div>
                  <div className="text-sm text-slate-500">
                    2023-10-2{i} · user{i}@example.com
                  </div>
                </div>
                <button className="px-4 py-2 bg-slate-100 text-slate-600 text-sm rounded-lg hover:bg-blue-50 hover:text-blue-600">
                  답변하기
                </button>
              </div>
            ))}
          </div>
        );
      case 'notice':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-800">
                등록된 공지사항
              </h3>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700">
                + 글쓰기
              </button>
            </div>
            <div className="bg-white rounded-xl border border-slate-100 p-6 text-center text-slate-500">
              등록된 공지사항이 없습니다.
            </div>
          </div>
        );
      case 'data':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-800 mb-4">
              데이터 추출 및 관리
            </h3>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="text-blue-600" size={20} />
                <span className="font-bold text-slate-700">날짜 구간 설정</span>
              </div>
              <div className="flex flex-col md:flex-row gap-4 items-end md:items-center">
                <div className="flex-1 w-full">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    시작일
                  </label>
                  <input
                    type="date"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:border-blue-500 outline-none"
                    value={dateRange.start}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, start: e.target.value })
                    }
                  />
                </div>
                <span className="text-slate-400 hidden md:block">~</span>
                <div className="flex-1 w-full">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    종료일
                  </label>
                  <input
                    type="date"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:border-blue-500 outline-none"
                    value={dateRange.end}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, end: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:border-blue-200 transition-colors">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-700 text-lg mb-1">
                    리뷰 분석 데이터 로그
                  </div>
                  <p className="text-sm text-slate-500">
                    선택한 기간 내의 URL별 신뢰도 분석 결과 기록 (.csv)
                  </p>
                </div>
                <button
                  onClick={onDownload}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-md transition-all transform active:scale-95"
                >
                  <Download size={18} /> 데이터 다운로드
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                <div className="text-blue-600 text-sm font-semibold mb-1">
                  총 누적 분석
                </div>
                <div className="text-3xl font-extrabold text-blue-800">
                  12,450 건
                </div>
              </div>
              <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
                <div className="text-indigo-600 text-sm font-semibold mb-1">
                  오늘 분석 요청
                </div>
                <div className="text-3xl font-extrabold text-indigo-800">
                  142 건
                </div>
              </div>
            </div>
          </div>
        );
      case 'aimodel':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-800">AI 모델 관리</h3>
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <div className="font-bold text-slate-800 text-lg">
                    Model V2.4
                  </div>
                  <div className="text-green-500 text-sm font-medium">
                    ● 가동 중 (정확도 94.2%)
                  </div>
                </div>
                <button className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 shadow-md">
                  재학습 시작
                </button>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 mb-2">
                <div
                  className="bg-indigo-600 h-2.5 rounded-full"
                  style={{ width: '100%' }}
                ></div>
              </div>
              <div className="text-xs text-slate-400 text-right">
                마지막 업데이트: 2023.10.20
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 pt-16">
      <aside className="w-64 bg-white border-r border-slate-200 fixed h-full hidden md:block">
        <div className="p-6">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
            Dashboard
          </h2>
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-600 font-bold shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </aside>

     <main className="flex-1 md:ml-64 p-8">
  <header className="mb-8 flex justify-between items-center">
    <h1 className="text-2xl font-extrabold text-slate-800">
      관리자 대시보드
    </h1>
    <div className="flex items-center gap-3 text-sm">
      <button
        onClick={onGoToHome}
        className="px-3 py-1.5 rounded-lg border border-slate-200 
                   bg-white text-slate-600 hover:bg-blue-50 
                   hover:border-blue-400 hover:text-blue-600 
                   transition-colors"
      >
        사용자 화면으로 보기
      </button>
      <span className="text-slate-500">
        Admin 님, 환영합니다.
      </span>
    </div>
  </header>

  <div className="animate-fade-in">
    {renderContent()}
  </div>
</main>
    </div>
  );
}
