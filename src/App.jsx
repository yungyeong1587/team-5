// src/App.jsx
import React, { useState, useEffect } from 'react';

import Navbar from './components/layout/Navbar';
import ToastNotification from './components/feedback/ToastNotification';
import InfoModal from './components/feedback/InfoModal';

import Home from './pages/Home';
import Result from './pages/Result';
import Notice from './pages/Notice';
import Inquiry from './pages/Inquiry';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home'); // home, result, notice, inquiry, adminLogin, adminDashboard
  const [isAdmin, setIsAdmin] = useState(false);

  const [urlInput, setUrlInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [analysisResult, setAnalysisResult] = useState(null);

  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'info',
  });

  // 공통 Toast 함수
  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
  };

  useEffect(() => {
    if (!toast.show) return;
    const timer = setTimeout(
      () => setToast((prev) => ({ ...prev, show: false })),
      3000,
    );
    return () => clearTimeout(timer);
  }, [toast.show]);

  const navigateTo = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  // 분석 버튼
  // App.jsx (일부) ---------------------------------
const handleAnalyze = () => {
  if (!urlInput.trim()) {
    showToast("URL을 입력해주세요.", "error");
    return;
  }

  setIsAnalyzing(true);
  showToast("분석을 시작합니다...", "info");

  setTimeout(() => {
    const mockScore = Math.floor(Math.random() * 100);

    setAnalysisResult({
      score: mockScore,
      // 전체 리뷰 요약
      overallSummary:
        "대부분의 리뷰가 긍정적이며, 재질과 핏에 대한 만족도가 높습니다. 다만 배송 지연과 포장 상태에 대한 불만이 일부 존재합니다.",
      // 리뷰 10개 정도 (원하면 더 줄여도 됨)
      reviews: [
        {
          id: 1,
          content:
            "재질이 정말 좋아요! 색감도 화면이랑 거의 똑같고 핏도 딱 예쁩니다. 다만 배송이 조금 느렸어요.",
          trust: "92%",
          reason: "자연스러운 문장 구조 + 구체적인 장단점 언급",
          highlight: {
            positive: ["정말 좋아요", "색감도 화면이랑 거의 똑같고", "핏도 딱 예쁩니다"],
            negative: ["배송이 조금 느렸어요"],
          },
        },
        {
          id: 2,
          content:
            "완전 강추! 이건 무조건 사야 합니다!! 친구들이 다 예쁘다고 해요. 다만 포장이 생각보다 좀 허술했어요.",
          trust: "88%",
          reason: "과장 표현이 있으나 실제 사용 후기가 함께 존재",
          highlight: {
            positive: ["완전 강추", "무조건 사야 합니다", "친구들이 다 예쁘다고 해요"],
            negative: ["포장이 생각보다 좀 허술했어요"],
          },
        },
        {
          id: 3,
          content:
            "기대보단 평범했어요. 입을 만하지만 아주 만족스럽진 않아요. 가격을 생각하면 괜찮은 편입니다.",
          trust: "76%",
          reason: "평가가 과도하게 긍·부정 한쪽으로 치우치지 않음",
          highlight: {
            positive: ["가격을 생각하면 괜찮은 편입니다"],
            negative: ["기대보단 평범했어요", "아주 만족스럽진 않아요"],
          },
        },
        {
          id: 4,
          content:
            "퀄리티 최고예요. 바느질도 깔끔하고 원단도 탄탄해서 오래 입을 수 있을 것 같아요.",
          trust: "95%",
          reason: "구체적인 제품 디테일 언급 + 과장 표현 적음",
          highlight: {
            positive: ["퀄리티 최고예요", "바느질도 깔끔하고", "원단도 탄탄해서 오래 입을 수 있을 것 같아요"],
            negative: [],
          },
        },
        {
          id: 5,
          content:
            "사이즈가 살짝 애매했어요. 어깨는 맞는데 소매가 길어서 수선해서 입었습니다.",
          trust: "84%",
          reason: "구체적인 사이즈 정보 + 해결 과정 언급",
          highlight: {
            positive: ["수선해서 입었습니다"],
            negative: ["사이즈가 살짝 애매했어요", "소매가 길어서"],
          },
        },
        {
          id: 6,
          content:
            "생각보다 얇아서 한겨울에는 못 입을 것 같아요. 봄 가을에 입기 딱 좋습니다.",
          trust: "81%",
          reason: "계절·두께에 대한 구체적인 정보 제공",
          highlight: {
            positive: ["봄 가을에 입기 딱 좋습니다"],
            negative: ["생각보다 얇아서", "한겨울에는 못 입을 것 같아요"],
          },
        },
        {
          id: 7,
          content:
            "포장이 정말 꼼꼼했고 배송도 빨랐어요. 선물용으로 샀는데 받는 사람이 아주 만족했습니다.",
          trust: "93%",
          reason: "배송·포장·선물 반응까지 구체적으로 언급",
          highlight: {
            positive: ["포장이 정말 꼼꼼했고", "배송도 빨랐어요", "아주 만족했습니다"],
            negative: [],
          },
        },
        {
          id: 8,
          content:
            "사진이랑 색이 조금 달라요. 화면에서는 더 밝게 보였는데 실제로는 톤이 살짝 다운된 느낌이에요.",
          trust: "79%",
          reason: "사진 대비 차이 구체 설명, 과한 감정 표현 없음",
          highlight: {
            positive: [],
            negative: ["색이 조금 달라요", "톤이 살짝 다운된 느낌이에요"],
          },
        },
        {
          id: 9,
          content:
            "가격 대비 만족도 최고입니다. 자주 손이 가는 옷이에요. 세탁해도 구김이 거의 없어서 관리하기 편합니다.",
          trust: "96%",
          reason: "가격·사용 빈도·세탁 후 상태 등 구체적 장점 다수",
          highlight: {
            positive: [
              "가격 대비 만족도 최고입니다",
              "자주 손이 가는 옷이에요",
              "구김이 거의 없어서 관리하기 편합니다",
            ],
            negative: [],
          },
        },
        {
          id: 10,
          content:
            "냄새가 조금 나서 처음엔 하루 정도 걸어두고 입었어요. 그 이후로는 괜찮습니다.",
          trust: "82%",
          reason: "초기 불편사항 + 이후 개선 상황을 함께 언급",
          highlight: {
            positive: ["그 이후로는 괜찮습니다"],
            negative: ["냄새가 조금 나서", "하루 정도 걸어두고"],
          },
        },
      ],
    });

    setIsAnalyzing(false);
    showToast("분석이 완료되었습니다!", "success");
    navigateTo("result");
  }, 1500);
};


  const handleAdminLogin = (e) => {
    e.preventDefault();
    setIsAdmin(true);
    navigateTo('adminDashboard');
    showToast('관리자 모드로 접속했습니다.', 'success');
  };

  const handleLogout = () => {
    setIsAdmin(false);
    navigateTo('home');
    showToast('로그아웃 되었습니다.', 'info');
  };

  const handleDownload = () => {
    if (!dateRange.start || !dateRange.end) {
      showToast('날짜 범위를 먼저 설정해주세요.', 'error');
      return;
    }
    showToast(
      `[${dateRange.start} ~ ${dateRange.end}] 기간의 리뷰 분석 데이터를 다운로드합니다.`,
      'success',
    );
  };

  const handleInquirySubmit = (e) => {
    e.preventDefault();
    showToast('문의가 성공적으로 접수되었습니다.', 'success');
    navigateTo('home');
  };

  const handleLogoClick = () => {
    setUrlInput('');
    navigateTo('home');
  };

  return (
    <div className="min-h-screen font-sans bg-slate-50 text-slate-800">
      {currentPage !== 'adminDashboard' && (
        <Navbar
          isAdmin={isAdmin}
          onNavigate={navigateTo}
          onLogout={handleLogout}
          onLogoClick={handleLogoClick}
        />
      )}

      {currentPage === 'home' && (
        <Home
          urlInput={urlInput}
          setUrlInput={setUrlInput}
          isAnalyzing={isAnalyzing}
          onAnalyze={handleAnalyze}
        />
      )}

      {currentPage === 'result' && (
        <Result
          analysisResult={analysisResult}
          urlInput={urlInput}
          onNewAnalyze={() => navigateTo('home')}
          onOpenInfoModal={() => setShowInfoModal(true)}
        />
      )}

      {currentPage === 'notice' && (
        <Notice onBack={() => navigateTo('home')} />
      )}

      {currentPage === 'inquiry' && (
        <Inquiry
          onBack={() => navigateTo('home')}
          onSubmit={handleInquirySubmit}
        />
      )}

      {currentPage === 'adminLogin' && (
        <AdminLogin
          onSubmit={handleAdminLogin}
          onBack={() => navigateTo('home')}
        />
      )}

      {currentPage === 'adminDashboard' && (
        <AdminDashboard
          dateRange={dateRange}
          setDateRange={setDateRange}
          onDownload={handleDownload}
        />
      )}

      <InfoModal open={showInfoModal} onClose={() => setShowInfoModal(false)} />
      <ToastNotification
        toast={toast}
        onClose={() => setToast((prev) => ({ ...prev, show: false }))}
      />

      {/* 애니메이션 Keyframe은 그냥 여기 두고 써도 되고, index.css로 옮겨도 됨 */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fadeInUp 0.8s ease-out forwards; }
        .animate-fade-in { animation: fadeInUp 0.5s ease-out forwards; }
        .animate-scale-in { animation: scaleIn 0.3s ease-out forwards; }
        .animate-toast-in { animation: toastIn 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
}
