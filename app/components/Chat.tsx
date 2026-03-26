'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Volume2, 
  Loader2, 
  User, 
  Bot, 
  Paperclip, 
  Mic,
  MicOff,
  Download,
  FileText,
  Search,
  History,
  CheckSquare,
  Calendar,
  BarChart3,
  Settings,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI } from "@google/genai";
import { supabase } from '@/lib/supabase';
// @ts-ignore
// import html2pdf from 'html2pdf.js'; // Removed top-level import to fix SSR error

const WELCOME_MESSAGE = "Bienvenue, Docteur Eposse. Je suis DouliaMed, votre partenaire d'intelligence médicale. Voici un résumé des capacités majeures que j'intègre actuellement pour votre période de recherche : 1. Intelligence Scientifique (Gemini 3.1 Pro) 2. Veille en Temps Réel 3. Analyse de votre Bibliographie 4. Interaction Vocale 5. Expertise en Biostatistiques. Je mets également à votre disposition : Un Générateur de Citations, Un Chronogramme et La Visualisation de Données. Comment pouvons-nous faire progresser la science médicale aujourd'hui ?";

const SYSTEM_INSTRUCTION = "Tu es DouliaMed, l'intelligence médicale exclusive du Docteur Charlotte Eposse. Toujours citer tes sources à la fin de tes réponses (ex: [Tavily: OMS 2024]). N'utilise jamais de balises markdown comme les astérisques (**) ou les dièses (#) pour que la synthèse vocale soit parfaite. Fais des sauts de ligne réguliers.";

