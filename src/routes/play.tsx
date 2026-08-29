import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { api, type QuizQuestion, type QuizSubmitResult } from "@/lib/api";
import { Gamepad2, Award, CheckCircle, XCircle, RefreshCw, Zap, Trophy } from "lucide-react";
import { motion } from "motion/react";

export const Route = createFileRoute("/play")({
  component: QuizPage,
});

function QuizPage() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<QuizSubmitResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuiz();
  }, []);

  const fetchQuiz = () => {
    setLoading(true);
    setSubmitted(false);
    setResult(null);
    setAnswers({});
    api.getQuiz().then((res) => {
      setQuestions(res);
      setLoading(false);
    });
  };

  const handleSelectOption = (qId: string, option: string) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qId]: option }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      alert("Please answer all questions before submitting your quiz.");
      return;
    }
    setLoading(true);
    const res = await api.submitQuiz(answers);
    setResult(res);
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <AppShell>
      <PageHeader
        eyebrow="Interactive Game Engine"
        title="Botanical Knowledge Quiz"
        subtitle="Challenge yourself on traditional medicinal plants, Siddha uses, and active compounds to earn XP points."
      />

      <div className="mx-auto max-w-3xl space-y-8">
        {loading && (
          <div className="py-20 text-center text-muted-foreground animate-pulse">
            Generating custom questions from IEEE MPI dataset...
          </div>
        )}

        {!loading && result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-strong rounded-3xl p-8 text-center space-y-6 border border-primary/40 shadow-xl"
          >
            <div className="mx-auto grid size-20 place-items-center rounded-3xl bg-amber-500/20 text-amber-400">
              <Trophy className="size-10" />
            </div>

            <div>
              <h2 className="font-display text-3xl font-bold">Quiz Completed!</h2>
              <p className="text-muted-foreground mt-1">Great job testing your medicinal plant knowledge.</p>
            </div>

            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <div className="glass p-4 rounded-2xl">
                <span className="text-xs text-muted-foreground block">Final Score</span>
                <span className="text-3xl font-extrabold text-primary">
                  {result.score} / {result.total}
                </span>
              </div>
              <div className="glass p-4 rounded-2xl">
                <span className="text-xs text-muted-foreground block">XP Earned</span>
                <span className="text-3xl font-extrabold text-amber-400 flex items-center justify-center gap-1">
                  <Zap className="size-6 fill-amber-400" /> +{result.xpEarned}
                </span>
              </div>
            </div>

            <button
              onClick={fetchQuiz}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 font-semibold text-primary-foreground transition-all hover:opacity-90 shadow-lg"
            >
              <RefreshCw className="size-5" /> Play Another Round
            </button>
          </motion.div>
        )}

        {!loading && !result && questions.length > 0 && (
          <div className="space-y-6">
            {questions.map((q, idx) => (
              <div key={q.id} className="glass rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-semibold text-primary uppercase">Question {idx + 1} of {questions.length}</span>
                </div>
                <h3 className="text-lg font-bold">{q.question}</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {q.options.map((opt) => {
                    const isSelected = answers[q.id] === opt;
                    return (
                      <button
                        key={opt}
                        onClick={() => handleSelectOption(q.id, opt)}
                        className={`rounded-2xl p-4 text-left text-sm font-medium transition-all ${
                          isSelected
                            ? "bg-primary text-primary-foreground ring-2 ring-primary"
                            : "glass hover:bg-secondary text-foreground"
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="flex justify-end pt-4">
              <button
                onClick={handleSubmit}
                disabled={Object.keys(answers).length < questions.length}
                className="flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-40 shadow-lg"
              >
                <Award className="size-5" /> Submit Quiz Answers
              </button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
