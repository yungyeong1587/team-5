// src/components/layout/Navbar.jsx
import React from 'react';
import { User, LogOut } from 'lucide-react';
import ReviewCheckIcon from '../icons/ReviewCheckIcon';

export default function Navbar({ isAdmin, onNavigate, onLogout, onLogoClick }) {
  return (
    <nav className="w-full fixed top-0 left-0 z-50 bg-white/90 backdrop-blur-md border-b border-blue-100 h-20 flex items-center justify-between px-8 lg:px-16 shadow-md transition-all">
      {/* 로고 영역 */}
      <div
        className="flex items-center gap-3 cursor-pointer group"
        onClick={onLogoClick}
      >
        <ReviewCheckIcon className="w-8 h-8 text-blue-600 group-hover:text-blue-700 transition-colors" />
        <span className="text-2xl font-extrabold text-slate-800 tracking-tight group-hover:text-blue-900 transition-colors">
          Review Check
        </span>
      </div>

      {/* 메뉴 영역 */}
      <div className="flex items-center gap-10 font-semibold text-slate-600 text-lg">
        <button
          onClick={() => onNavigate('notice')}
          className="hover:text-blue-600 transition-colors"
        >
          공지사항
        </button>

        <button
          onClick={() => onNavigate('inquiry')}
          className="hover:text-blue-600 transition-colors"
        >
          문의
        </button>

        {isAdmin ? (
          <button
            onClick={onLogout}
            className="flex items-center gap-2 text-red-500 hover:text-red-700 font-semibold"
          >
            <LogOut size={22} />
            <span className="text-lg">로그아웃</span>
          </button>
        ) : (
          <button
            onClick={() => onNavigate('adminLogin')}
            className="flex items-center gap-2 hover:text-blue-600 transition-colors"
          >
            <User size={22} />
            <span className="text-lg">관리자</span>
          </button>
        )}
      </div>
    </nav>
  );
}
