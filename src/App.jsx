import React, { useState, useEffect } from 'react';
import { 
  Search, 
  User, 
  LogOut, 
  Info, 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  FileText, 
  Database, 
  Cpu, 
  Download,
  Calendar,
  ChevronRight,
  Send,
  ArrowLeft,
  X 
} from 'lucide-react';

/**
 * Review Check 시스템
 * - 메인: URL 입력 및 분석
 * - 결과: 신뢰도 점수 및 피드백 (i 아이콘 위치 변경)
 * - 공지사항: 사용자 조회 화면 추가
 * - 문의: 사용자 입력 폼 추가
 * - 관리자: 대시보드 (데이터 다운로드 기능 축소)
 * * 업데이트: alert() 사용을 제거하고 Toast Notification으로 대체함.
 */

export default function App() {
  // --- 상태 관리 (State) ---
  const [currentPage, setCurrentPage] = useState('home'); 
  // page types: 'home', 'result', 'notice', 'inquiry', 'adminLogin', 'adminDashboard'
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  
  // 데이터 관리 날짜 상태
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // 분석 결과 상태 (Mock Data)
  const [analysisResult, setAnalysisResult] = useState(null);

  // [신규] 토스트 메시지 상태
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' }); // type: 'info', 'success', 'error'

  // --- 커스텀 아이콘 (Review Check Logo) ---
  const ReviewCheckIcon = ({ className }) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      <path d="m9 11 3 3L22 4" />
    </svg>
  );

  // --- 기능 함수 (Functions) ---

  // [신규] 토스트 메시지 표시 함수
  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
  };

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ ...toast, show: false });
      }, 3000); // 3초 후 자동 숨김
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const navigateTo = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleAnalyze = () => {
    if (!urlInput.trim()) {
      showToast("URL을 입력해주세요.", 'error');
      return;
    }
    
    setIsAnalyzing(true);
    showToast("분석을 시작합니다...", 'info');
    
    setTimeout(() => {
      const mockScore = Math.floor(Math.random() * 100); 
      setAnalysisResult({
        score: mockScore,
        productName: "베이직 오버핏 코튼 셔츠",
        summary: "대부분의 리뷰가 긍정적이나, 배송 관련 불만이 일부 감지되었습니다. 패턴 분석 결과 조작된 리뷰 비율은 낮습니다.",
        details: [
          { label: "실구매자 비율", value: "92%" },
          { label: "리뷰 긍정률", value: "85%" },
          { label: "언어 패턴 일치도", value: "High" },
        ]
      });
      setIsAnalyzing(false);
      showToast("분석이 완료되었습니다!", 'success');
      navigateTo('result');
    }, 1500);
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    setIsAdmin(true);
    navigateTo('adminDashboard');
  };

  const handleLogout = () => {
    setIsAdmin(false);
    navigateTo('home');
    showToast("로그아웃 되었습니다.", 'info');
  };

  const handleDownload = () => {
    if (!dateRange.start || !dateRange.end) {
      showToast("날짜 범위를 먼저 설정해주세요.", 'error');
      return;
    }
    showToast(`[${dateRange.start} ~ ${dateRange.end}] 기간의 리뷰 분석 데이터를 다운로드합니다.`, 'success');
    // 실제 다운로드 로직 추가 필요 (CSV 생성 등)
  };

  const handleInquirySubmit = (e) => { 
    e.preventDefault(); 
    showToast('문의가 성공적으로 접수되었습니다.', 'success'); 
    navigateTo('home'); 
  };

  const getScoreInfo = (score) => {
    if (score >= 76) return { color: "text-green-600", bg: "bg-green-100", border: "border-green-500", label: "매우 도움됨" };
    if (score >= 36) return { color: "text-orange-500", bg: "bg-orange-100", border: "border-orange-400", label: "일부 도움됨" };
    return { color: "text-red-500", bg: "bg-red-100", border: "border-red-500", label: "도움 안 됨" };
  };

  // --- 컴포넌트 (Components) ---

  // 0. [신규] Toast Notification 컴포넌트
  const ToastNotification = () => {
    if (!toast.show) return null;

    let classes = "";
    let Icon = Info;
    let iconColor = "";

    switch (toast.type) {
      case 'success':
        classes = "bg-green-600 border-green-700";
        Icon = ThumbsUp;
        iconColor = "text-green-100";
        break;
      case 'error':
        classes = "bg-red-600 border-red-700";
        Icon = X;
        iconColor = "text-red-100";
        break;
      case 'info':
      default:
        classes = "bg-blue-600 border-blue-700";
        Icon = Info;
        iconColor = "text-blue-100";
        break;
    }

    return (
      <div 
        className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[200] p-4 rounded-xl shadow-2xl transition-all duration-300 ${classes} flex items-center gap-3`}
        style={{ animation: 'toastIn 0.3s ease-out forwards' }}
      >
        <Icon size={20} className={iconColor} />
        <span className="text-white font-medium text-sm">{toast.message}</span>
        <button onClick={() => setToast({...toast, show: false})} className="text-white/70 hover:text-white ml-2">
          <X size={16} />
        </button>
      </div>
    );
  };

  // 1. 상단 네비게이션 바
  const Navbar = () => (
    <nav className="w-full fixed top-0 left-0 z-50 bg-white/80 backdrop-blur-md border-b border-blue-100 h-16 flex items-center justify-between px-6 lg:px-12 shadow-sm transition-all">
      <div 
        className="flex items-center gap-2 cursor-pointer group" 
        onClick={() => {
          setUrlInput('');
          navigateTo('home');
        }}
      >
        <ReviewCheckIcon className="w-6 h-6 text-blue-600 group-hover:text-blue-700 transition-colors" />
        <span className="text-lg font-extrabold text-slate-800 tracking-tight group-hover:text-blue-900 transition-colors">
          Review Check
        </span>
      </div>
      
      <div className="flex items-center gap-6 font-medium text-slate-600 text-sm">
        <button onClick={() => navigateTo('notice')} className="hover:text-blue-600 transition-colors">공지사항</button>
        <button onClick={() => navigateTo('inquiry')} className="hover:text-blue-600 transition-colors">문의</button>
        {isAdmin ? (
          <button onClick={handleLogout} className="flex items-center gap-1 text-red-500 hover:text-red-700 font-bold">
            <LogOut size={16} /> 로그아웃
          </button>
        ) : (
          <button onClick={() => navigateTo('adminLogin')} className="flex items-center gap-1 hover:text-blue-600 transition-colors">
            <User size={16} /> 관리자
          </button>
        )}
      </div>
    </nav>
  );

  // 2. 홈 화면
  const HomeScreen = () => (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 pt-16 bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="w-full max-w-3xl flex flex-col items-center animate-fade-in-up">
        
        <div className="flex flex-col items-center mb-8">
          <ReviewCheckIcon className="w-20 h-20 text-blue-600 mb-4 drop-shadow-md" />
          <h1 className="text-5xl font-extrabold text-slate-800 tracking-tight mb-2">Review Check</h1>
          <p className="text-slate-500 text-lg font-medium">쇼핑몰 리뷰 신뢰도 분석 시스템</p>
        </div>

        <div className="w-full bg-white p-2 rounded-2xl shadow-xl border border-blue-100 relative overflow-hidden group hover:shadow-2xl transition-shadow duration-300">
          <div className="relative flex items-center p-2">
            <div className="absolute left-6 text-slate-400 group-focus-within:text-blue-500 transition-colors">
              <Search size={24} />
            </div>
            <input
              type="text"
              placeholder=""
              className="w-full pl-14 pr-36 py-5 bg-transparent rounded-xl focus:outline-none text-lg text-slate-700 placeholder-slate-400"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
            />
            <div className={`absolute left-16 transition-all duration-300 pointer-events-none ${urlInput ? '-top-2 opacity-0' : 'top-5 text-slate-400'}`}>
              <span className="text-sm md:text-base">분석하고 싶은 쇼핑몰 상품 페이지 URL을 입력하세요</span>
            </div>

            <button 
              onClick={handleAnalyze}
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

  // 3. 분석 결과 화면 (수정됨: i 아이콘 이동)
  const ResultScreen = () => {
    if (!analysisResult) return null;
    const { score, color, bg, border, label } = { ...analysisResult, ...getScoreInfo(analysisResult.score) };

    return (
      <div className="flex flex-col items-center min-h-screen px-4 pt-28 pb-12 bg-slate-50">
        <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-fade-in">
          
          <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-800">분석 결과 리포트</h2>
              {/* i 아이콘을 타이틀 옆으로 이동 */}
              <button 
                onClick={() => setShowInfoModal(true)}
                className="text-slate-400 hover:text-blue-600 transition-colors"
                title="점수 기준 보기"
              >
                <Info size={18} />
              </button>
            </div>
            <button onClick={() => navigateTo('home')} className="text-blue-600 text-sm font-semibold hover:underline">
              새로운 분석하기
            </button>
          </div>
          {/* URL 표시 줄 */}
          <div className="px-8 py-2 bg-slate-50/50 border-b border-slate-100 text-slate-500 text-sm truncate">
            {urlInput}
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="flex flex-col items-center justify-center space-y-6">
              <div className={`w-48 h-48 rounded-full flex items-center justify-center border-8 ${border} ${bg} transition-all duration-500`}>
                <div className="text-center">
                  <span className={`text-5xl font-extrabold ${color}`}>{score}</span>
                  <span className="text-slate-400 text-lg">/100</span>
                </div>
              </div>
              
              <div className={`px-4 py-2 rounded-full font-bold text-lg ${bg} ${color}`}>
                {label}
              </div>
              
              <p className="text-center text-slate-600 leading-relaxed px-4">
                {analysisResult.summary}
              </p>
            </div>

            <div className="flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="font-bold text-slate-700 mb-4">세부 분석 지표</h3>
                {analysisResult.details.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-600 font-medium">{item.label}</span>
                    <span className="text-slate-800 font-bold">{item.value}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 border-t border-slate-100 pt-6">
                <p className="text-center text-slate-500 text-sm mb-4">이 분석 결과가 도움이 되셨나요?</p>
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
      </div>
    );
  };

  // 4. 정보 모달
  const InfoModal = () => {
    if (!showInfoModal) return null;
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setShowInfoModal(false)}>
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-800">신뢰도 점수 기준</h3>
            <button onClick={() => setShowInfoModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
              <div className="w-3 h-3 mt-1.5 rounded-full bg-red-500 shrink-0"></div>
              <div>
                <span className="block font-bold text-red-700">0% ~ 35%</span>
                <span className="text-sm text-red-600">상품 구매에 도움이 되지 않는 리뷰가 많습니다.</span>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-100">
              <div className="w-3 h-3 mt-1.5 rounded-full bg-orange-500 shrink-0"></div>
              <div>
                <span className="block font-bold text-orange-700">36% ~ 75%</span>
                <span className="text-sm text-orange-600">상품 구매에 도움이 되는 정보가 일부 포함되어 있습니다.</span>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
              <div className="w-3 h-3 mt-1.5 rounded-full bg-green-500 shrink-0"></div>
              <div>
                <span className="block font-bold text-green-700">76% ~ 100%</span>
                <span className="text-sm text-green-600">상품 구매에 실질적인 도움을 주는 신뢰할 수 있는 리뷰입니다.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 5. [신규] 사용자 공지사항 화면
  const NoticeScreen = () => {
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
            <button onClick={() => navigateTo('home')} className="p-2 hover:bg-white rounded-full transition-colors">
              <ArrowLeft className="text-slate-600" />
            </button>
            <h2 className="text-3xl font-extrabold text-slate-800">공지사항</h2>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {notices.map((notice) => (
              <div key={notice.id} className="p-6 border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer group">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg mb-1 group-hover:text-blue-600 transition-colors">{notice.title}</h3>
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
  };

  // 6. [신규] 사용자 문의 화면
  const InquiryScreen = () => (
    <div className="flex flex-col items-center min-h-screen px-4 pt-24 bg-slate-50">
      <div className="w-full max-w-2xl animate-fade-in">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigateTo('home')} className="p-2 hover:bg-white rounded-full transition-colors">
            <ArrowLeft className="text-slate-600" />
          </button>
          <h2 className="text-3xl font-extrabold text-slate-800">문의하기</h2>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
          <p className="text-slate-500 mb-6">
            서비스 이용 중 불편한 점이나 궁금한 점을 남겨주세요.<br/>
            담당자가 확인 후 빠르게 답변 드리겠습니다.
          </p>
          
          <form className="space-y-6" onSubmit={handleInquirySubmit}>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">이메일 주소</label>
              <input type="email" placeholder="답변 받을 이메일을 입력하세요" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors" required />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">문의 유형</label>
              <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors">
                <option>분석 결과 문의</option>
                <option>서비스 오류 신고</option>
                <option>제휴 및 기타 문의</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">제목</label>
              <input type="text" placeholder="문의 제목을 입력하세요" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors" required />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">내용</label>
              <textarea placeholder="문의 내용을 상세히 적어주세요" rows={5} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors resize-none" required></textarea>
            </div>

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2">
              <Send size={18} /> 문의 접수하기
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  // 7. 관리자 로그인
  const AdminLoginScreen = () => (
    <div className="flex items-center justify-center min-h-screen px-4 bg-slate-50">
      <div className="bg-white p-10 rounded-3xl shadow-xl border border-blue-50 w-full max-w-md">
        <h2 className="text-2xl font-extrabold text-center text-slate-800 mb-2">관리자 로그인</h2>
        <p className="text-center text-slate-500 mb-8 text-sm">시스템 관리를 위해 로그인해주세요.</p>
        
        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">아이디</label>
            <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors" placeholder="admin" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">비밀번호</label>
            <input type="password" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors" placeholder="••••••" required />
          </div>
          <button type="submit" className="w-full bg-slate-800 text-white py-3 rounded-lg font-bold hover:bg-slate-900 transition-colors mt-4">
            접속하기
          </button>
        </form>
        <div className="mt-6 text-center">
          <button onClick={() => navigateTo('home')} className="text-sm text-slate-400 hover:text-slate-600">
            ← 메인으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );

  // 8. 관리자 대시보드 (데이터 다운로드 수정됨)
  const AdminDashboardScreen = () => {
    const [activeTab, setActiveTab] = useState('data');
    
    const tabs = [
      { id: 'inquiry', label: '사용자 문의 관리', icon: <MessageSquare size={18} /> },
      { id: 'notice', label: '공지사항 관리', icon: <FileText size={18} /> },
      { id: 'data', label: '데이터 관리', icon: <Database size={18} /> },
      { id: 'aimodel', label: 'AI 모델 재학습', icon: <Cpu size={18} /> },
    ];

    const renderContent = () => {
      switch(activeTab) {
        case 'inquiry':
          return (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-800 mb-4">최근 들어온 문의</h3>
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex justify-between items-center">
                  <div>
                    <div className="font-bold text-slate-700">분석 결과가 이상해요 #{100+i}</div>
                    <div className="text-sm text-slate-500">2023-10-2{i} · user{i}@example.com</div>
                  </div>
                  <button className="px-4 py-2 bg-slate-100 text-slate-600 text-sm rounded-lg hover:bg-blue-50 hover:text-blue-600">답변하기</button>
                </div>
              ))}
            </div>
          );
        case 'notice':
          return (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-slate-800">등록된 공지사항</h3>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700">+ 글쓰기</button>
              </div>
              <div className="bg-white rounded-xl border border-slate-100 p-6 text-center text-slate-500">
                등록된 공지사항이 없습니다.
              </div>
            </div>
          );
        case 'data':
          // 데이터 관리: 리뷰 분석 데이터만 다운로드 가능하게 수정
          return (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-slate-800 mb-4">데이터 추출 및 관리</h3>
              
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="text-blue-600" size={20}/>
                  <span className="font-bold text-slate-700">날짜 구간 설정</span>
                </div>
                <div className="flex flex-col md:flex-row gap-4 items-end md:items-center">
                  <div className="flex-1 w-full">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">시작일</label>
                    <input 
                      type="date" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:border-blue-500 outline-none"
                      value={dateRange.start}
                      onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                    />
                  </div>
                  <span className="text-slate-400 hidden md:block">~</span>
                  <div className="flex-1 w-full">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">종료일</label>
                    <input 
                      type="date" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:border-blue-500 outline-none"
                      value={dateRange.end}
                      onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* 다운로드 버튼: 리뷰 데이터만 남김 */}
              <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:border-blue-200 transition-colors">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-bold text-slate-700 text-lg mb-1">리뷰 분석 데이터 로그</div>
                    <p className="text-sm text-slate-500">선택한 기간 내의 URL별 신뢰도 분석 결과 기록 (.csv)</p>
                  </div>
                  <button 
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-md transition-all transform active:scale-95"
                  >
                    <Download size={18} /> 데이터 다운로드
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                  <div className="text-blue-600 text-sm font-semibold mb-1">총 누적 분석</div>
                  <div className="text-3xl font-extrabold text-blue-800">12,450 건</div>
                </div>
                <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
                  <div className="text-indigo-600 text-sm font-semibold mb-1">오늘 분석 요청</div>
                  <div className="text-3xl font-extrabold text-indigo-800">142 건</div>
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
                    <div className="font-bold text-slate-800 text-lg">Model V2.4</div>
                    <div className="text-green-500 text-sm font-medium">● 가동 중 (정확도 94.2%)</div>
                  </div>
                  <button className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 shadow-md">
                    재학습 시작
                  </button>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 mb-2">
                  <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: '100%' }}></div>
                </div>
                <div className="text-xs text-slate-400 text-right">마지막 업데이트: 2023.10.20</div>
              </div>
            </div>
          );
        default: return null;
      }
    };

    return (
      <div className="flex min-h-screen bg-slate-50 pt-16">
        <aside className="w-64 bg-white border-r border-slate-200 fixed h-full hidden md:block">
          <div className="p-6">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Dashboard</h2>
            <nav className="space-y-2">
              {tabs.map(tab => (
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
            <h1 className="text-2xl font-extrabold text-slate-800">관리자 대시보드</h1>
            <div className="text-sm text-slate-500">Admin 님, 환영합니다.</div>
          </header>
          
          <div className="animate-fade-in">
            {renderContent()}
          </div>
        </main>
      </div>
    );
  };

  return (
    <div className="min-h-screen font-sans bg-slate-50 text-slate-800">
      {currentPage !== 'adminDashboard' && <Navbar />}

      {currentPage === 'home' && <HomeScreen />}
      {currentPage === 'result' && <ResultScreen />}
      {currentPage === 'notice' && <NoticeScreen />}
      {currentPage === 'inquiry' && <InquiryScreen />}
      {currentPage === 'adminLogin' && <AdminLoginScreen />}
      {currentPage === 'adminDashboard' && <AdminDashboardScreen />}
      
      <InfoModal />
      <ToastNotification />

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
          from { opacity: 0; transform: translate(-50%, 20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        .animate-fade-in-up { animation: fadeInUp 0.8s ease-out forwards; }
        .animate-fade-in { animation: fadeInUp 0.5s ease-out forwards; }
        .animate-scale-in { animation: scaleIn 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
}