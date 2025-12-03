// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import DataManage from './DataManage';
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
  Send,
} from "lucide-react";
import { api } from "../utils/api";

export default function AdminDashboard({
  dateRange = { start: "2023-01-01", end: "2023-12-31" }, // 기본값 설정
  setDateRange = () => {},
  onDownload = () => {},
  onGoToHome = () => {},
  adminInfo,
  onLogout,
}) {
  const [activeTab, setActiveTab] = useState("inquiry");

  // 문의 / 공지 상태들
  const [inquiries, setInquiries] = useState([]);
  const [inqLoading, setInqLoading] = useState(false);

  // 답변 입력을 위한 상태 추가 (각 문의 ID별 텍스트 저장)
  const [replyTexts, setReplyTexts] = useState({});

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

  const handleReplySubmit = async (inquiryId) => {
    const content = replyTexts[inquiryId];
    if (!content || !content.trim()) {
      alert("답변 내용을 입력해주세요.");
      return;
    }

    if (!window.confirm("답변을 등록하시겠습니까? (수정 불가)")) return;

    try {
      const res = await api.post(`/admin/inquiries/${inquiryId}/reply`, {
        content: content,
      });

      if (res.data.success) {
        alert("답변이 등록되었습니다.");
        
        // [수정됨] UI 업데이트 시 reply 객체 구조로 저장
        setInquiries((prev) =>
          prev.map((item) =>
            item.inquiry_id === inquiryId
              ? { 
                  ...item, 
                  status: "done", 
                  has_reply: true, 
                  reply: { content: content } // reply 객체로 업데이트
                }
              : item
          )
        );
        
        setReplyTexts((prev) => ({ ...prev, [inquiryId]: "" }));
      } else {
        alert(res.data.message || "답변 등록 실패");
      }
    } catch (err) {
      console.error("답변 전송 오류:", err);
      alert("답변 전송 중 오류가 발생했습니다.");
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
                  className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm transition-all hover:border-blue-100"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-bold text-slate-800 text-lg">
                        {inq.title}
                      </div>
                      <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">
                          {inq.user_id}
                        </span>
                        <span>{inq.created_at?.slice(0, 10)}</span>
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase ${
                            inq.status === "done"
                              ? "bg-green-100 text-green-600"
                              : "bg-orange-100 text-orange-500"
                          }`}
                        >
                          {inq.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs font-bold">
                      {inq.has_reply ? (
                        <span className="text-blue-600 flex items-center gap-1">
                          <MessageSquare size={14} /> 답변 완료
                        </span>
                      ) : (
                        <span className="text-slate-400">미답변</span>
                      )}
                    </div>
                  </div>

                  <div className="mt-2 mb-4 p-4 bg-slate-50 rounded-lg text-sm text-slate-700 whitespace-pre-wrap border border-slate-100">
                    {inq.content}
                  </div>

                  {!inq.has_reply ? (
                    // 1. 답변이 없는 경우: 입력창 표시 (기존과 동일)
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      {/* ... (입력창 코드 생략, 기존과 동일) ... */}
                       <div className="flex gap-2">
                        <textarea
                          className="flex-1 w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-none focus:border-blue-500 resize-none h-20"
                          placeholder="사용자에게 보낼 답변 내용을 입력하세요..."
                          value={replyTexts[inq.inquiry_id] || ""}
                          onChange={(e) =>
                            setReplyTexts({
                              ...replyTexts,
                              [inq.inquiry_id]: e.target.value,
                            })
                          }
                        />
                        <button
                          onClick={() => handleReplySubmit(inq.inquiry_id)}
                          className="bg-blue-600 text-white px-4 rounded-lg text-sm font-bold hover:bg-blue-700 flex flex-col items-center justify-center gap-1 min-w-[80px]"
                        >
                          <Send size={16} />
                          등록
                        </button>
                      </div>
                    </div>
                  ) : (
                    // 2. [수정됨] 답변이 있는 경우: 답변 내용 표시
                    <div className="mt-3 bg-blue-50 p-3 rounded-lg border border-blue-100">
                      <div className="text-xs font-bold text-blue-600 mb-1">
                        관리자 답변
                      </div>
                      <div className="text-sm text-slate-700">
                        {/* reply 객체 안의 content를 참조 */}
                        {inq.reply?.content || "답변 내용이 로드되지 않았습니다."}
                      </div>
                    </div>
                  )}
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
                  className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm hover:border-blue-100 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="font-semibold text-slate-800 text-lg">
                        {notice.title}
                      </div>
                      
                      {/* [수정됨] 공지사항 상세 내용 표시 영역 */}
                      <div className="mt-2 mb-2 p-3 bg-slate-50 rounded-lg text-sm text-slate-700 whitespace-pre-wrap border border-slate-100">
                        {notice.content}
                      </div>

                      <div className="text-xs text-slate-500">
                        {notice.created_at?.slice(0, 10)}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteNotice(notice.notice_id)}
                      className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 bg-red-50 px-2 py-1 rounded ml-4"
                    >
                      <Trash2 size={14} />
                      삭제
                    </button>
                  </div>
                </div>
              ))}
          </div>
        );

      case "data":
        return <DataManage />;
        
      case "aimodel":
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