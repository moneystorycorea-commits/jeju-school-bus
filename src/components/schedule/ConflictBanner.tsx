import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Conflict } from '@/types';

interface ConflictBannerProps {
  conflicts: Conflict[];
}

export const ConflictBanner: React.FC<ConflictBannerProps> = ({ conflicts }) => {
  const [dismissed, setDismissed] = useState(false);

  if (conflicts.length === 0 || dismissed) {
    return null;
  }

  // 우선순위가 높은 error 또는 첫 번째 conflict 표시
  const topConflict = conflicts.find((c) => c.level === 'error') || conflicts[0];

  return (
    <div className="bg-red-50 border-t border-b border-red-200 px-6 py-3 flex items-center justify-between gap-3 text-red-800 select-none animate-fadeIn">
      <div className="flex items-center gap-2.5 text-sm md:text-base font-bold">
        <span className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xs">
          <AlertTriangle className="w-4 h-4" />
        </span>
        <span className="tracking-tight">{topConflict.message}</span>
        {conflicts.length > 1 && (
          <span className="text-xs md:text-sm bg-red-100 text-red-900 px-2.5 py-0.5 rounded-full border border-red-300 font-extrabold">
            외 {conflicts.length - 1}건
          </span>
        )}
      </div>

      <button
        onClick={() => setDismissed(true)}
        className="text-red-500 hover:text-red-800 p-1 rounded hover:bg-red-100 transition cursor-pointer"
        title="닫기"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
