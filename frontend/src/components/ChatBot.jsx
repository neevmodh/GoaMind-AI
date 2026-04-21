import { useState, useEffect, useRef } from 'react';
import { sendChatMessage, getChatSuggestions } from '../api/client';
import { MessageCircle, X, Send, MoreHorizontal } from 'lucide-react';

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [convId, setConvId] = useState(null);
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && suggestions.length === 0 && messages.length === 0) {
      getChatSuggestions().then(res => setSuggestions(res)).catch(console.error);
      setMessages([{ role: 'assistant', content: "Hi! I am GoaMind, your AI assistant. How can I help you explore Goa today?" }]);
    }
  }, [isOpen, suggestions.length, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (text) => {
    if (!text.trim()) return;
    const userMsg = { role: 'user', content: text };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setLoading(true);
    setSuggestions([]); // hide suggestions once actively chatting

    try {
      const res = await sendChatMessage({
        message: text,
        conversation_id: convId,
        history: messages.map(m => ({ role: m.role, content: m.content }))
      });
      setConvId(res.conversation_id);
      setMessages(prev => [...prev, { role: 'assistant', content: res.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Oops! I had trouble connecting to my AI brain. Please try again!" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Entry Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-r from-goa-blue to-goa-teal shadow-[0_10px_30px_rgba(20,184,166,0.3)] flex items-center justify-center text-white transition-all duration-300 z-[60] ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100 hover:scale-110 active:scale-95'}`}
      >
        <MessageCircle size={32} />
      </button>

      {/* Main Chat Panel View */}
      <div className={`fixed bottom-6 right-6 w-full max-w-[380px] h-[520px] max-h-[85vh] bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl flex flex-col overflow-hidden z-[60] transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}>
        
        {/* Header Block */}
        <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center shrink-0 shadow-sm relative z-10">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-gradient-to-br from-goa-blue to-goa-teal flex items-center justify-center text-xl shadow-inner border border-white/10">🌴</div>
             <div>
               <h3 className="font-extrabold text-slate-100 tracking-tight leading-tight">GoaMind AI</h3>
               <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span><span className="text-xs font-bold text-slate-400 tracking-wider uppercase">Online</span></div>
             </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white hover:bg-slate-700 p-2 rounded-full transition-colors active:scale-95">
            <X size={20} />
          </button>
        </div>

        {/* Messaging Timeline rendering */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/80 relative custom-scrollbar">
          {messages.map((m, i) => (
            <div key={i} className={`flex w-full ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl p-3.5 text-[15px] leading-relaxed shadow-sm whitespace-pre-wrap ${m.role === 'user' ? 'bg-gradient-to-r from-goa-blue to-goa-teal text-white rounded-tr-sm' : 'bg-slate-800 text-slate-200 border border-slate-700/50 rounded-tl-sm'}`}>
                {m.content}
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex w-full justify-start animate-fade-in">
              <div className="bg-slate-800 p-3.5 rounded-2xl rounded-tl-sm border border-slate-700/50 text-slate-400 flex items-center justify-center shadow-sm h-[48px] w-[60px]">
                <MoreHorizontal size={24} className="animate-pulse text-goa-teal" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} className="h-1" />
        </div>

        {/* Suggestions Quick-chips */}
        {suggestions.length > 0 && messages.length <= 2 && (
          <div className="flex overflow-x-auto gap-2 px-4 py-3 bg-slate-900 border-t border-slate-800 shrink-0 custom-scrollbar animate-slide-up">
            {suggestions.map((sug, i) => (
              <button key={i} onClick={() => handleSend(sug)} className="whitespace-nowrap px-3.5 py-1.5 text-xs font-bold text-goa-teal bg-goa-teal/10 hover:bg-goa-teal/20 border border-goa-teal/20 rounded-full transition-colors active:scale-95">
                {sug}
              </button>
            ))}
          </div>
        )}

        {/* Input Interface */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 shrink-0 relative z-10 shadow-[0_-10px_20px_rgba(0,0,0,0.2)]">
          <div className="relative flex items-center">
             <input 
               type="text" 
               value={input}
               onChange={(e) => setInput(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
               placeholder="Ask anything about Goa..." 
               className="w-full bg-slate-800 text-slate-200 border border-slate-700 rounded-full pl-5 pr-12 py-3.5 text-sm font-medium focus:outline-none focus:border-goa-teal focus:ring-1 focus:ring-goa-teal transition-all placeholder:text-slate-500 shadow-inner"
             />
             <button 
               onClick={() => handleSend(input)} 
               disabled={!input.trim() || loading}
               className="absolute right-1.5 w-10 h-10 flex items-center justify-center bg-gradient-to-br from-goa-teal to-goa-blue hover:opacity-90 text-white rounded-full transition-all disabled:opacity-50 disabled:grayscale active:scale-95"
             >
               <Send size={18} className="-ml-0.5" />
             </button>
          </div>
        </div>
      </div>
    </>
  );
}
