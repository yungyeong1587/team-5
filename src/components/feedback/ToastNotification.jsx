// src/components/feedback/ToastNotification.jsx
import React from 'react';
import { Info, ThumbsUp, X } from 'lucide-react';

export default function ToastNotification({ toast, onClose }) {
  if (!toast?.show) return null;

  let classes = '';
  let Icon = Info;
  let iconColor = '';

  switch (toast.type) {
    case 'success':
      classes = 'bg-green-600 border-green-700';
      Icon = ThumbsUp;
      iconColor = 'text-green-100';
      break;
    case 'error':
      classes = 'bg-red-600 border-red-700';
      Icon = X;
      iconColor = 'text-red-100';
      break;
    case 'info':
    default:
      classes = 'bg-blue-600 border-blue-700';
      Icon = Info;
      iconColor = 'text-blue-100';
      break;
  }

  return (
    <div className="fixed inset-x-0 bottom-6 z-[200] flex justify-center pointer-events-none">
      <div
        className={`p-4 rounded-xl shadow-2xl border transition-all duration-300 flex items-center gap-3 ${classes} pointer-events-auto animate-toast-in`}
      >
        <Icon size={20} className={iconColor} />
        <span className="text-white font-medium text-sm">{toast.message}</span>
        <button
          onClick={onClose}
          className="text-white/70 hover:text-white ml-2"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
