import React, { useState } from 'react';
import { Heart, QrCode, X, ShieldCheck } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportUsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [copiedUPI, setCopiedUPI] = useState(false);

  if (!isOpen) return null;

  const upiId = 'apsnotes@upi';

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUPI(true);
    setTimeout(() => setCopiedUPI(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        <div className="bg-gradient-to-r from-rose-600 to-pink-600 p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-2 text-white shadow-inner">
            <Heart className="w-6 h-6 fill-current" />
          </div>
          <h3 className="text-xl font-extrabold">Support APS Notes</h3>
          <p className="text-xs text-rose-100 mt-1">
            Free academic resources for 50,000+ VTU engineering students
          </p>
        </div>

        <div className="p-6 space-y-5 text-center">
          <p className="text-xs text-slate-600 leading-relaxed">
            APS Notes is 100% community-driven and student-maintained. We do not place annoying pop-up ads or paywalls. Every contribution directly funds cloud database servers, high-speed PDF distribution, and AI support bandwidth.
          </p>

          {/* UPI Card */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-800">
              <QrCode className="w-4 h-4 text-teal-600" /> UPI Contribution Handle
            </div>
            <div className="flex items-center justify-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-slate-200">
              <span className="font-mono text-sm font-bold text-slate-800">{upiId}</span>
              <button
                onClick={handleCopyUPI}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold rounded-lg transition-colors cursor-pointer"
              >
                {copiedUPI ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Works with Google Pay, PhonePe, Paytm, and any UPI app.
            </p>
          </div>

          <div className="space-y-2 text-left bg-teal-50/50 p-3.5 rounded-xl border border-teal-100 text-xs text-teal-900">
            <div className="font-bold flex items-center gap-1.5 text-teal-800">
              <ShieldCheck className="w-4 h-4 text-teal-600" /> What your support enables:
            </div>
            <ul className="space-y-1 text-[11px] text-slate-600 pl-5 list-disc">
              <li>Ad-free fast note downloads for all engineering streams</li>
              <li>Hosting for real-time Gemini AI Customer Support</li>
              <li>Free access to VTU SGPA &amp; CGPA calculation tools</li>
            </ul>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
