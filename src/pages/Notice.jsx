// src/pages/Notice.jsx
import React, { useEffect, useState } from "react";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { api } from "../utils/api";   // ✅ 방금 만든 axios 인스턴스

export default function Notice({ onBack }) {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

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

          {/* 공지 리스트 */}
          {!loading &&
            notices.map((notice) => (
              <div
                key={notice.notice_id}
                className="p-6 border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer group"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg mb-1 group-hover:text-blue-600 transition-colors">
                      {notice.title}
                    </h3>
                    <p className="text-slate-500 text-sm">
                      {/* created_at이 "2025-12-01T..." 이런 형식이라 앞에 10글자만 자름 */}
                      {notice.created_at
                        ? notice.created_at.slice(0, 10)
                        : ""}
                    </p>
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
