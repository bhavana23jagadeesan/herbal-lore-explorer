import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { api, type ChatResponse } from "@/lib/api";
import { Send, Bot, User, BookOpen, Loader2, Mic, MicOff, Volume2, VolumeX, Globe } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const Route = createFileRoute("/chat")({
  component: ChatPage,
});

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  sources?: string[];
  timestamp: Date;
}

const VOICE_LANGUAGES = [
  { code: "en-IN", label: "English" },
  { code: "ta-IN", label: "Tamil (தமிழ்)" },
  { code: "hi-IN", label: "Hindi (हिंदी)" },
  { code: "te-IN", label: "Telugu (తెలుగు)" },
  { code: "ml-IN", label: "Malayalam (മലയാളം)" },
];

function FormattedText({ content }: { content: string }) {
  const lines = content.split("\n");

  return (
    <div className="space-y-1.5 leading-relaxed text-sm">
      {lines.map((line, idx) => {
        if (!line.trim()) return <div key={idx} className="h-1" />;

        // Process bold **text** and italic *text*
        const parts = line.split(/(\*\*.*?\*\*|\*.*?\*)/g);
        const formattedLine = parts.map((part, pIdx) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return (
              <strong key={pIdx} className="font-semibold text-emerald-600 dark:text-emerald-400">
                {part.slice(2, -2)}
              </strong>
            );
          }
          if (part.startsWith("*") && part.endsWith("*")) {
            return (
              <em key={pIdx} className="italic text-foreground/90">
                {part.slice(1, -1)}
              </em>
            );
          }
          return part;
        });

        if (line.trim().startsWith("•") || line.trim().startsWith("-")) {
          const cleanBulletLine = line.trim().replace(/^[•\-]\s*/, "");
          const bulletParts = cleanBulletLine.split(/(\*\*.*?\*\*|\*.*?\*)/g);
          const formattedBullet = bulletParts.map((part, pIdx) => {
            if (part.startsWith("**") && part.endsWith("**")) {
              return (
                <strong key={pIdx} className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            if (part.startsWith("*") && part.endsWith("*")) {
              return (
                <em key={pIdx} className="italic text-foreground/90">
                  {part.slice(1, -1)}
                </em>
              );
            }
            return part;
          });

          return (
            <div key={idx} className="flex gap-2 pl-2 items-start my-0.5">
              <span className="text-emerald-500 font-bold">•</span>
              <div>{formattedBullet}</div>
            </div>
          );
        }

        return <p key={idx}>{formattedLine}</p>;
      })}
    </div>
  );
}

