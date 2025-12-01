// src/pages/AdminLogin.jsx
import React from 'react';

export default function AdminLogin({ onSubmit, onBack }) {
  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-slate-50">
      <div className="bg-white p-10 rounded-3xl shadow-xl border border-blue-50 w-full max-w-md">
        <h2 className="text-2xl font-extrabold text-center text-slate-800 mb-2">
          관리자 로그인
        </h2>
        <p className="text-center text-slate-500 mb-8 text-sm">
          시스템 관리를 위해 로그인해주세요.
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              아이디
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="admin"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              비밀번호
            </label>
            <input
              type="password"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="••••••"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-slate-800 text-white py-3 rounded-lg font-bold hover:bg-slate-900 transition-colors mt-4"
          >
            접속하기
          </button>
        </form>
        <div className="mt-6 text-center">
          <button
            onClick={onBack}
            className="text-sm text-slate-400 hover:text-slate-600"
          >
            ← 메인으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}
