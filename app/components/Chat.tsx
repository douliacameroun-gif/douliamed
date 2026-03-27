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

const WELCOME_MESSAGE = "Bienvenue, **Docteur Eposse**. Je suis **DouliaMed**, votre partenaire d'intelligence médicale exclusive.\n\nVoici un résumé des capacités majeures que j'intègre actuellement pour votre période de recherche :\n\n1. **Intelligence Scientifique (Gemini 3.1 Pro)** : Analyse de données complexes, aide au diagnostic et rédaction académique.\n2. **Veille en Temps Réel** : Accès aux dernières publications (PubMed, OMS) via ma recherche hybride.\n3. **Analyse de votre Bibliographie** : Résumé et synthèse de vos documents PDF ou Word téléchargés.\n4. **Interaction Vocale** : Posez vos questions à l'oral pour une fluidité totale.\n5. **Expertise en Biostatistiques** : Vérification de la cohérence de vos résultats (ANOVA, régressions, IC 95%).\n\nJe mets également à votre disposition des outils dédiés : Un **Générateur de Citations**, Un **Chronogramme de Recherche** et La **Visualisation de Données**.\n\nComment pouvons-nous faire progresser la science médicale aujourd'hui ?";

const SYSTEM_INSTRUCTION = "Tu es DouliaMed, l'intelligence médicale exclusive du Docteur Charlotte Eposse. RÈGLES DE RÉPONSE : 1. Mets TOUJOURS les TITRES et les MOTS-CLÉS en GRAS en utilisant la syntaxe markdown **TEXTE**. 2. Utilise TOUJOURS des LISTES NUMÉROTÉES (1., 2., 3.) pour les étapes ou niveaux. 3. Citer tes sources à la fin (ex: [Tavily: OMS 2024]). 4. Fais des sauts de ligne réguliers pour la clarté. 5. Ton ton est académique, rigoureux et respectueux.";

export default function Chat() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const recognitionRef = useRef<any>(null);
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

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'fr-FR';
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => {
        // Only set to false if we didn't manually stop it (e.g. browser stopped it)
        // But the user wants it persistent, so we might need to restart it if not manually stopped
        if (isListening) recognition.start();
      };
      
      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setInput(prev => prev + (prev ? ' ' : '') + finalTranscript);
        }
      };
      
      recognitionRef.current = recognition;
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
    setStatusMessage('DouliaMed analyse vos sources...');

    const userMsg = { role: 'user', content: userText, created_at: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);

    // Stop listening if active
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    // Save user message
    await supabase.from('messages').insert([userMsg]);

    try {
      // Hybrid Search
      setStatusMessage('Recherche hybride en cours (Supabase & Web)...');
      const [supabaseCtx, tavilyCtx] = await Promise.all([
        getSupabaseContext(userText),
        getTavilyContext(userText)
      ]);

      setStatusMessage('Génération de la réponse médicale...');
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
      setStatusMessage('');
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
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => (
            <motion.div
              key={msg.id || idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-4 group ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm ${
                msg.role === 'user' ? 'bg-gray-100 text-gray-500' : 'bg-[#008080]/10 text-[#008080]'
              }`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              
              <div className={`max-w-[85%] space-y-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                <div 
                  id={`msg-${msg.id || idx}`}
                  className={`p-4 rounded-2xl text-[13px] leading-relaxed shadow-sm border ${
                    msg.role === 'user' 
                      ? 'bg-gray-800 text-white border-gray-800 rounded-tr-none' 
                      : 'bg-white text-gray-800 border-gray-100 rounded-tl-none'
                  }`}
                >
                  <div className="prose prose-sm max-w-none prose-headings:text-[#008080] prose-strong:text-[#008080] prose-ol:list-none prose-ol:pl-0">
                    <div dangerouslySetInnerHTML={{ 
                      __html: msg.content
                        .replace(/\*\*(.*?)\*\*/g, '<span class="text-[#008080] font-black">$1</span>')
                        .replace(/^\s*\d+\.\s/gm, (match) => `<span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#008080] text-white text-[9px] font-black mr-2">${match.trim().split('.')[0]}</span>`)
                        .replace(/\n/g, '<br/>')
                    }} />
                  </div>
                </div>
                
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center bg-slate-50 rounded-md border border-slate-100 overflow-hidden">
                      <button 
                        onClick={() => handleSpeak(msg.content)}
                        className="flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-[#008080] hover:bg-[#008080]/10 transition-all border-r border-slate-100"
                      >
                        <Volume2 className="w-3 h-3" /> Écouter
                      </button>
                      <button 
                        onClick={() => handleExportPDF(msg.id || idx)}
                        className="flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-gray-400 hover:bg-gray-100 transition-all"
                      >
                        <Download className="w-3 h-3" /> PDF
                      </button>
                    </div>
                    <button 
                      onClick={clearChat}
                      className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isGenerating && (
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-lg bg-[#008080]/10 flex items-center justify-center text-[#008080] relative">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                className="w-4 h-4 border-2 border-[#008080] border-t-transparent rounded-full"
              />
            </div>
            <div className="bg-slate-50/50 p-3 rounded-xl rounded-tl-none border border-slate-100 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-[10px] font-bold text-[#008080] uppercase tracking-wider">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>{statusMessage || 'DouliaMed réfléchit...'}</span>
              </div>
              <div className="flex gap-1">
                <div className="w-1 h-1 bg-[#008080] rounded-full animate-bounce"></div>
                <div className="w-1 h-1 bg-[#008080] rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1 h-1 bg-[#008080] rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Zone */}
      <div className="px-6 py-4 bg-white/80 backdrop-blur-sm border-t border-gray-100">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="relative flex items-center gap-2 bg-slate-50 border border-gray-200 p-1.5 rounded-xl shadow-inner focus-within:border-[#008080] transition-all">
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
              className="p-2 text-gray-400 hover:text-[#008080] transition-colors rounded-lg hover:bg-white"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Posez votre question médicale..."
              className="flex-1 bg-transparent border-none py-2 text-gray-800 placeholder-gray-400 focus:outline-none text-[13px] font-medium"
            />

            <button 
              type="button"
              onClick={toggleListening}
              className={`p-2 transition-colors rounded-lg hover:bg-white ${isListening ? 'text-red-500 bg-red-50 animate-pulse' : 'text-gray-400 hover:text-[#008080]'}`}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <button
              type="submit"
              disabled={isGenerating || !input.trim()}
              className={`p-2 rounded-lg transition-all ${
                input.trim() 
                  ? 'bg-[#008080] text-white shadow-md hover:scale-105' 
                  : 'bg-gray-200 text-gray-400'
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          
          <div className="mt-2 flex justify-center gap-8 text-[8px] font-black text-gray-300 uppercase tracking-[0.3em]">
            <span>PROPULSER PAR DOULIA</span>
          </div>
        </div>
      </div>
    </div>
  );
}
