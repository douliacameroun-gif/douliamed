'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Volume2, User, Bot, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export default function ChatInterface() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      utterance.rate = 0.95; // Slightly slower for academic clarity
      window.speechSynthesis.speak(utterance);
    } else {
      alert("La synthèse vocale n'est pas supportée par votre navigateur.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: messages.map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
          }))
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch response');

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'model', text: data.text }]);
      
      // Auto-save to Supabase (logic placeholder as requested)
      // await saveMessageToSupabase(userMessage, data.text);
      
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'model', text: "Désolé Docteur, une erreur technique est survenue. Veuillez réessayer." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto w-full px-4 lg:px-8">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto py-24 space-y-8 scroll-smooth">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-50">
            <div className="w-20 h-20 rounded-3xl bg-accent/10 flex items-center justify-center">
              <Bot className="w-10 h-10 text-accent" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Bienvenue, Docteur Eposse</h2>
              <p className="text-text-secondary max-w-md">
                Je suis DouliaMed. Comment puis-je vous assister dans vos recherches ou votre préparation aujourd&apos;hui ?
              </p>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'model' && (
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center flex-shrink-0 shadow-lg shadow-accent/20">
                <Bot className="w-6 h-6 text-white" />
              </div>
            )}
            
            <div className={`group relative max-w-[85%] lg:max-w-[75%] p-5 rounded-2xl shadow-sm ${
              msg.role === 'user' 
                ? 'bg-accent text-white rounded-tr-none' 
                : 'bg-panel text-white border border-white/5 rounded-tl-none'
            }`}>
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>

              {msg.role === 'model' && (
                <button 
                  onClick={() => handleSpeak(msg.text)}
                  className="absolute -right-12 top-0 p-2 text-text-secondary hover:text-accent transition-colors opacity-0 group-hover:opacity-100"
                  title="Écouter la réponse"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-10 h-10 rounded-xl bg-panel border border-white/5 flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 text-text-secondary" />
              </div>
            )}
          </motion.div>
        ))}
        
        {isLoading && (
          <div className="flex gap-4 justify-start">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
            <div className="bg-panel border border-white/5 p-5 rounded-2xl rounded-tl-none">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 bg-accent rounded-full animate-bounce"></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="pb-8 pt-4 bg-background">
        <form 
          onSubmit={handleSubmit}
          className="relative group"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Posez votre question médicale ou académique..."
            className="w-full bg-panel border border-white/10 text-white rounded-2xl px-6 py-5 pr-16 focus:outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent/5 transition-all shadow-2xl"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:hover:bg-accent text-white rounded-xl transition-all shadow-lg shadow-accent/20"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
        <p className="text-center text-[10px] text-text-secondary mt-4 uppercase tracking-widest opacity-50">
          DouliaMed — Partenaire d&apos;Excellence Académique
        </p>
      </div>
    </div>
  );
}
