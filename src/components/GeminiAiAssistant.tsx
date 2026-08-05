import React, { useState } from 'react';
import { X, Sparkles, Send, Bot, User, Loader2 } from 'lucide-react';
import { Product } from '../types';

interface GeminiAiAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  catalog: Product[];
  onSelectProduct: (product: Product) => void;
}

interface Message {
  sender: 'ai' | 'user';
  text: string;
}

export const GeminiAiAssistant: React.FC<GeminiAiAssistantProps> = ({
  isOpen,
  onClose,
  catalog,
  onSelectProduct,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: 'Hello! I am your Nexovira AI Smart Appliance Advisor. Looking for an inverter AC that runs on a small generator, or the perfect refrigerator for your kitchen? Ask me anything!',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSendQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim() || loading) return;

    const query = inputQuery.trim();
    setInputQuery('');
    setMessages((prev) => [...prev, { sender: 'user', text: query }]);
    setLoading(true);

    try {
      const res = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userQuery: query,
          currentCatalog: catalog,
        }),
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: data.recommendation || 'Here are our top recommended appliances based on your inquiry.',
        },
      ]);
    } catch (err) {
      console.error('AI error:', err);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'Our AI service is experiencing high traffic. For instant assistance, reach us on WhatsApp at 08129595134 or 07025900156!',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full h-[600px] shadow-2xl flex flex-col overflow-hidden text-slate-900">
        {/* Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4 text-white fill-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm font-display">Nexovira AI Appliance Consultant</h3>
              <p className="text-[10px] text-cyan-600 font-bold">Powered by Gemini AI</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3 text-xs">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'ai' && (
                <div className="w-7 h-7 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0 border border-cyan-100">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`p-3 rounded-xl max-w-[80%] whitespace-pre-wrap leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-cyan-600 text-white font-medium'
                    : 'bg-slate-50 border border-slate-200 text-slate-800'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-blue-600 text-xs p-2 font-medium">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing catalog for the best match...</span>
            </div>
          )}
        </div>

        {/* Prompt Input */}
        <form onSubmit={handleSendQuery} className="p-3 bg-slate-50 border-t border-slate-200 flex gap-2">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="e.g. Best inverter AC for 1.5 kva generator in Lagos..."
            className="flex-1 bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
          />
          <button
            type="submit"
            disabled={loading || !inputQuery.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1 disabled:opacity-50 shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
