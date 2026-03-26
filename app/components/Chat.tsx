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
import Image from 'next/image';
import { GoogleGenAI } from "@google/genai";
import { supabase } from '@/lib/supabase';
// @ts-ignore
// import html2pdf from 'html2pdf.js'; // Removed top-level import to fix SSR error

const WELCOME_MESSAGE = "Bienvenue, Docteur Eposse. Je suis DouliaMed, votre partenaire d'intelligence médicale exclusive.\n\nVoici un résumé des capacités majeures que j'intègre actuellement pour votre période de recherche :\n\n1\nIntelligence Scientifique : J'utilise le modèle Gemini 3.1 Pro. Je suis capable de structurer des raisonnements cliniques complexes et de rédiger dans un style académique rigoureux pour vos travaux.\n\n2\nVeille en Temps Réel : J'ai un accès direct à Google Search. Je pourrai vérifier les dernières statistiques de santé ou retrouver des protocoles actualisés sur PubMed pour étayer vos thèses.\n\n3\nAnalyse de votre Bibliographie : Vous pourrez me soumettre vos fichiers PDF ou Word. Je les lirai et les synthétiserai pour vous faire gagner un temps précieux sur vos revues de littérature.\n\n4\nInteraction Vocale : Pour libérer votre pensée, vous pourrez me parler via un microphone. En retour, je pourrai vous lire mes analyses à haute voix, vous permettant de m'écouter tout en consultant vos dossiers.\n\n5\nExpertise en Biostatistiques : Je vous guiderai dans le choix et l'interprétation de vos tests statistiques pour valider vos hypothèses avec une rigueur mathématique constante.\n\nJe mets également à votre disposition :\n- Un Générateur de Citations Automatique (Vancouver/APA).\n- Un Chronogramme Intelligent pour votre préparation.\n- La Visualisation de Données interactive.\n\nComment pouvons-nous vous accompagner aujourd'hui ?";

const SYSTEM_INSTRUCTION = "Tu es DouliaMed, l'intelligence médicale exclusive du Docteur Charlotte Eposse. Tu dois STRICTEMENT respecter les consignes suivantes :\n\n1. TOUTES tes réponses de recherches académiques et approfondies DOIVENT être accompagnées de sources précises (ex: [Tavily: OMS 2024]).\n2. INTERDICTION TOTALE d'utiliser des astérisques (*), des dièses (#), des tirets (-) ou des balises HTML dans le texte brut.\n3. Structure tes réponses uniquement avec des paragraphes fluides.\n4. Pour les listes ou étapes, commence chaque point par un chiffre SEUL sur sa propre ligne, suivi du contenu commençant par une majuscule (ex: 1\nPremière étape).\n5. N'utilise JAMAIS de majuscules pour les titres ou mots-clés, sauf pour les noms propres ou acronymes médicaux.\n6. Sépare obligatoirement chaque paragraphe ou grande idée par deux sauts de ligne complets.\n7. Rédige des phrases directes, élégantes et structurées.\n8. Adapte ta profondeur d'analyse selon le MODE DE RECHERCHE spécifié dans le prompt.";

interface ChatProps {
  sessionId: string | null;
  onNewSession: () => Promise<string>;
  researchMode: string;
}

const MessageContent = ({ content, role }: { content: string, role: string }) => {
  // Function to parse content and render numbered bubbles
  const renderContent = (text: string) => {
    const lines = text.split('\n\n');
    
    return lines.map((paragraph, pIdx) => {
      // Check if paragraph is a single number (for the new numbered bubble format)
      const numMatch = paragraph.trim().match(/^(\d+)$/);
      
      if (numMatch) {
        const num = numMatch[1];
        // Look ahead to see if next paragraph exists
        const nextParagraph = lines[pIdx + 1];
        if (nextParagraph) {
          // We'll render the number and the next paragraph together
          return (
            <div key={pIdx} className="flex gap-3 items-start my-4">
              <div className="w-8 h-8 rounded-full bg-[#008080] text-white flex items-center justify-center text-xs font-black shadow-md shadow-[#008080]/10 flex-shrink-0">
                {num}
              </div>
              <div className="bg-white border border-[#008080]/5 p-4 rounded-[20px] shadow-sm flex-1">
                {nextParagraph}
              </div>
            </div>
          );
        }
      }
      
      // If this paragraph was the content of a numbered bubble, skip it (it was rendered above)
      const prevParagraph = lines[pIdx - 1];
      if (prevParagraph && prevParagraph.trim().match(/^(\d+)$/)) {
        return null;
      }

      return (
        <p key={pIdx} className="mb-4 leading-relaxed">
          {paragraph}
        </p>
      );
    });
  };

  return (
    <div className={`space-y-2 ${role === 'user' ? 'text-right' : 'text-left'}`}>
      <div 
        className={`p-5 rounded-[28px] text-sm shadow-sm border ${
          role === 'user' 
            ? 'bg-[#e6f2f2] text-[#001F3F] border-[#008080]/10 rounded-tr-none' 
            : 'bg-white text-[#001F3F] border-gray-100 rounded-tl-none'
        }`}
      >
        {renderContent(content)}
      </div>
    </div>
  );
};

