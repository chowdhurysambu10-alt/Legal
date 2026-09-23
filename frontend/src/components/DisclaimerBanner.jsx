import React, { useState } from 'react';
import { Info, X } from 'lucide-react';

export default function DisclaimerBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-[#ede7dc] text-[#3e483e] text-xs py-2 px-4 border-b border-[#dfd7ca]">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#526f50]"></span>
          <span>
            <strong className="text-[#1e251f] font-semibold">Legal Notice:</strong> This platform provides AI-assisted contract synthesis and semantic retrieval, <span className="underline decoration-[#9eb59d] underline-offset-2">not legal advice</span>. Consult qualified legal counsel for binding legal decisions.
          </span>
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="text-[#647466] hover:text-[#1e251f] p-0.5 rounded transition-colors shrink-0"
          aria-label="Dismiss disclaimer"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
