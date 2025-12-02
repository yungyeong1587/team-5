// src/pages/Notice.jsx
import React, { useEffect, useState } from "react";
import { ArrowLeft, ChevronRight, ChevronDown } from "lucide-react";
import { api } from "../utils/api";

export default function Notice({ onBack }) {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        // ✅ 사용자용 공지 목록 API: GET /user/notices
        const res = await api.get("/user/notices", {
          params: {
            page: 1,
            size: 20,
          },
        });

        // 백엔드 응답 형태: { success, result_code, items, total }
        setNotices(res.data.items || []);
      } catch (err) {
        console.error("공지 불러오기 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, []);

  const toggleNotice = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

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
          {/* 로딩 중 */}
          {loading && (
            <div className="p-6 text-center text-slate-400">불러오는 중...</div>
          )}

          {/* 공지 없을 때 */}
          {!loading && notices.length === 0 && (
            <div className="p-6 text-center text-slate-400">
              등록된 공지가 없습니다.
            </div>
          )}

          {!loading &&
            notices.map((notice) => {
              // 4. 현재 항목이 열려있는지 확인
              const isExpanded = expandedId === notice.notice_id;

              return (
                <div
                  key={notice.notice_id}
                  onClick={() => toggleNotice(notice.notice_id)}
                  className={`p-6 border-b border-slate-100 transition-all cursor-pointer group ${
                    isExpanded ? "bg-blue-50/30" : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3
                        className={`font-bold text-lg mb-1 transition-colors ${
                          isExpanded ? "text-blue-700" : "text-slate-800 group-hover:text-blue-600"
                        }`}
                      >
                        {notice.title}
                      </h3>
                      <p className="text-slate-500 text-sm">
                        {notice.created_at ? notice.created_at.slice(0, 10) : ""}
                      </p>
                    </div>
                    {/* 아이콘 전환 로직 */}
                    {isExpanded ? (
                      <ChevronDown className="text-blue-500" />
                    ) : (
                      <ChevronRight className="text-slate-300 group-hover:text-blue-500" />
                    )}
                  </div>

                  {/* 5. 조건부 렌더링: 클릭된 항목만 내용 표시 */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-slate-200/60 text-slate-700 whitespace-pre-wrap leading-relaxed animate-fade-in">
                      {notice.content}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
