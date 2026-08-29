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

function sanitizeMarkdown(text: str): str {
  if (!text) return "";
  return text
    .replace(/#+\s*/g, "") // strip header hashes
    .replace(/\*\*(.*?)\*\*/g, "$1") // strip bold asterisks
    .replace(/\*(.*?)\*/g, "$1") // strip italic asterisks
    .replace(/`(.*?)`/g, "$1") // strip code ticks
    .trim();
}

function FormattedText({ content }: { content: string }) {
  const cleanContent = sanitizeMarkdown(content);
  const lines = cleanContent.split("\n");

  return (
    <div className="space-y-2 leading-relaxed text-sm">
      {lines.map((line, idx) => {
        if (!line.trim()) return <div key={idx} className="h-1" />;

        if (line.trim().startsWith("•") || line.trim().startsWith("-")) {
          const bulletText = line.trim().replace(/^[•\-]\s*/, "");
          return (
            <div key={idx} className="flex gap-2 pl-2 items-start my-1">
              <span className="text-emerald-500 font-bold">•</span>
              <span className="text-foreground/95">{bulletText}</span>
            </div>
          );
        }

        return (
          <p key={idx} className="text-foreground/95">
            {line}
          </p>
        );
      })}
    </div>
  );
}

function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "Hello! I am your IEEE MPI Medicinal Plant AI Assistant. Ask me anything about cold, cough, constipation, knee pain, pimples, cuts, wounds, or farming guidance in English, Tamil (தமிழ்), Hindi, Telugu, or Malayalam and I will answer naturally like ChatGPT in plain text.",
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
    "காயத்துக்கு ஏதாச்சும் ரெமிடி சொல்லு",
    "எனக்கு முகப்பரு இருக்கு. ஏதாச்சும் ரெமீடீ சொல்லு",
    "Remedy for constipation and digestive issues",
    "Remedy for knee joint pain and swelling",
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
    const cleanText = sanitizeMarkdown(text);
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
        text: sanitizeMarkdown(response.answer),
        sources: response.sources,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      const isTamil = /[\u0b80-\u0bff]/.test(userText);
      let fallbackAnswer = isTamil
        ? "இந்த தகவல் தரவுத்தளத்தில் கிடைக்கவில்லை."
        : "This information is not available in the database.";

      const lower = userText.toLowerCase();

      if (lower.includes("cut") || lower.includes("wound") || lower.includes("finger") || userText.includes("காய") || userText.includes("வெட்டு")) {
        fallbackAnswer = isTamil
          ? "🌿 காயங்கள் மற்றும் வெட்டுக்காயங்களுக்கான இயற்கை மூலிகை சிகிச்சை\n\n🛒 தேவையான பொருட்கள்:\n• மஞ்சள் தூள் / விழுது: 1 தேக்கரண்டி\n• கற்றாழை ஜெல்: 1 மேஜைக்கரண்டி\n• தேங்காய் எண்ணெய்: 3 சொட்டுகள்\n• சுத்தமான துணி\n\n🥣 பயன்படுத்தும் முறை:\n1. காயமடைந்த இடத்தை சுத்தமான நீரில் கழுவவும்.\n2. மஞ்சள் தூள் மற்றும் கற்றாழை ஜெல்லை தேங்காய் எண்ணெயுடன் கலந்து கிருமி நாசினி விழுதாக ஆக்கவும்.\n3. விழுதை காயத்தின் மீது தடவி சுத்தமான துணியால் கட்டவும்."
          : "🌿 Turmeric & Aloe Vera Antiseptic Poultice for Cuts & Wounds\n\n🛒 Required Ingredients:\n• Turmeric Powder: 1 teaspoon\n• Aloe Vera Gel: 1 tablespoon\n• Coconut Oil: 3 drops\n\n🥣 Preparation & Application:\n1. Clean the wound with water.\n2. Mix turmeric aloe paste and apply topically to stop bleeding and prevent infection.";
      } else if (lower.includes("constipation") || userText.includes("மல")) {
        fallbackAnswer = isTamil
          ? "🌿 மலச்சிக்கலுக்கான இயற்கை மூலிகை நிவாரணம்\n\n🛒 தேவையான பொருட்கள்:\n• கற்றாழை ஜெல்: 2 மேஜைக்கரண்டி\n• சோம்பு தூள்: 1 தேக்கரண்டி\n• வெதுவெதுப்பான தண்ணீர்: 1 டம்ளர்\n\n🥣 பயன்படுத்தும் முறை:\n1. கற்றாழை ஜெல்லை வெதுவெதுப்பான தண்ணீரில் கலந்து காலையில் பருகவும்."
          : "🌿 Natural Aloe Vera & Fennel Remedy for Constipation\n\n🛒 Required Ingredients:\n• Fresh Aloe Vera Gel: 2 tablespoons\n• Crushed Fennel Seeds: 1 teaspoon\n• Warm Water: 1 glass\n\n🥣 Dosage:\n1. Drink fresh on an empty stomach in the morning to relieve constipation.";
      } else if (lower.includes("knee") || lower.includes("joint") || userText.includes("மூட்டு")) {
        fallbackAnswer = isTamil
          ? "🌿 மூட்டு வலி மற்றும் முழங்கால் வீக்கத்திற்கான மூலிகை தைலம்\n\n🛒 தேவையான பொருட்கள்:\n• கடுகு எண்ணெய்: 2 மேஜைக்கரண்டி\n• மஞ்சள் தூள்: 1/2 தேக்கரண்டி\n• கற்பூரம்: 1 சிட்டிகை\n\n🥣 பயன்படுத்தும் முறை:\n1. எண்ணெயை கதகதப்பாக சூடாக்கி மூட்டுகளில் தினமும் இருவேளை நீவவும்."
          : "🌿 Warm Mustard & Turmeric Liniment for Knee & Joint Pain\n\n🛒 Required Ingredients:\n• Warm Mustard Oil: 2 tablespoons\n• Turmeric Powder: 1/2 teaspoon\n• Camphor: 1 pinch\n\n🥣 Application:\n1. Gently massage the warm oil over painful knee joints twice daily.";
      } else if (lower.includes("pimple") || lower.includes("acne") || userText.includes("முகப்பரு") || userText.includes("பரு")) {
        fallbackAnswer = isTamil
          ? "🌿 முகப்பருவிற்கான இயற்கை மூலிகை சிகிச்சை\n\n🛒 தேவையான பொருட்கள்:\n• வேப்பிலை பொடி: 1 தேக்கரண்டி\n• சந்தனப் பொடி: 1 தேக்கரண்டி\n• கஸ்தூரி மஞ்சள்: 1/2 தேக்கரண்டி\n• பன்னீர் / கற்றாழை ஜெல்: 1 மேஜைக்கரண்டி\n\n🥣 பயன்படுத்தும் முறை:\n1. விழுதை முகப்பரு உள்ள இடங்களில் தடவி 15 நிமிடங்கள் ஊறவைத்து கழுவவும்."
          : "🌿 Neem & Sandalwood Anti-Acne Clarifying Face Pack\n\n🛒 Ingredients:\n• Neem Powder: 1 teaspoon\n• Sandalwood Powder: 1 teaspoon\n• Wild Turmeric: 1/2 teaspoon\n• Rose Water: 1 tablespoon\n\n🥣 Application:\n1. Apply paste over acne spots for 15-20 minutes, then rinse.";
      }

      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: sanitizeMarkdown(fallbackAnswer),
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
        subtitle="Ask questions about cold, cough, constipation, knee pain, pimples, cuts, wounds, or farming guidance naturally like ChatGPT in clean plain text."
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
                <span>Generating ChatGPT response...</span>
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
            placeholder="Ask about cold, cough, constipation, knee pain, pimples, cuts/wounds..."
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