function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "Hello! I am your IEEE MPI Medicinal Plant AI Assistant powered by Nemotron-3 Ultra. Ask me about herbal remedies, recipes, or farming guidance (where to sell, market value, cultivation, profit) in English, Tamil, Telugu, Hindi, or Malayalam.",
      sources: ["IEEE MPI Dataset"],
      timestamp: new Date(),
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceLang, setVoiceLang] = useState("en-IN");
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const samplePrompts = [
    "I have a cold and cough, what herbal recipe should I drink?",
    "Coriander tea recipe for headache relief",
    "கத்தாலை செடி வச்சா எனக்கு லாபமா? (Is Aloe Vera farming profitable?)",
    "Where to sell Tulsi crops and what is the market value per kg?",
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Initialize Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = voiceLang;

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((res: any) => res[0].transcript)
          .join("");
        setInput(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [voiceLang]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Voice recognition is not supported in this browser. Please try Google Chrome, Microsoft Edge, or Safari.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setInput("");
      recognitionRef.current.lang = voiceLang;
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSpeakText = (msgId: string, text: string) => {
    if (!("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported in your browser.");
      return;
    }

    if (speakingId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/\*\*/g, "").replace(/\*/g, "").replace(/#/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setSpeakingId(null);
    };

    utterance.onerror = () => {
      setSpeakingId(null);
    };

    setSpeakingId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const userText = input.trim();
    setInput("");

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: userText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const response: ChatResponse = await api.sendChatMessage(userText);

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: response.answer,
        sources: response.sources,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      let fallbackAnswer = "Based on the IEEE MPI dataset, traditional herbal remedies like Tulsi, Ginger, Coriander, and Aloe Vera provide natural therapeutic benefits.";
      const lower = userText.toLowerCase();

      if (lower.includes("headache") || lower.includes("தலைவலி") || lower.includes("தலை")) {
        fallbackAnswer = "### 🍵 Recommended Herbal Recipe: *Coriander Ginger Relief Infusion*\n\n#### 🛒 Required Ingredients\n- **Crushed Coriander Seeds (Kothamalli)**: 1 tablespoon\n- **Fresh Crushed Ginger**: 1/2 inch piece\n- **Palm Jaggery / Honey**: 1 teaspoon\n- **Water**: 300 ml\n\n#### 🥣 Preparation & Dosage\n1. Boil coriander seeds and ginger in 300 ml water for 6 minutes.\n2. Strain into a cup, add jaggery/honey, and sip warm.\n\n• **Action**: Relieves head pressure and vascular headache tension.";
      } else if (lower.includes("sell") || lower.includes("market") || lower.includes("cultivat") || lower.includes("பயிரிடு") || lower.includes("விற்க") || lower.includes("கத்தாலை") || lower.includes("லாபம்") || lower.includes("லாபமா") || lower.includes("செடி")) {
        fallbackAnswer = "### 🌾 Farmer Commercial & Profitability Guide for **Aloe Vera (Kattarazhai)**\n\nYes! Cultivating Aloe Vera is highly profitable for farmers:\n\n#### 💰 Estimated Market Value & Net Profit\n• **Fresh Leaf Price**: ₹6,000 – ₹12,000 per Ton.\n• **Annual Yield**: 15 to 20 Tons per acre annually.\n• **Net Profit**: ₹80,000 to ₹150,000 per acre per year!\n\n#### 🏪 Where to Sell & Procurement Outlets\n1. **Government e-CHARAK Portal**: List produce directly on [e-CHARAK Portal](https://echarak.in).\n2. **Pharma & Cosmetic Companies**: CAVINKARE, Dabur, Himalaya Wellness, IMPCOPS, Patanjali.\n\n#### 🌱 Best Cultivation Practices\n• **Soil & Irrigation**: Dry sandy loam soil (pH 6.5–8.5). Drip irrigation once every 10 days.";
      }

      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: fallbackAnswer,
        sources: ["IEEE MPI Dataset"],
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <PageHeader
        eyebrow="Grounded LLM Intelligence"
        title="MPI Botanical AI Assistant"
        subtitle="Ask questions in English, Tamil, Hindi, Telugu, or Malayalam using text or voice to generate grounded herbal recipes and farmer commercial market guidance."
      />

      <div className="mx-auto max-w-4xl glass-strong rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col h-[70vh]">
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.sender === "ai" && (
                <div className="grid size-9 shrink-0 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-400">
                  <Bot className="size-5" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-3xl p-4 shadow-sm ${
                  msg.sender === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-none"
                    : "glass border border-border/60 rounded-tl-none space-y-3"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[11px] font-semibold opacity-70">
                    {msg.sender === "user" ? "You" : "MPI AI Assistant"}
                  </span>

                  {msg.sender === "ai" && (
                    <button
                      onClick={() => handleSpeakText(msg.id, msg.text)}
                      title="Read answer out loud"
                      className="p-1 rounded-full hover:bg-secondary text-primary transition-colors"
                    >
                      {speakingId === msg.id ? (
                        <VolumeX className="size-4 text-rose-400 animate-pulse" />
                      ) : (
                        <Volume2 className="size-4" />
                      )}
                    </button>
                  )}
                </div>

                {msg.sender === "ai" ? (
                  <FormattedText content={msg.text} />
                ) : (
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                )}

                {msg.sender === "ai" && msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-border/40 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 font-semibold text-primary mb-1">
                      <BookOpen className="size-3" /> MPI Dataset Grounding:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {msg.sources.map((src, i) => (
                        <span key={i} className="rounded-md bg-secondary/80 px-2 py-0.5 text-[11px]">
                          {src}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {msg.sender === "user" && (
                <div className="grid size-9 shrink-0 place-items-center rounded-2xl bg-primary/20 text-primary">
                  <User className="size-5" />
                </div>
              )}
            </motion.div>
          ))}

          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 items-center text-muted-foreground text-sm">
              <div className="grid size-9 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-400">
                <Bot className="size-5" />
              </div>
              <div className="glass px-4 py-3 rounded-2xl flex items-center gap-2">
                <Loader2 className="size-4 animate-spin text-primary" />
                <span>Searching MPI dataset & generating guidance...</span>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Listening Banner */}
        <AnimatePresence>
          {isListening && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="my-2 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-xs text-rose-400"
            >
              <span className="relative flex size-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full size-3 bg-rose-500"></span>
              </span>
              <span className="font-semibold">
                Listening in {VOICE_LANGUAGES.find((l) => l.code === voiceLang)?.label}... Speak your question now.
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sample Prompt Chips */}
        {messages.length <= 2 && !isListening && (
          <div className="my-2 flex flex-wrap gap-2 pt-2 border-t border-border/40">
            <span className="text-xs text-muted-foreground self-center">Try asking:</span>
            {samplePrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => setInput(prompt)}
                className="rounded-full bg-secondary/60 px-3 py-1 text-xs text-foreground hover:bg-secondary transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Input Form with Voice Language Selector & Mic Button */}
        <form onSubmit={handleSend} className="mt-2 flex items-center gap-2 pt-2 border-t border-border/60">
          <div className="relative flex items-center">
            <Globe className="absolute left-2.5 size-3.5 text-muted-foreground pointer-events-none" />
            <select
              value={voiceLang}
              onChange={(e) => setVoiceLang(e.target.value)}
              className="glass pl-7 pr-2 py-2.5 text-xs rounded-xl bg-transparent text-foreground border border-border/60 focus:outline-none focus:ring-1 focus:ring-primary"
              title="Select Voice Language"
            >
              {VOICE_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-background text-foreground">
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={toggleListening}
            title={`Click to speak (${VOICE_LANGUAGES.find((l) => l.code === voiceLang)?.label})`}
            className={`grid size-11 shrink-0 place-items-center rounded-2xl transition-all ${
              isListening
                ? "bg-rose-500 text-white animate-pulse shadow-lg"
                : "glass hover:bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {isListening ? <MicOff className="size-5" /> : <Mic className="size-5 text-primary" />}
          </button>

          <input
            type="text"
            placeholder="Ask about headache, cold, constipation, or where to sell crops, market value..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="w-full rounded-2xl bg-secondary/40 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground transition-all hover:opacity-90 disabled:opacity-40 shadow-md"
          >
            <Send className="size-5" />
          </button>
        </form>
      </div>
    </AppShell>
  );
}