export default function Chat({ sessionId, onNewSession, researchMode }: ChatProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Initialize Gemini
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
  const tavilyKey = process.env.NEXT_PUBLIC_TAVILY_API_KEY || "";
  
  const ai = new GoogleGenAI({ apiKey });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Load messages from Supabase or start with welcome
    const loadMessages = async () => {
      try {
        if (!sessionId) {
          // Add welcome message if no session yet
          const welcome = {
            id: 'welcome',
            role: 'assistant',
            content: WELCOME_MESSAGE,
            created_at: new Date().toISOString()
          };
          setMessages([welcome]);
          return;
        }

        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('session_id', sessionId)
          .order('created_at', { ascending: true });
        
        if (error) throw error;

        if (data && data.length > 0) {
          setMessages(data);
        } else {
          // Add welcome message if no history in this session
          const welcome = {
            id: 'welcome',
            role: 'assistant',
            content: WELCOME_MESSAGE,
            created_at: new Date().toISOString()
          };
          setMessages([welcome]);
        }
      } catch (err) {
        console.error("Erreur Supabase (Chargement):", err);
      }
    };
    loadMessages();
  }, [sessionId]);

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

    try {
      // Ensure session exists
      let activeSessionId = sessionId;
      if (!activeSessionId) {
        activeSessionId = await onNewSession();
      }

      const userMsg = { 
        role: 'user', 
        content: userText, 
        created_at: new Date().toISOString(),
        session_id: activeSessionId
      };
      
      setMessages(prev => [...prev, userMsg]);

      // Save user message
      const { error: userInsertError } = await supabase.from('messages').insert([userMsg]);
      if (userInsertError) console.error("Erreur Supabase (Insert User Msg):", userInsertError);

      // Hybrid Search
      const [supabaseCtx, tavilyCtx] = await Promise.all([
        getSupabaseContext(userText),
        researchMode !== 'standard' ? getTavilyContext(userText) : Promise.resolve("")
      ]);

      const modeInstructions = {
        standard: "MODE: STANDARD. Réponse rapide, concise, basée sur les connaissances générales et le contexte fourni.",
        approfondi: "MODE: APPROFONDI. Analyse détaillée, exploration large du web, synthèse exhaustive.",
        academique: "MODE: ACADÉMIQUE. Rigueur scientifique maximale, focus sur les sources PubMed/OMS, style de rédaction de thèse."
      }[researchMode as keyof typeof modeInstructions] || "";

      const contextPrompt = `${modeInstructions}\n\nCONTEXTE DOCUMENTAIRE:\n${supabaseCtx}\n\nCONTEXTE WEB RÉCENT:\n${tavilyCtx}\n\nQUESTION DU DOCTEUR: ${userText}`;

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
        created_at: new Date().toISOString(),
        session_id: activeSessionId
      };
      
      setMessages(prev => [...prev, assistantMsg]);
      
      // Save assistant message
      const { error: assistantInsertError } = await supabase.from('messages').insert([assistantMsg]);
      if (assistantInsertError) console.error("Erreur Supabase (Insert Assistant Msg):", assistantInsertError);

    } catch (error) {
      console.error('Gemini/Supabase error:', error);
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
    <div className="flex flex-col h-full bg-[#F9FAFB] font-sans">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-[#F9FAFB]">
        <div className="max-w-4xl mx-auto p-8 space-y-10">
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <motion.div
                key={msg.id || idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className="max-w-[85%]">
                  <div id={`msg-${msg.id || idx}`}>
                    <MessageContent content={msg.content} role={msg.role} />
                  </div>
                  
                  {msg.role === 'assistant' && (
                    <div className="flex items-center gap-3 mt-4 px-2">
                      <button 
                        onClick={() => handleSpeak(msg.content)}
                        className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#008080] bg-[#008080]/5 hover:bg-[#008080]/10 rounded-xl transition-all"
                      >
                        <Volume2 className="w-3.5 h-3.5" /> Écouter
                      </button>
                      <button 
                        onClick={() => handleExportPDF(msg.id || idx)}
                        className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all"
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
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-2xl bg-[#008080] flex items-center justify-center text-white shadow-lg shadow-[#008080]/20">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
              <div className="bg-white border border-gray-100 p-6 rounded-[28px] rounded-tl-none shadow-sm">
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
      </div>

      {/* Input Zone */}
      <div className="p-4 bg-white/80 backdrop-blur-xl border-t border-gray-100">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="relative flex items-center gap-4 bg-white border border-gray-200 p-2 rounded-[32px] shadow-xl shadow-gray-200/50 focus-within:border-[#008080] focus-within:ring-4 focus-within:ring-[#008080]/5 transition-all">
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
              className="p-2 text-gray-400 hover:text-[#008080] transition-all rounded-2xl hover:bg-gray-50"
            >
              <Paperclip className="w-6 h-6" />
            </button>
            
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Posez votre question scientifique au Dr. Eposse..."
              className="flex-1 bg-transparent border-none py-2 text-base text-[#001F3F] placeholder-gray-400 focus:outline-none"
            />

            <button 
              type="button"
              onClick={startListening}
              className={`p-2 transition-all rounded-2xl ${isListening ? 'text-red-500 bg-red-50 animate-pulse' : 'text-gray-400 hover:text-[#008080] hover:bg-gray-50'}`}
            >
              {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>

            <button
              type="submit"
              disabled={isGenerating || !input.trim()}
              className={`p-3 rounded-2xl transition-all shadow-lg ${
                input.trim() 
                  ? 'bg-[#008080] text-white shadow-[#008080]/30 hover:scale-105 active:scale-95' 
                  : 'bg-gray-100 text-gray-400 shadow-none'
              }`}
            >
              <Send className="w-6 h-6" />
            </button>
          </form>
          
          <div className="mt-3 flex justify-center gap-8 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
            <span>PROPULSÉ PAR DOULIA</span>
          </div>
        </div>
      </div>
    </div>
  );
}
