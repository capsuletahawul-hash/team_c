import { useState } from "react";
import { askAboutCourses } from "../services/api";
import { useLanguage } from "../context/LanguageContext";

const answerCache = new Map<string, string>();

function normalizeQuestion(question: string) {
  return question.trim().toLowerCase().replace(/\s+/g, " ");
}

export default function CourseAssistant() {
  const { lang } = useLanguage();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    const normalizedQuestion = normalizeQuestion(question);

    if (!normalizedQuestion) {
      setError(lang === 'ar' ? "يرجى كتابة سؤالك أولاً." : "Please enter a question.");
      return;
    }

    const cachedAnswer = answerCache.get(normalizedQuestion);

    if (cachedAnswer) {
      setAnswer(cachedAnswer);
      setError("");
      return;
    }

    setLoading(true);
    setError("");
    setAnswer("");

    try {
      const response: any = await askAboutCourses(normalizedQuestion);

      if (!response.success || !response.data?.answer) {
        setError(response.error || (lang === 'ar' ? "تعذر الحصول على إجابة من المساعد الذكي." : "Unable to get an answer."));
        return;
      }

      const raw = response.data.answer;
      const formattedAnswer = typeof raw === 'string' 
        ? raw 
        : (typeof raw === 'object' && raw !== null && 'answer' in raw 
            ? String(raw.answer) 
            : JSON.stringify(raw));

      answerCache.set(normalizedQuestion, formattedAnswer);
      setAnswer(formattedAnswer);
    } catch {
      setError(lang === 'ar' ? "حدث خطأ أثناء التواصل مع خادم الذكاء الاصطناعي. يرجى المحاولة مرة أخرى." : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full max-w-3xl mx-auto p-6">
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold mb-2">
          Course Assistant
        </h2>

        <p className="text-gray-500 mb-5">
          Ask me anything about our courses.
        </p>

        <div className="flex gap-3">
          <input
            type="text"
            value={question}
            onChange={(e) => {
              setQuestion(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !loading) {
                handleAsk();
              }
            }}
            placeholder="Ask about courses..."
            disabled={loading}
            className="flex-1 rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100"
          />

          <button
            type="button"
            onClick={handleAsk}
            disabled={loading}
            className="rounded-xl px-5 py-3 text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Asking..." : "Ask"}
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}

        {answer && (
          <div className="mt-5 rounded-xl bg-gray-50 p-5">
            <h3 className="font-semibold mb-2">Answer</h3>
            <p className="whitespace-pre-wrap text-gray-700">
              {answer}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}