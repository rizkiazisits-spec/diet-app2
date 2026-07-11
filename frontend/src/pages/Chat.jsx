import { useState, useRef, useEffect } from 'react';
import { chat as apiChat } from '../api';
import { useAuth } from '../AuthContext';
import { ArrowLeft, MoreVertical, Camera, Send, BarChart2, Activity, Utensils, Dumbbell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Chat() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('chat_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  // Seed default conversation to match Image 2 if empty
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          role: 'user',
          text: 'Makan Nasi Padang porsi sedang pake rendang dan sayur nangka. Terus tadi pagi lari 30 menit.',
          time: '12:30 PM'
        },
        {
          role: 'ai',
          time: '12:31 PM',
          isAnalysis: true,
          analysisData: {
            totalIn: 850,
            totalOut: 320,
            deficit: -530,
            foods: [
              { name: 'Nasi Padang (Medium)', kalori: 650 },
              { name: 'Rendang Sapi', kalori: 200 }
            ],
            exercises: [
              { name: 'Lari Pagi (30m)', kalori: 320 }
            ],
            ringkasan: 'Bagus! Olahraga pagi membantu metabolisme Anda tetap tinggi setelah makan siang yang cukup berat.'
          }
        }
      ]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('chat_history', JSON.stringify(messages));
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const text = input.trim();
    setInput('');
    const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [...prev, { role: 'user', text, time: now }]);
    setLoading(true);
    try {
      const res = await apiChat(text);
      const data = res.data;

      // Check if response contains structured analysis
      const hasAnalysis = data.foods?.length > 0 || data.exercises?.length > 0;

      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          time: now,
          text: data.ringkasan || data.message || '',
          isAnalysis: hasAnalysis,
          analysisData: hasAnalysis ? {
            totalIn: data.total_kalori_masuk || 0,
            totalOut: data.total_kalori_keluar || 0,
            deficit: data.defisit_surplus || 0,
            foods: data.foods?.map((f) => ({ name: f.nama, kalori: f.kalori })) || [],
            exercises: data.exercises?.map((e) => ({ name: e.olahraga, kalori: e.kalori_terbakar })) || [],
            ringkasan: data.ringkasan || ''
          } : null
        }
      ]);
    } catch {
      setMessages((prev) => [...prev, { role: 'ai', text: 'Maaf, terjadi kesalahan saat menghubungi asisten AI.', time: now }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    if (window.confirm("Hapus semua riwayat obrolan chat?")) {
      setMessages([]);
      localStorage.removeItem('chat_history');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#f6faff] dark:bg-[#0a0a0a] overflow-hidden relative">
      {/* Top Header Bar */}
      <header className="flex items-center justify-between px-5 h-16 w-full sticky top-0 bg-[#f6faff] dark:bg-[#0a0a0a] border-b border-slate-100 dark:border-neutral-800 z-20 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-slate-600 dark:text-neutral-300 hover:opacity-80">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-base font-bold text-[#006591] dark:text-[#89ceff]">DietTracker AI</h1>
        </div>
        <button onClick={clearChat} className="text-slate-600 dark:text-neutral-300 hover:opacity-80" title="Clear Chat History">
          <MoreVertical className="w-5 h-5" />
        </button>
      </header>

      {/* Chat Messages Stream */}
      <main className="flex-1 overflow-y-auto hide-scrollbar p-4 flex flex-col gap-5 relative">
        {messages.map((m, i) => m.role === 'user' ? (
          /* User message bubble (matches blue bubble in Image 2) */
          <div key={i} className="flex justify-end">
            <div className="bg-[#0ea5e9] text-white p-4 rounded-2xl rounded-tr-sm shadow-md max-w-[85%]">
              <p className="text-sm leading-relaxed">{m.text}</p>
              <div className="text-right mt-1.5 opacity-80 flex items-center justify-end gap-1">
                <span className="text-[9px] font-semibold">{m.time}</span>
              </div>
            </div>
          </div>
        ) : (
          /* AI response (either structured analysis or plain text) */
          <div key={i} className="flex justify-start items-start gap-2.5">
            {m.isAnalysis ? (
              /* Custom bento-style analysis card (Image 2) */
              <div className="glass-card bg-[#f1f5f9] dark:bg-[#1e1e1e] p-5 w-full max-w-[90%] border border-slate-200/80 dark:border-neutral-800 rounded-2xl flex flex-col gap-4">
                {/* Analisis Harian Header */}
                <div className="flex items-center gap-2 text-slate-800 dark:text-neutral-200">
                  <BarChart2 className="w-5 h-5 text-[#006591] dark:text-[#89ceff]" />
                  <h3 className="text-sm font-bold">Analisis Harian</h3>
                </div>

                {/* Grid 3 column stats */}
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="bg-white dark:bg-[#2c2c2c] p-2.5 rounded-xl flex flex-col items-center justify-center border border-slate-100 dark:border-neutral-800">
                    <span className="text-[9px] font-bold text-slate-400 dark:text-neutral-500 uppercase">TOTAL IN</span>
                    <span className="text-xs font-extrabold text-slate-800 dark:text-neutral-200 mt-1">{m.analysisData.totalIn} kcal</span>
                  </div>
                  <div className="bg-white dark:bg-[#2c2c2c] p-2.5 rounded-xl flex flex-col items-center justify-center border border-slate-100 dark:border-neutral-800">
                    <span className="text-[9px] font-bold text-slate-400 dark:text-neutral-500 uppercase">TOTAL OUT</span>
                    <span className="text-xs font-extrabold text-slate-800 dark:text-neutral-200 mt-1">{m.analysisData.totalOut} kcal</span>
                  </div>
                  <div className="bg-[#ffeedd] dark:bg-[#de8712]/10 p-2.5 rounded-xl flex flex-col items-center justify-center border border-[#ffeedd] dark:border-[#de8712]/20">
                    <span className="text-[9px] font-bold text-[#de8712] uppercase">DEFICIT</span>
                    <span className="text-xs font-extrabold text-[#de8712] mt-1">{m.analysisData.deficit} kcal</span>
                  </div>
                </div>

                {/* List items split by Makanan / Olahraga */}
                <div className="space-y-4 pt-2 border-t border-slate-200/50 dark:border-neutral-800">
                  {/* Makanan Section */}
                  {m.analysisData.foods?.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-[#0ea5e9] uppercase tracking-wider block">Makanan (Kalori Masuk)</span>
                      <div className="flex flex-col gap-2">
                        {m.analysisData.foods.map((f, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-white dark:bg-[#2c2c2c] px-3 py-2 rounded-xl border border-slate-100 dark:border-neutral-800/30">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-sky-50 dark:bg-sky-950/20 flex items-center justify-center text-[#0ea5e9]">
                                <Utensils className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-xs font-bold text-slate-700 dark:text-neutral-300">{f.name}</span>
                            </div>
                            <span className="text-xs font-extrabold text-[#ef4444] font-mono">+{f.kalori} kal</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Olahraga Section */}
                  {m.analysisData.exercises?.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-[#de8712] uppercase tracking-wider block">Olahraga (Kalori Keluar)</span>
                      <div className="flex flex-col gap-2">
                        {m.analysisData.exercises.map((e, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-white dark:bg-[#2c2c2c] px-3 py-2 rounded-xl border border-slate-100 dark:border-neutral-800/30">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center text-[#de8712]">
                                <Dumbbell className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-xs font-bold text-slate-700 dark:text-neutral-300">{e.name}</span>
                            </div>
                            <span className="text-xs font-extrabold text-[#0ea5e9] font-mono">-{e.kalori} kal</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Commentary in Italics */}
                {m.analysisData.ringkasan && (
                  <p className="text-[11px] text-slate-500 dark:text-neutral-400 italic leading-relaxed pt-2 border-t border-slate-200/50 dark:border-neutral-800">
                    "{m.analysisData.ringkasan}"
                  </p>
                )}
                {/* Timestamp */}
                <div className="text-right text-[8px] text-slate-400">
                  {m.time}
                </div>
              </div>
            ) : (
              /* Normal text bubble */
              <div className="glass-card bg-white dark:bg-[#1e1e1e] p-4 rounded-2xl rounded-tl-sm border border-slate-200/80 dark:border-neutral-800 max-w-[80%]">
                <p className="text-sm leading-relaxed text-[var(--color-on-surface)] whitespace-pre-wrap">{m.text}</p>
                <div className="text-right mt-1.5 opacity-60">
                  <span className="text-[9px] font-semibold">{m.time}</span>
                </div>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex justify-start items-start gap-2.5">
            <div className="glass-card bg-white dark:bg-[#1e1e1e] px-4 py-2.5 rounded-2xl rounded-tl-sm border border-slate-200/80 dark:border-neutral-800 flex gap-1 items-center">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} className="h-6" />
      </main>

      {/* Bottom Input Form */}
      <form onSubmit={handleSend} className="p-4 shrink-0 z-20 pb-24 md:pb-6 relative bg-[#f6faff] dark:bg-[#0a0a0a]">
        <div className="flex items-center gap-3 bg-white dark:bg-[#1e1e1e] border border-slate-200 dark:border-neutral-800 rounded-full p-1.5 pl-4 transition-all shadow-md relative z-10 focus-within:border-[#0ea5e9]/50 focus-within:ring-2 focus-within:ring-[#0ea5e9]/10">
          <input
            className="flex-1 bg-transparent border-none text-sm text-[var(--color-on-surface)] placeholder:text-slate-400 focus:ring-0 focus:outline-none py-2 font-medium"
            placeholder="Tulis makanan & olahraga..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          {/* Camera Button */}
          <button type="button" className="w-10 h-10 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center transition-all cursor-pointer">
            <Camera className="w-5 h-5" />
          </button>
          {/* Send Button */}
          <button type="submit" disabled={loading}
            className="w-10 h-10 rounded-full bg-[#0ea5e9] text-white flex items-center justify-center flex-shrink-0 shadow-md hover:bg-[#0284c7] hover:scale-105 transition-all duration-200 active:scale-95 disabled:opacity-60 cursor-pointer">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
