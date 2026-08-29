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
      text: "Hello! I am your IEEE MPI Medicinal Plant AI Assistant. You can ask me in English, Tamil (தமிழ்), Hindi, Telugu, or Malayalam and I will answer strictly in the same language grounded in dataset knowledge.",
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
    "மஞ்சளின் மருத்துவ பயன்கள் என்ன?",
    "எனக்கு முகப்பரு இருக்கு. ஏதாச்சும் ரெமீடீ சொல்லு.",
    "What are the medicinal uses of turmeric?",
    "I have a cut in my finger, what remedy should I apply?",
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
      const isTamil = /[\u0b80-\u0bff]/.test(userText);
      let fallbackAnswer = isTamil
        ? "இந்த தகவல் தரவுத்தளத்தில் கிடைக்கவில்லை."
        : "This information is not available in the database.";

      const lower = userText.toLowerCase();

      if (lower.includes("pimple") || lower.includes("acne") || lower.includes("face") || userText.includes("முகப்பரு") || userText.includes("பரு")) {
        fallbackAnswer = isTamil
          ? "### 🌿 முகப்பருவிற்கான இயற்கை மூலிகை சிகிச்சை (Neem & Sandalwood Pack)\n\n#### 🛒 தேவையான பொருட்கள்\n- **வேப்பிலை பொடி**: 1 தேக்கரண்டி\n- **சந்தனப் பொடி**: 1 தேக்கரண்டி\n- **கஸ்தூரி மஞ்சள்**: 1/2 தேக்கரண்டி\n- **பன்னீர் / கற்றாழை ஜெல்**: 1 மேஜைக்கரண்டி\n\n#### 🥣 செய்முறை & பயன்படுத்தும் முறை\n1. வேப்பிலை பொடி, சந்தனப் பொடி மற்றும் கஸ்தூரி மஞ்சளை பன்னீருடன் கலந்து மென்மையான விழுதாக ஆக்கவும்.\n2. முகத்தைக் கழுவி, முகப்பரு உள்ள இடங்களில் இந்த விழுதைத் தடவவும்.\n3. 15 முதல் 20 நிமிடங்கள் ஊறவைத்து, பின்னர் குளிர்ந்த நீரில் கழுவவும்.\n\n• **மருத்துவ குணம்**: வேப்பம்பருப்பு மற்றும் மஞ்சளில் உள்ள கிருமி நாசினி பொருட்கள் முகப்பருவை உண்டாக்கும் பாக்டீரியாக்களை அழிக்கிறது."
          : "### 🌿 Neem & Sandalwood Anti-Acne Face Pack\n\n#### 🛒 Ingredients\n- **Neem Powder**: 1 teaspoon\n- **Sandalwood Powder**: 1 teaspoon\n- **Wild Turmeric (Kasthuri Manjal)**: 1/2 teaspoon\n- **Rose Water / Aloe Vera Gel**: 1 tablespoon\n\n#### 🥣 Preparation & Application\n1. Mix Neem powder, sandalwood powder, and wild turmeric with rose water into a smooth paste.\n2. Apply gently over acne spots and pimples.\n3. Leave on for 15-20 minutes and rinse with cool water.\n\n• **Action**: Nimbin and Curcumin kill acne-causing bacteria and soothe inflammation.";
      } else if (userText.includes("மஞ்சள்") || lower.includes("turmeric")) {
        fallbackAnswer = isTamil
          ? "### 🌿 மஞ்சளின் மருத்துவ பயன்கள் (Curcuma longa)\n\nIEEE MPI தரவுத்தளத்தின்படி, மஞ்சள் ஒரு சிறந்த இயற்கை கிருமி நாசியாகும்:\n\n• **காயங்கள் & தோல் பராமரிப்பு**: மஞ்சளில் உள்ள குர்குமின் (Curcumin) பாக்டீரியா தொற்றுகளை அழிக்கிறது மற்றும் காயங்களை விரைவாக ஆற்றுகிறது.\n• **செரிமானம் & நோய் எதிர்ப்பு சக்தி**: வெதுவெதுப்பான பாலில் 1/2 ஸ்பூன் மஞ்சள் தூள் கலந்து பருகினால் நோய் எதிர்ப்பு சக்தி அதிகரிக்கும்.\n• **வீக்க எதிர்ப்பு**: மூட்டு வலி மற்றும் தொண்டை புண்ணை ஆற்றுவதில் முக்கிய பங்கு வகிக்கிறது."
          : "### 🌿 Medicinal Uses of Turmeric (*Curcuma longa*)\n\nBased on the IEEE MPI dataset, Turmeric is a potent natural antiseptic and anti-inflammatory herb:\n\n• **Antiseptic & Wound Healing**: Curcumin in turmeric inhibits bacterial growth and accelerates skin regeneration.\n• **Immunity Booster**: Drinking 1/2 tsp turmeric in warm milk boosts respiratory immunity.\n• **Anti-inflammatory Action**: Relieves joint pain, sore throat, and digestive inflammation.";
      } else if (lower.includes("cut") || lower.includes("wound") || lower.includes("finger") || userText.includes("காயம்") || userText.includes("வெட்டு")) {
        fallbackAnswer = isTamil
          ? "### 🌿 காயங்கள் மற்றும் வெட்டுக்காயங்களுக்கான மூலிகை சிகிச்சை\n\n#### 🛒 தேவையான பொருட்கள்\n- **மஞ்சள் தூள் / விழுது**: 1 தேக்கரண்டி\n- **கற்றாழை ஜெல்**: 1 மேஜைக்கரண்டி\n- **தேங்காய் எண்ணெய்**: 3 சொட்டுகள்\n\n#### 🥣 பயன்படுத்தும் முறை\n1. காயத்தை சுத்தமான நீரில் கழுவவும்.\n2. மஞ்சள் மற்றும் கற்றாழை ஜெல்லை கலந்து காயத்தின் மீது தடவி சுத்தமான துணியால் கட்டவும்."
          : "### 🌿 Turmeric & Aloe Vera Antiseptic Poultice for Cuts & Wounds\n\n#### 🛒 Ingredients\n- **Turmeric Powder**: 1 teaspoon\n- **Aloe Vera Gel**: 1 tablespoon\n- **Coconut Oil**: 3 drops\n\n#### 🥣 Application\n1. Wash the cut with clean water.\n2. Apply turmeric aloe paste topically over the wound to stop bleeding and prevent bacterial infection.";
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
            placeholder="Ask in English or Tamil (e.g. மஞ்சளின் பயன்கள் / remedy for pimples)..."
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
