import React, { useState, useRef, useEffect } from 'react';
import { StudentProfile, ChatMessage } from '../types';
import {
  Bot,
  Send,
  Sparkles,
  User,
  Volume2,
  VolumeX,
  Copy,
  Check,
  RotateCcw,
  HelpCircle,
  GraduationCap
} from 'lucide-react';

interface Props {
  profile: StudentProfile;
  isFullPage?: boolean;
  onClose?: () => void;
  initialTopic?: string;
}

export const GeminiSupportBot: React.FC<Props> = ({
  profile,
  isFullPage = false,
  onClose,
  initialTopic,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      role: 'model',
      text: `Hello ${profile.name}! 👋 I am your **APS Notes AI Academic Advisor & Customer Support Assistant**, powered by Gemini.

I'm configured for your profile:
- **Branch:** ${profile.branch}
- **Scheme:** ${profile.scheme} Scheme
- **Semester:** Sem ${profile.semester}
- **Institution:** ${profile.college}

How can I help you today? You can ask me for:
📖 **Exam Advice:** Passing marks, CIE/SEE splits, and revision roadmaps.
🧮 **SGPA / CGPA:** Credit calculations and grade point conversions.
💻 **Lab Help:** Program logic, Git commands, algorithms, and viva questions.
📚 **Subject Doubts:** Operating Systems, Java OOP, Maths, Data Structures.
🛠️ **Portal Assistance:** Finding specific notes, syllabus copies, or reporting issues.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState(initialTopic ? `Could you give me an overview and exam tips for ${initialTopic}?` : '');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechActiveMsgId, setSpeechActiveMsgId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickQuestions = [
    `How do I score 85%+ in ${profile.semester}th sem ${profile.branch}?`,
    `What are the minimum passing marks for CIE and SEE under ${profile.scheme} Scheme?`,
    `Explain the VTU SGPA formula with an example calculation.`,
    `Give me top viva questions for Git and Data Structures lab.`,
    `What is the syllabus structure for Operating Systems (1BCS304)?`,
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle Text-To-Speech
  const handleToggleSpeak = (id: string, text: string) => {
    if (!('speechSynthesis' in window)) {
      return;
    }
    if (isSpeaking && speechActiveMsgId === id) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setSpeechActiveMsgId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#`_~]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.onend = () => {
      setIsSpeaking(false);
      setSpeechActiveMsgId(null);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setSpeechActiveMsgId(null);
    };
    setSpeechActiveMsgId(id);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = textToSend || input.trim();
    if (!messageText || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const tempBotMessageId = `model-${Date.now()}`;
    const botPlaceholder: ChatMessage = {
      id: tempBotMessageId,
      role: 'model',
      text: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isStreaming: true,
    };

    setMessages((prev) => [...prev, userMessage, botPlaceholder]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const history = messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({
          role: m.role,
          text: m.text,
        }));

      const res = await fetch('/api/support/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          history,
          studentProfile: profile,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';

      if (reader) {
        let doneReading = false;
        while (!doneReading) {
          const { value, done } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.text) {
                  accumulatedText += data.text;
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === tempBotMessageId
                        ? { ...msg, text: accumulatedText }
                        : msg
                    )
                  );
                }
                if (data.done) {
                  doneReading = true;
                }
              } catch {
                // Ignore parse errors from chunk boundary
              }
            }
          }
        }
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempBotMessageId ? { ...msg, isStreaming: false } : msg
        )
      );
    } catch (err: unknown) {
      console.error('Chat error:', err);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempBotMessageId
            ? {
                ...msg,
                text: `I apologize, but I could not reach the server right now. For VTU ${profile.scheme} scheme questions, please review our official SGPA Calculator or Notes tabs above!`,
                isStreaming: false,
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    setSpeechActiveMsgId(null);
    setMessages([
      {
        id: 'welcome',
        role: 'model',
        text: `Chat reset. Ready to help you with ${profile.branch} (Sem ${profile.semester})! What would you like to explore?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div
      className={`flex flex-col bg-white border border-slate-200 shadow-xl overflow-hidden ${
        isFullPage
          ? 'h-[calc(100vh-140px)] min-h-[580px] rounded-2xl max-w-5xl mx-auto'
          : 'h-[560px] w-full rounded-2xl'
      }`}
    >
      {/* Header */}
      <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
              <Bot className="w-6 h-6" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm tracking-wide text-white">
                APS AI Academic Assistant
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> Gemini Real-time
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <span>{profile.name}</span>
              <span>•</span>
              <span>{profile.branch} (Sem {profile.semester})</span>
              <span>•</span>
              <span className="text-teal-400 font-medium">{profile.scheme} Scheme</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleResetChat}
            title="Reset conversation"
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              title="Close chat"
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Minimize
            </button>
          )}
        </div>
      </div>

      {/* Quick Prompts Bar */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 overflow-x-auto scrollbar-none flex items-center gap-2 text-xs">
        <span className="text-slate-600 font-medium whitespace-nowrap flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5 text-teal-600" /> Suggestions:
        </span>
        {quickQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            disabled={isLoading}
            className="whitespace-nowrap px-3 py-1 bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-700 rounded-full border border-slate-200 hover:border-teal-300 transition-all font-medium text-[11px] shadow-xs cursor-pointer"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4 bg-slate-50/50">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-slate-800 text-white'
                    : 'bg-gradient-to-tr from-teal-600 to-emerald-500 text-white shadow-xs'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-xs ${
                  isUser
                    ? 'bg-slate-900 text-white rounded-tr-xs'
                    : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs'
                }`}
              >
                {/* Content */}
                <div className="whitespace-pre-wrap font-sans text-[13px] md:text-sm">
                  {msg.text || (msg.isStreaming && (
                    <span className="inline-flex items-center gap-1.5 text-slate-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-ping" />
                      Thinking and researching VTU records...
                    </span>
                  ))}
                </div>

                {/* Bubble Footer Actions */}
                <div
                  className={`mt-2.5 pt-2 flex items-center justify-between text-[11px] border-t ${
                    isUser
                      ? 'border-slate-800 text-slate-400'
                      : 'border-slate-100 text-slate-600'
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {!isUser && msg.text && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleToggleSpeak(msg.id, msg.text)}
                        title="Read aloud"
                        className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                      >
                        {isSpeaking && speechActiveMsgId === msg.id ? (
                          <VolumeX className="w-3.5 h-3.5 text-rose-500" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => copyToClipboard(msg.id, msg.text)}
                        title="Copy message"
                        className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 md:p-4 bg-white border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask Gemini anything about ${profile.branch}, exam patterns, lab code, notes...`}
              disabled={isLoading}
              className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-xs md:text-sm font-normal text-slate-900 placeholder:text-slate-600 bg-slate-50/50 focus:bg-white transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 disabled:opacity-50 text-white rounded-xl shadow-md shadow-teal-600/20 transition-all shrink-0 cursor-pointer disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-600 px-1">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 font-medium">
              <GraduationCap className="w-3 h-3 text-teal-600" /> VTU 2022/2025 Knowledge Base
            </span>
          </div>
          <span>Replies in real-time</span>
        </div>
      </div>
    </div>
  );
};