export default function Chat() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Initialize Gemini
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY || "";
  const tavilyKey = (import.meta as any).env?.VITE_TAVILY_API_KEY || "";
  
  const ai = new GoogleGenAI({ apiKey });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Load messages from Supabase or start with welcome
    const loadMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (data && data.length > 0) {
        setMessages(data);
      } else {
        // Add welcome message if no history
        const welcome = {
          id: 'welcome',
          role: 'assistant',
          content: WELCOME_MESSAGE,
          created_at: new Date().toISOString()
        };
        setMessages([welcome]);
      }
    };
    loadMessages();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleExportPDF = async (messageId: string) => {
    const element = document.getElementById(`msg-${messageId}`);
    if (element) {
      // Dynamically import html2pdf only when needed on the client
      // @ts-ignore
      const html2pdf = (await import('html2pdf.js')).default;
      
      const opt = {
        margin: 1,
        filename: `DouliaMed_Response_${messageId}.pdf`,
        image: { type: 'jpeg', quality: 0.98 } as const,
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' } as const
      };
      html2pdf().set(opt).from(element).save();
    }
  };

  const startListening = () => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'fr-FR';
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + ' ' + transcript);
      };
      recognition.start();
    } else {
      alert("La reconnaissance vocale n'est pas supportée par votre navigateur.");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Logic for file upload would go here
      // For now, just notify
      alert(`Fichier "${file.name}" prêt pour l'analyse.`);
    }
  };

  const getSupabaseContext = async (query: string) => {
    try {
      // Search in documents table
      const { data, error } = await supabase
        .from('documents')
        .select('title, content, summary, abstract')
        .or(`title.ilike.%${query}%,content.ilike.%${query}%,summary.ilike.%${query}%,abstract.ilike.%${query}%`)
        .limit(3);
      
      if (error) throw error;
      return data?.map(d => `[Source: ${d.title}] ${d.summary || d.content || d.abstract}`).join('\n\n') || "";
    } catch (err) {
      console.error('Supabase context error:', err);
      return "";
    }
  };

  const getTavilyContext = async (query: string) => {
    if (!tavilyKey) return "";
    try {
      const response = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: tavilyKey,
          query: query,
          search_depth: "advanced",
          include_answer: true,
          max_results: 3
        })
      });
      const data = await response.json();
      return data.results?.map((r: any) => `[Web: ${r.title}] ${r.content}`).join('\n\n') || "";
    } catch (err) {
      console.error('Tavily search error:', err);
      return "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userText = input.trim();
    if (!userText || isGenerating) return;

    setInput('');
    setIsGenerating(true);

    const userMsg = { role: 'user', content: userText, created_at: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);

    // Save user message
    await supabase.from('messages').insert([userMsg]);

    try {
      // Hybrid Search
      const [supabaseCtx, tavilyCtx] = await Promise.all([
        getSupabaseContext(userText),
        getTavilyContext(userText)
      ]);

      const contextPrompt = `CONTEXTE DOCUMENTAIRE:\n${supabaseCtx}\n\nCONTEXTE WEB RÉCENT:\n${tavilyCtx}\n\nQUESTION DU DOCTEUR: ${userText}`;

      const chat = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
        },
        history: messages.map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }]
        }))
      });

      const result = await chat.sendMessage({ message: contextPrompt });
      const responseText = result.text;

      const assistantMsg = { 
        role: 'assistant', 
        content: responseText, 
        created_at: new Date().toISOString() 
      };
      
      setMessages(prev => [...prev, assistantMsg]);
      
      // Save assistant message
      await supabase.from('messages').insert([assistantMsg]);
    } catch (error) {
      console.error('Gemini error:', error);
      const errorMsg = { 
        role: 'assistant', 
        content: "Désolé Docteur, une erreur est survenue. Veuillez vérifier votre connexion ou votre clé API.", 
        created_at: new Date().toISOString() 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsGenerating(false);
    }
  };

  const clearChat = async () => {
    if (confirm("Voulez-vous vraiment effacer l'historique de cette session ?")) {
      await supabase.from('messages').delete().neq('id', '0');
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: WELCOME_MESSAGE,
        created_at: new Date().toISOString()
      }]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white font-sans">
      {/* Chat Header */}
      <div className="px-8 py-4 border-b border-gray-100 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div>
          <h2 className="text-lg font-black text-gray-900">Consultation IA</h2>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Session de Recherche Active</p>
        </div>
        <button 
          onClick={clearChat}
          className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
          title="Effacer la session"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => (
            <motion.div
              key={msg.id || idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-6 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                msg.role === 'user' ? 'bg-gray-100 text-gray-500' : 'bg-[#008080]/10 text-[#008080]'
              }`}>
                {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>
              
              <div className={`max-w-[75%] space-y-3 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                <div 
                  id={`msg-${msg.id || idx}`}
                  className={`p-5 rounded-2xl text-sm leading-relaxed shadow-sm border ${
                    msg.role === 'user' 
                      ? 'bg-gray-800 text-white border-gray-800 rounded-tr-none' 
                      : 'bg-white text-gray-800 border-gray-100 rounded-tl-none'
                  }`}
                >
                  {msg.content}
                </div>
                
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleSpeak(msg.content)}
                      className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#008080] bg-[#008080]/5 rounded-lg hover:bg-[#008080]/10 transition-all"
                    >
                      <Volume2 className="w-3.5 h-3.5" /> Écouter
                    </button>
                    <button 
                      onClick={() => handleExportPDF(msg.id || idx)}
                      className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all"
                    >
                      <Download className="w-3.5 h-3.5" /> PDF
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isGenerating && (
          <div className="flex gap-6">
            <div className="w-10 h-10 rounded-xl bg-[#008080]/10 flex items-center justify-center text-[#008080]">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
            <div className="bg-gray-50 p-5 rounded-2xl rounded-tl-none border border-gray-100">
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 bg-[#008080] rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-[#008080] rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-[#008080] rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Zone */}
      <div className="p-8 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="relative flex items-center gap-4 bg-slate-50 border border-gray-200 p-2 rounded-2xl shadow-inner focus-within:border-[#008080] transition-all">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              className="hidden" 
              accept=".pdf,.doc,.docx,image/*"
            />
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3 text-gray-400 hover:text-[#008080] transition-colors rounded-xl hover:bg-white"
            >
              <Paperclip className="w-6 h-6" />
            </button>
            
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Posez votre question médicale..."
              className="flex-1 bg-transparent border-none py-3 text-gray-800 placeholder-gray-400 focus:outline-none text-sm font-medium"
            />

            <button 
              type="button"
              onClick={startListening}
              className={`p-3 transition-colors rounded-xl hover:bg-white ${isListening ? 'text-red-500 animate-pulse' : 'text-gray-400 hover:text-[#008080]'}`}
            >
              {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>

            <button
              type="submit"
              disabled={isGenerating || !input.trim()}
              className={`p-3 rounded-xl transition-all ${
                input.trim() 
                  ? 'bg-[#008080] text-white shadow-lg shadow-[#008080]/20 hover:scale-105' 
                  : 'bg-gray-200 text-gray-400'
              }`}
            >
              <Send className="w-6 h-6" />
            </button>
          </form>
          
          <div className="mt-4 flex justify-center gap-8 text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">
            <span className="flex items-center gap-2"><Search className="w-3 h-3" /> Veille Temps Réel</span>
            <span className="flex items-center gap-2"><Bot className="w-3 h-3" /> Gemini 3 Flash</span>
            <span className="flex items-center gap-2"><FileText className="w-3 h-3" /> Analyse Bibliographique</span>
          </div>
        </div>
      </div>
    </div>
  );
}
