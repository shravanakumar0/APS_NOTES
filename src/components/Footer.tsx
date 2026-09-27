import React from 'react';
import { ActiveTab } from '../types';
import { BookOpen, ExternalLink, Heart, Sparkles } from 'lucide-react';

interface Props {
  setActiveTab: (tab: ActiveTab) => void;
  onOpenSupportUs: () => void;
  onOpenUpload: () => void;
}

export const Footer: React.FC<Props> = ({ setActiveTab, onOpenSupportUs, onOpenUpload }) => {
  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800/80 pt-16 pb-24 md:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Col 1: Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center font-bold">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="text-lg font-black tracking-tight text-white">APS Notes</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              The premier digital academic repository and real-time AI customer support platform for Visvesvaraya Technological University (VTU) engineering students. Providing verified notes, question papers, syllabus, and calculators.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={onOpenSupportUs}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-500/10 text-rose-300 border border-rose-500/30 hover:bg-rose-500/20 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Heart className="w-3.5 h-3.5 fill-current" /> Support APS Notes
              </button>
              <button
                onClick={() => setActiveTab('support')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-teal-500/10 text-teal-300 border border-teal-500/30 hover:bg-teal-500/20 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" /> Ask Gemini AI
              </button>
            </div>
          </div>

          {/* Col 2: VTU Official Portals */}
          <div className="space-y-3">
            <h4 className="text-white font-bold uppercase tracking-wider text-xs">
              VTU Official Portals
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://results.vtu.ac.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-teal-400 flex items-center gap-1 transition-colors"
                >
                  VTU Exam Results <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li>
                <a
                  href="https://vtu.ac.in/category/time-table/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-teal-400 flex items-center gap-1 transition-colors"
                >
                  VTU Exam Time Table <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li>
                <a
                  href="https://vtu.ac.in/academic-calendar/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-teal-400 flex items-center gap-1 transition-colors"
                >
                  Academic Calendar <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li>
                <a
                  href="https://vtu.ac.in/category/examination/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-teal-400 flex items-center gap-1 transition-colors"
                >
                  Exam Circulars <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Academic Tools */}
          <div className="space-y-3">
            <h4 className="text-white font-bold uppercase tracking-wider text-xs">
              Academic Tools
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setActiveTab('sgpa')}
                  className="hover:text-teal-400 transition-colors text-left cursor-pointer"
                >
                  VTU SGPA Calculator
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('cgpa')}
                  className="hover:text-teal-400 transition-colors text-left cursor-pointer"
                >
                  VTU CGPA Calculator
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('syllabus')}
                  className="hover:text-teal-400 transition-colors text-left cursor-pointer"
                >
                  VTU Syllabus Explorer
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('papers')}
                  className="hover:text-teal-400 transition-colors text-left cursor-pointer"
                >
                  Question Papers &amp; Models
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenUpload}
                  className="hover:text-teal-400 transition-colors text-left cursor-pointer"
                >
                  Submit Study Materials
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Community & Social */}
          <div className="space-y-3">
            <h4 className="text-white font-bold uppercase tracking-wider text-xs">
              Student Community
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://whatsapp.com/channel/0029VaWmXuO5kg6yeDhO3V1i"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-teal-400 flex items-center gap-1 transition-colors"
                >
                  WhatsApp Channel (50k+)
                </a>
              </li>
              <li>
                <a
                  href="https://t.me/apsnotes"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-teal-400 flex items-center gap-1 transition-colors"
                >
                  Telegram Discussion Group
                </a>
              </li>
              <li>
                <a
                  href="https://www.youtube.com/@apsnotes"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-teal-400 flex items-center gap-1 transition-colors"
                >
                  YouTube Lectures &amp; Tips
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/apsnotes"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-teal-400 flex items-center gap-1 transition-colors"
                >
                  Instagram Updates
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <p>
            Copyright &copy; {new Date().getFullYear()} APS Notes. Built for Visvesvaraya Technological University students.
          </p>
          <div className="flex items-center gap-4">
            <span>Disclaimer: Academic notes are shared by faculty and student contributors for educational purposes.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
