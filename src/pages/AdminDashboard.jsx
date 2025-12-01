// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import {
  MessageSquare,
  FileText,
  Database,
  Cpu,
  Calendar,
  Download,
  LogOut,
  Trash2,
  PlusCircle,
} from "lucide-react";
import { api } from "../utils/api";

export default function AdminDashboard({
  dateRange,
  setDateRange,
  onDownload,
  onGoToHome,
  adminInfo,      // { username } 형태라고 가정
  onLogout,       // 로그아웃 시 부모에게 알림
}) {
  const [activeTab, setActiveTab] = useState("data");

  // 문의 / 공지 상태들
  const [inquiries, setInquiries] = useState([]);
  const [inqLoading, setInqLoading] = useState(false);

  const [notices, setNotices] = useState([]);
  const [noticeLoading, setNoticeLoading] = useState(false);

  const [noticeFormOpen, setNoticeFormOpen] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeContent, setNoticeContent] = useState("");
  const [noticeSaving, setNoticeSaving] = useState(false);

  // 탭 바뀔 때마다 해당 데이터 로딩
  useEffect(() => {
    if (activeTab === "inquiry") {
      loadInquiries();
    } else if (activeTab === "notice") {
      loadNotices();
    }
  }, [activeTab]);

  const loadInquiries = async () => {
    setInqLoading(true);
    try {
      const res = await api.get("/admin/inquiries", {
        params: { page: 1, size: 20 },
      });
      setInquiries(res.data.items || []);
    } catch (err) {
      console.error("문의 목록 불러오기 실패:", err);
    } finally {
      setInqLoading(false);
    }
  };

  const loadNotices = async () => {
    setNoticeLoading(true);
    try {
      const res = await api.get("/admin/notices", {
        params: { page: 1, size: 20 },
      });
      setNotices(res.data.items || []);
    } catch (err) {
      console.error("공지 목록 불러오기 실패:", err);
    } finally {
      setNoticeLoading(false);
    }
  };

  // 공지 생성
  const handleCreateNotice = async (e) => {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeContent.trim()) return;
    setNoticeSaving(true);
    try {
      const res = await api.post("/admin/notices", {
        title: noticeTitle,
        content: noticeContent,
      });
      if (res.data.success) {
        setNoticeTitle("");
        setNoticeContent("");
        setNoticeFormOpen(false);
        await loadNotices();
      } else {
        alert(res.data.message || "공지 생성에 실패했습니다.");
      }
    } catch (err) {
      console.error("공지 생성 실패:", err);
      alert("공지 생성 중 오류가 발생했습니다.");
    } finally {
      setNoticeSaving(false);
    }
  };

  // 공지 삭제
  const handleDeleteNotice = async (noticeId) => {
    if (!window.confirm("정말 이 공지사항을 삭제할까요?")) return;
    try {
      const res = await api.delete(`/admin/notices/${noticeId}`);
      if (res.data.success) {
        setNotices((prev) =>
          prev.filter((n) => n.notice_id !== noticeId)
        );
      } else {
        alert(res.data.message || "삭제에 실패했습니다.");
      }
    } catch (err) {
      console.error("공지 삭제 실패:", err);
      alert("공지 삭제 중 오류가 발생했습니다.");
    }
  };

  // 로그아웃
  const handleLogout = async () => {
    try {
      await api.post("/admin/logout", {
        request_user: adminInfo?.username || "admin",
      });
    } catch (err) {
      console.error("로그아웃 요청 중 오류:", err);
      // 에러여도 토큰은 지우고 나가게
    }
    if (onLogout) {
      onLogout();
    }
  };

  const tabs = [
    { id: "inquiry", label: "사용자 문의 관리", icon: <MessageSquare size={18} /> },
    { id: "notice", label: "공지사항 관리", icon: <FileText size={18} /> },
    { id: "data", label: "데이터 관리", icon: <Database size={18} /> },
    { id: "aimodel", label: "AI 모델 재학습", icon: <Cpu size={18} /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "inquiry":
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-800 mb-4">
              최근 들어온 문의
            </h3>

            {inqLoading && (
              <div className="bg-white p-6 rounded-xl border border-slate-100 text-center text-slate-400">
                문의 목록 불러오는 중...
              </div>
            )}

            {!inqLoading && inquiries.length === 0 && (
              <div className="bg-white p-6 rounded-xl border border-slate-100 text-center text-slate-400">
                등록된 문의가 없습니다.
              </div>
            )}

            {!inqLoading &&
              inquiries.map((inq) => (
                <div
                  key={inq.inquiry_id}
                  className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex justify-between items-center"
                >
                  <div>
                    <div className="font-bold text-slate-700">
                      {inq.title}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      사용자: {inq.user_id} · 상태:{" "}
                      <span
                        className={
                          inq.status === "done"
                            ? "text-green-600"
                            : "text-orange-500"
                        }
                      >
                        {inq.status}
                      </span>{" "}
                      · {inq.created_at?.slice(0, 10)}
                    </div>
                  </div>
                  <div className="text-xs text-slate-500">
                    {inq.has_reply ? "답변 완료" : "미답변"}
                  </div>
                </div>
              ))}
          </div>
        );

      case "notice":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-800">
                등록된 공지사항
              </h3>
              <button
                onClick={() => setNoticeFormOpen((v) => !v)}
                className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700"
              >
                <PlusCircle size={16} />
                {noticeFormOpen ? "작성 취소" : "+ 글쓰기"}
              </button>
            </div>

            {noticeFormOpen && (
              <form
                onSubmit={handleCreateNotice}
                className="bg-white rounded-xl border border-slate-200 p-4 space-y-3"
              >
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  placeholder="공지 제목을 입력하세요"
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                  required
                />
                <textarea
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none"
                  placeholder="공지 내용을 입력하세요"
                  value={noticeContent}
                  onChange={(e) => setNoticeContent(e.target.value)}
                  required
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setNoticeFormOpen(false)}
                    className="px-3 py-2 text-sm text-slate-500 hover:text-slate-700"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={noticeSaving}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
                  >
                    {noticeSaving ? "저장 중..." : "등록"}
                  </button>
                </div>
              </form>
            )}

            {noticeLoading && (
              <div className="bg-white rounded-xl border border-slate-100 p-6 text-center text-slate-400">
                공지사항 불러오는 중...
              </div>
            )}

            {!noticeLoading && notices.length === 0 && (
              <div className="bg-white rounded-xl border border-slate-100 p-6 text-center text-slate-500">
                등록된 공지사항이 없습니다.
              </div>
            )}

            {!noticeLoading &&
              notices.map((notice) => (
                <div
                  key={notice.notice_id}
                  className="bg-white rounded-xl border border-slate-100 p-4 flex justify-between items-center"
                >
                  <div>
                    <div className="font-semibold text-slate-800">
                      {notice.title}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {notice.created_at?.slice(0, 10)}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteNotice(notice.notice_id)}
                    className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600"
                  >
                    <Trash2 size={14} />
                    삭제
                  </button>
                </div>
              ))}
          </div>
        );

      case "data":
        // 기존 데이터 탭 그대로 (살짝만 정리)
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
          </div>
        );

      case "aimodel":
        // 기존 코드 그대로 가져와도 됨 (설명 생략)
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
                  style={{ width: "100%" }}
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
                    ? "bg-blue-50 text-blue-600 font-bold shadow-sm"
                    : "text-slate-600 hover:bg-slate-50"
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
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600 transition-colors"
            >
              사용자 화면으로 보기
            </button>
            <span className="text-slate-500">
              {adminInfo?.username || "Admin"} 님, 환영합니다.
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <LogOut size={16} />
              로그아웃
            </button>
          </div>
        </header>

        <div className="animate-fade-in">{renderContent()}</div>
      </main>
    </div>
  );
}
