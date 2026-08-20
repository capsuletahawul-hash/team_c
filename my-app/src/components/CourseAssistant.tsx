import React, { useState, useRef, useEffect } from "react";
import { askAboutCourses } from "../services/api";
import { useLanguage } from "../context/LanguageContext";
import { 
  SparklesIcon, 
  PaperAirplaneIcon, 
  UserIcon, 
  QuestionMarkCircleIcon,
  TrashIcon
} from "@heroicons/react/24/outline";

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  isStreaming?: boolean;
}

const answerCache = new Map<string, string>();

function normalizeQuestion(question: string) {
  return question.trim().toLowerCase().replace(/\s+/g, " ");
}

export default function CourseAssistant() {
  const { lang, t } = useLanguage();
  const isRTL = lang === 'ar';
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      sender: 'ai',
      text: isRTL
        ? "أهلاً بك! أنا مساعد كبسولة التحول الذكي 🤖. كيف يمكنني مساعدتك اليوم في استكشاف المسارات التعليمية والمعسكرات والدورات؟"
        : "Welcome! I am Capsule AI Assistant 🤖. How can I help you explore our bootcamps and learning tracks today?",
      timestamp: new Date().toLocaleTimeString(isRTL ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
    }
  ]);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const suggestedQuestions = isRTL ? [
    "كم عدد الكورسات والمسارات المتاحة بالمنصة؟",
    "ما هي دورات الذكاء الاصطناعي المتوفرة؟",
    "من هم المدربون والخبراء المتاحون؟",
  ] : [
    "How many courses and tracks are available?",
    "What AI and Data Science courses are offered?",
    "Who are the expert instructors on the platform?",
  ];

  // Fast Word-by-Word Typewriter Streaming Effect
  const streamAiMessage = (fullText: string) => {
    const aiMsgId = `ai_${Date.now()}`;
    const timestamp = new Date().toLocaleTimeString(isRTL ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' });

    setMessages((prev) => [
      ...prev,
      {
        id: aiMsgId,
        sender: 'ai',
        text: '',
        timestamp,
        isStreaming: true,
      }
    ]);

    const words = fullText.split(' ');
    let currentWordIdx = 0;

    const interval = setInterval(() => {
      currentWordIdx++;
      const currentText = words.slice(0, currentWordIdx).join(' ');

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMsgId
            ? { ...msg, text: currentText, isStreaming: currentWordIdx < words.length }
            : msg
        )
      );

      scrollToBottom();

      if (currentWordIdx >= words.length) {
        clearInterval(interval);
      }
    }, 18); // 18ms per word: fast, natural streaming
  };

  const handleSendQuestion = async (userText?: string) => {
    const textToSend = userText || question;
    const normalized = normalizeQuestion(textToSend);

    if (!normalized || loading) return;

    const timeString = new Date().toLocaleTimeString(isRTL ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: timeString,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!userText) setQuestion("");

    // Check cache
    const cachedAnswer = answerCache.get(normalized);
    if (cachedAnswer) {
      streamAiMessage(cachedAnswer);
      return;
    }

    setLoading(true);

    try {
      const response: any = await askAboutCourses(normalized);

      let formattedAnswer = isRTL
        ? "تعذر الحصول على إجابة من المساعد الذكي حالياً."
        : "Unable to retrieve an answer at the moment.";

      if (response && response.success && response.data?.answer) {
        const raw = response.data.answer;
        formattedAnswer = typeof raw === 'string' 
          ? raw 
          : (typeof raw === 'object' && raw !== null && 'answer' in raw 
              ? String(raw.answer) 
              : JSON.stringify(raw));
        answerCache.set(normalized, formattedAnswer);
      } else if (response?.error) {
        formattedAnswer = typeof response.error === 'string' ? response.error : formattedAnswer;
      }

      streamAiMessage(formattedAnswer);
    } catch {
      streamAiMessage(
        isRTL 
          ? "حدث خطأ أثناء الاتصال بالذكاء الاصطناعي. يرجى المحاولة مرة أخرى."
          : "Connection error. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'welcome',
        sender: 'ai',
        text: isRTL
          ? "أهلاً بك مجدداً! أنا مساعد كبسولة الذكي 🤖. كيف يمكنني مساعدتك؟"
          : "Welcome back! I am Capsule AI Assistant 🤖. How can I help you?",
        timestamp: new Date().toLocaleTimeString(isRTL ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
      }
    ]);
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-6 font-sans transition-all" dir={t.dir}>
      {/* Seamless Glassmorphic Container Card */}
      <div className="bg-white/85 dark:bg-[#0B1120]/85 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-xl hover:shadow-2xl hover:border-teal-500/30 overflow-hidden flex flex-col h-[600px] transition-all duration-300">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0D3B43] via-[#123E4C] to-[#0A535C] dark:from-[#080E1A] dark:via-[#0F1B2D] dark:to-[#0F2837] px-6 py-4 border-b border-teal-500/20 text-white flex items-center justify-between shadow-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,164,153,0.22),transparent_60%)] pointer-events-none"></div>
          
          <div className="flex items-center gap-3.5 relative z-10">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#00A499] to-cyan-400 p-0.5 shadow-md shadow-teal-500/30 flex items-center justify-center">
              <div className="w-full h-full bg-[#0D3B43] dark:bg-[#091524] rounded-[14px] flex items-center justify-center">
                <SparklesIcon className="w-5 h-5 text-[#26FFE6] animate-pulse" />
              </div>
            </div>
            <div>
              <h2 className="text-sm md:text-base font-black tracking-tight flex items-center gap-2">
                <span>{isRTL ? 'مساعد كبسولة الذكي' : 'Capsule AI Assistant'}</span>
                <span className="text-[9.5px] font-extrabold bg-[#00A499]/20 text-[#26FFE6] px-2 py-0.5 rounded-full border border-teal-500/30 uppercase tracking-wider">
                  AI 2.0 Streaming
                </span>
              </h2>
              <p className="text-[11px] text-slate-300 font-medium">
                {isRTL ? 'إجابات فورية ومنسقة لجميع استفسارات الدورات والمعسكرات' : 'Instant AI streaming guidance for tracks & courses'}
              </p>
            </div>
          </div>

          <button
            onClick={handleClearHistory}
            title={isRTL ? 'مسح المحادثة' : 'Clear Chat'}
            className="relative z-10 p-2 rounded-xl bg-white/10 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-white/10 transition-all cursor-pointer"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Chat Thread Messages Display */}
        <div ref={chatContainerRef} className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/40 dark:bg-[#070D19]/40 scroll-smooth">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.sender === 'user' ? (isRTL ? 'flex-row' : 'flex-row-reverse') : (isRTL ? 'flex-row-reverse' : 'flex-row')
              }`}
            >
              {/* Avatar Icon */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-slate-800 text-white dark:bg-slate-700'
                    : 'bg-gradient-to-tr from-[#00A499] to-cyan-400 text-slate-950 font-bold'
                }`}
              >
                {msg.sender === 'user' ? (
                  <UserIcon className="w-4 h-4" />
                ) : (
                  <SparklesIcon className="w-4 h-4 text-slate-950" />
                )}
              </div>

              {/* Message Bubble */}
              <div className={`max-w-[85%] space-y-1 ${msg.sender === 'user' ? (isRTL ? 'text-right' : 'text-left') : (isRTL ? 'text-right' : 'text-left')}`}>
                <div
                  className={`p-4 rounded-2xl text-xs md:text-sm font-medium leading-relaxed shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-[#0D4C54] text-white rounded-tr-none dark:bg-[#00A499] dark:text-slate-950 font-semibold'
                      : 'bg-white dark:bg-[#141E33] text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-line font-sans">
                    {msg.text}
                    {msg.isStreaming && <span className="inline-block w-1.5 h-4 ml-1 bg-[#00A499] dark:bg-[#26FFE6] animate-pulse"></span>}
                  </p>
                </div>
                <span className="text-[9.5px] text-slate-400 dark:text-slate-500 block px-1 font-mono">
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}

          {/* Loading Dots (before response starts streaming) */}
          {loading && (
            <div className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#00A499] to-cyan-400 text-slate-950 flex items-center justify-center shrink-0 shadow-xs animate-pulse">
                <SparklesIcon className="w-4 h-4" />
              </div>
              <div className="bg-white dark:bg-[#141E33] p-3.5 rounded-2xl rounded-tl-none border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00A499] animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-teal-300 animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Suggested Prompts Chips */}
        <div className="px-5 py-2.5 bg-slate-100/70 dark:bg-[#0A101D]/70 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <QuestionMarkCircleIcon className="w-4 h-4 text-[#00A499] shrink-0" />
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 shrink-0">
            {isRTL ? 'أسئلة مقترحة:' : 'Suggested:'}
          </span>
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendQuestion(q)}
              disabled={loading}
              className="text-xs font-semibold bg-white dark:bg-[#141E33] hover:bg-[#00A499]/10 hover:text-[#00A499] dark:hover:text-[#26FFE6] text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 transition-all shrink-0 cursor-pointer disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white/90 dark:bg-[#0B1120]/90 border-t border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-2 relative">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !loading) {
                  handleSendQuestion();
                }
              }}
              placeholder={isRTL ? 'اكتب سؤالك هنا واستفسر عن المناهج والمعسكرات...' : 'Ask about our courses and bootcamps...'}
              disabled={loading}
              className="flex-1 bg-slate-50 dark:bg-[#070D19] text-slate-900 dark:text-white rounded-2xl px-5 py-3 text-xs md:text-sm font-medium border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#00A499] focus:ring-2 focus:ring-[#00A499]/20 transition-all disabled:opacity-50"
            />

            <button
              type="button"
              onClick={() => handleSendQuestion()}
              disabled={loading || !question.trim()}
              className="bg-[#00A499] hover:bg-[#008c83] dark:bg-teal-500 dark:hover:bg-teal-400 text-white dark:text-slate-950 font-black px-5 py-3 rounded-2xl shadow-lg shadow-teal-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-40 disabled:hover:scale-100"
            >
              <span>{isRTL ? 'إرسال' : 'Send'}</span>
              <PaperAirplaneIcon className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}