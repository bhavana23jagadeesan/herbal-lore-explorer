import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { api, type ChatResponse } from "@/lib/api";
import { Send, Bot, User, BookOpen, Loader2, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
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
      text: "Hello! I am your IEEE MPI Medicinal Plant AI Assistant powered by Nemotron-3 Ultra. You can type or tap the microphone to speak your question about medicinal plants, Siddha formulations, or active constituents.",
      sources: ["IEEE MPI Dataset"],
      timestamp: new Date(),
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

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
      recognition.lang = "en-US";

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
  }, []);

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
    // Clean raw asterisks for speech
    const cleanText = text.replace(/\*\*/g, "").replace(/\*/g, "");
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
      const res: ChatResponse = await api.sendChat(userText);
      const cleanSources = (res.sources || []).filter(
        (s) => s && !s.includes("அப்") && !s.includes("அவு") && !s.includes("அகா")
      );

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: res.answer,
        sources: cleanSources.length > 0 ? cleanSources : ["IEEE MPI Dataset"],
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: "I encountered an issue processing your query against the IEEE MPI dataset. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    "What are the use cases of Aloe Vera?",
    "Which plants in Karnataka treat fever and cold?",
    "What are the active constituents of Ocimum tenuiflorum (Tulsi)?",
    "How is Neem used in Siddha medicine for skin disorders?",
  ];

  return (
    <AppShell>
      <PageHeader
        eyebrow="Grounded LLM & Voice Intelligence"
        title="IEEE MPI AI Voice Assistant"
        subtitle="Conversational assistant with Voice Recognition (Speech-to-Text) and Text-to-Speech audio readout powered by Nemotron-3 Ultra."
      />

      <div className="mx-auto max-w-4xl glass rounded-3xl p-4 sm:p-6 flex flex-col h-[650px]">
        {/* Messages Container */}
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
                className={`relative max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-primary text-primary-foreground rounded-br-none"
                    : "glass border border-border/60 rounded-bl-none text-foreground"
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1">
                    {msg.sender === "ai" ? (
                      <FormattedText content={msg.text} />
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    )}
                  </div>
                  {msg.sender === "ai" && (
                    <button
                      onClick={() => handleSpeakText(msg.id, msg.text)}
                      className={`p-1.5 rounded-full transition-colors shrink-0 ${
                        speakingId === msg.id
                          ? "bg-primary text-primary-foreground animate-pulse"
                          : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                      }`}
                      title={speakingId === msg.id ? "Stop Reading" : "Listen to Response"}
                    >
                      {speakingId === msg.id ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
                    </button>
                  )}
                </div>

                {/* Sources list */}
                {msg.sources && msg.sources.length > 0 && (
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
                <span>Searching MPI dataset & querying Nemotron-3 Ultra...</span>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Listening Status Banner */}
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
              <span className="font-semibold">Listening to your voice... Speak your question now.</span>
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

        {/* Input Form with Voice Button */}
        <form onSubmit={handleSend} className="mt-2 flex items-center gap-2 pt-2 border-t border-border/60">
          <button
            type="button"
            onClick={toggleListening}
            className={`grid size-11 shrink-0 place-items-center rounded-2xl transition-all ${
              isListening
                ? "bg-rose-500 text-white animate-pulse shadow-lg"
                : "glass hover:bg-secondary text-muted-foreground hover:text-foreground"
            }`}
            title={isListening ? "Stop Voice Input" : "Start Voice Input"}
          >
            {isListening ? <MicOff className="size-5" /> : <Mic className="size-5" />}
          </button>

          <input
            type="text"
            placeholder={isListening ? "Listening... Speak now..." : "Type or speak your question..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 rounded-2xl bg-secondary/60 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground transition-all hover:opacity-90 disabled:opacity-40"
          >
            <Send className="size-5" />
          </button>
        </form>
      </div>
    </AppShell>
  );
}
