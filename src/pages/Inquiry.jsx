// src/pages/Inquiry.jsx
import React, { useState } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { api } from "../utils/api";

export default function Inquiry({ onBack, onSubmitted }) {
  const [email, setEmail] = useState("");
  const [type, setType] = useState("분석 결과 문의");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 백엔드 스키마에 맞춰 user_id / title / content 전송
      const res = await api.post("/user/inquiry", {
        user_id: email, // 이메일을 user_id로 사용
        title: `[${type}] ${title}`,
        content: `${content}\n\n[문의 유형] ${type}\n[회신 이메일] ${email}`,
      });

      if (!res.data.success) {
        alert(res.data.message || "문의 등록에 실패했습니다.");
        return;
      }

      alert("문의가 정상적으로 접수되었습니다.");
      setEmail("");
      setType("분석 결과 문의");
      setTitle("");
      setContent("");

      if (onSubmitted) onSubmitted(res.data.inquiry);
    } catch (err) {
      console.error("문의 등록 오류:", err);
      alert("문의 등록 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

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

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                이메일 주소
              </label>
              <input
                type="email"
                placeholder="답변 받을 이메일을 입력하세요"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                문의 유형
              </label>
              <select
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
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
                value={title}
                onChange={(e) => setTitle(e.target.value)}
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
                value={content}
                onChange={(e) => setContent(e.target.value)}
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <Send size={18} /> {loading ? "전송 중..." : "문의 접수하기"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
