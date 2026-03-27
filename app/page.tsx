'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  History, 
  FileText, 
  CheckSquare, 
  Calendar, 
  BarChart3, 
  Search,
  Settings,
  User,
  Bot,
  Plus,
  Download,
  Upload,
  FileSearch,
  ExternalLink,
  ChevronRight,
  LogOut,
  Loader2,
  Trash2,
  Send,
  Volume2,
  Paperclip,
  Mic,
  MicOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import Image from 'next/image';
import Markdown from 'react-markdown';

// Types
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: string[];
}

interface Session {
  id: string;
  title: string;
  lastMessage: string;
  date: Date;
}

interface Source {
  id: string;
  title: string;
  type: 'pdf' | 'doc' | 'web';
  date: string;
}

// Mock Data
const MOCK_SESSIONS: Session[] = [
  { id: '1', title: 'Protocole Paludisme Grave', lastMessage: 'Quels sont les critères de gravité de l\'OMS 2024 ?', date: new Date() },
  { id: '2', title: 'Analyse Statistique ANOVA', lastMessage: 'La p-value est de 0.034, ce qui est significatif.', date: new Date(Date.now() - 86400000) },
  { id: '3', title: 'Rédaction Agrégation', lastMessage: 'Structure de la leçon sur la drépanocytose.', date: new Date(Date.now() - 172800000) },
];

const MOCK_SOURCES: Source[] = [
  { id: '1', title: 'OMS_Malaria_Report_2024.pdf', type: 'pdf', date: '24/03/2026' },
  { id: '2', title: 'Protocoles_Pediatrie_Douala.docx', type: 'doc', date: '20/03/2026' },
  { id: '3', title: 'Lancet_Sickle_Cell_Review.pdf', type: 'pdf', date: '15/03/2026' },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<'chat' | 'sessions' | 'sources' | 'stats' | 'calendar'>('chat');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Bonjour Docteur Eposse. Je suis DouliaMed, votre assistant de recherche. Comment puis-je vous accompagner dans vos travaux d'agrégation aujourd'hui ?",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI Response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "D'après les derniers protocoles de l'OMS et vos travaux précédents sur la pédiatrie en zone tropicale, voici une synthèse structurée pour votre leçon d'agrégation...",
        timestamp: new Date(),
        sources: ['OMS_Malaria_Report_2024.pdf', 'Protocoles_Pediatrie_Douala.docx']
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shadow-sm z-20">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
              <Bot className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-lg tracking-tight">DouliaMed</h1>
              <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest">Excellence Académique</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-hide">
          <button 
            onClick={() => setActiveTab('chat')}
            className={`nav-item w-full ${activeTab === 'chat' ? 'nav-item-active' : 'nav-item-inactive'}`}
          >
            <MessageSquare size={20} />
            <span className="font-medium">Assistant IA</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('sessions')}
            className={`nav-item w-full ${activeTab === 'sessions' ? 'nav-item-active' : 'nav-item-inactive'}`}
          >
            <History size={20} />
            <span className="font-medium">Sessions de Travail</span>
          </button>

          <button 
            onClick={() => setActiveTab('sources')}
            className={`nav-item w-full ${activeTab === 'sources' ? 'nav-item-active' : 'nav-item-inactive'}`}
          >
            <FileSearch size={20} />
            <span className="font-medium">Base Documentaire</span>
          </button>

          <button 
            onClick={() => setActiveTab('stats')}
            className={`nav-item w-full ${activeTab === 'stats' ? 'nav-item-active' : 'nav-item-inactive'}`}
          >
            <BarChart3 size={20} />
            <span className="font-medium">Biostatistiques</span>
          </button>

          <button 
            onClick={() => setActiveTab('calendar')}
            className={`nav-item w-full ${activeTab === 'calendar' ? 'nav-item-active' : 'nav-item-inactive'}`}
          >
            <Calendar size={20} />
            <span className="font-medium">Chronogramme</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3 mb-4">
            <div className="relative">
              <Image 
                src="https://i.postimg.cc/v8hD1LQP/Whats_App_Image_2026_03_24_at_06_04_08.jpg" 
                alt="Dr Charlotte Eposse" 
                width={40} 
                height={40} 
                className="rounded-full object-cover border-2 border-white shadow-sm"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-900 truncate">Dr Charlotte Eposse</p>
              <p className="text-[10px] text-slate-500 truncate">Pédiatre Chercheuse</p>
            </div>
          </div>
          <button className="flex items-center gap-2 text-slate-400 hover:text-red-600 transition-colors w-full px-4 py-2 text-sm font-medium">
            <LogOut size={16} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative bg-slate-50">
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-slate-900">
              {activeTab === 'chat' && "Assistant de Recherche"}
              {activeTab === 'sessions' && "Historique des Sessions"}
              {activeTab === 'sources' && "Bibliothèque Médicale"}
              {activeTab === 'stats' && "Analyse de Données"}
              {activeTab === 'calendar' && "Planning d'Agrégation"}
            </h2>
            <div className="h-6 w-px bg-slate-200 mx-2"></div>
            <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
              <Calendar size={16} />
              <span>{new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(new Date())}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl transition-all">
              <Search size={20} />
            </button>
            <button className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl transition-all">
              <Settings size={20} />
            </button>
            <button className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">
              <Plus size={18} />
              <span>Nouvelle Étude</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
          <AnimatePresence mode="wait">
            {activeTab === 'chat' && (
              <motion.div 
                key="chat"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-4xl mx-auto h-full flex flex-col"
              >
                <div className="flex-1 space-y-8 pb-32">
                  {messages.map((msg) => (
                    <div 
                      key={msg.id} 
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center shadow-sm ${
                          msg.role === 'user' ? 'bg-indigo-600' : 'bg-white border border-slate-200'
                        }`}>
                          {msg.role === 'user' ? <User className="text-white w-5 h-5" /> : <Bot className="text-indigo-600 w-5 h-5" />}
                        </div>
                        <div className="space-y-2">
                          <div className={`p-5 rounded-2xl shadow-sm ${
                            msg.role === 'user' 
                              ? 'bg-indigo-600 text-white rounded-tr-none' 
                              : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                          }`}>
                            <div className="markdown-body">
                              <Markdown>{msg.content}</Markdown>
                            </div>
                          </div>
                          
                          {msg.sources && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {msg.sources.map((source, idx) => (
                                <div key={idx} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-[11px] font-bold border border-indigo-100">
                                  <FileText size={12} />
                                  <span>{source}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          <p className="text-[10px] text-slate-400 font-medium px-1">
                            {msg.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                          <Bot className="text-indigo-600 w-5 h-5" />
                        </div>
                        <div className="bg-white border border-slate-200 p-5 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-3">
                          <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                          <span className="text-sm text-slate-500 font-medium">DouliaMed analyse vos données...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="fixed bottom-8 left-72 right-0 px-8 pointer-events-none">
                  <div className="max-w-4xl mx-auto pointer-events-auto">
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl p-2 flex items-end gap-2 focus-within:border-indigo-400 transition-all">
                      <div className="flex items-center gap-1 p-1">
                        <button className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                          <Paperclip size={20} />
                        </button>
                        <button 
                          onClick={toggleRecording}
                          className={`p-2.5 rounded-xl transition-all ${isRecording ? 'bg-red-50 text-red-600 animate-pulse' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
                        >
                          {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                        </button>
                      </div>
                      
                      <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                          }
                        }}
                        placeholder="Posez votre question médicale ou demandez une analyse..."
                        className="flex-1 bg-transparent border-none focus:ring-0 text-slate-800 placeholder:text-slate-400 py-3 px-2 resize-none max-h-40 min-h-[48px] scrollbar-hide"
                        rows={1}
                      />
                      
                      <div className="p-1">
                        <button 
                          onClick={handleSend}
                          disabled={!input.trim() || isLoading}
                          className={`p-3 rounded-xl transition-all shadow-lg ${
                            !input.trim() || isLoading 
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                              : 'bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700 active:scale-95'
                          }`}
                        >
                          <Send size={20} />
                        </button>
                      </div>
                    </div>
                    <p className="text-center text-[10px] text-slate-400 mt-3 font-medium">
                      DouliaMed peut faire des erreurs. Vérifiez les informations médicales critiques.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'sessions' && (
              <motion.div 
                key="sessions"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-5xl mx-auto space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {MOCK_SESSIONS.map((session) => (
                    <div key={session.id} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-xl transition-all group cursor-pointer border-b-4 border-b-indigo-600/0 hover:border-b-indigo-600">
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                          <History size={24} />
                        </div>
                        <button className="text-slate-300 hover:text-red-500 transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </div>
                      <h3 className="font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">{session.title}</h3>
                      <p className="text-sm text-slate-500 line-clamp-2 mb-4 leading-relaxed">{session.lastMessage}</p>
                      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {new Intl.DateTimeFormat('fr-FR').format(session.date)}
                        </span>
                        <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  ))}
                  <button className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 text-slate-400 hover:border-indigo-300 hover:text-indigo-600 transition-all bg-white/50">
                    <Plus size={32} />
                    <span className="font-bold text-sm">Nouvelle Session</span>
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'sources' && (
              <motion.div 
                key="sources"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-5xl mx-auto"
              >
                <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                  <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600">
                        <Upload size={16} />
                        <span>Importer</span>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600">
                        <Download size={16} />
                        <span>Exporter</span>
                      </div>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        type="text" 
                        placeholder="Rechercher un document..." 
                        className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-64"
                      />
                    </div>
                  </div>
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-bold uppercase tracking-widest border-b border-slate-100">
                        <th className="px-8 py-4">Document</th>
                        <th className="px-8 py-4">Type</th>
                        <th className="px-8 py-4">Date d'ajout</th>
                        <th className="px-8 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {MOCK_SOURCES.map((source) => (
                        <tr key={source.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                source.type === 'pdf' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                              }`}>
                                <FileText size={20} />
                              </div>
                              <span className="font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{source.title}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <span className={`status-badge ${
                              source.type === 'pdf' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                              {source.type}
                            </span>
                          </td>
                          <td className="px-8 py-5 text-sm text-slate-500 font-medium">{source.date}</td>
                          <td className="px-8 py-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                                <ExternalLink size={18} />
                              </button>
                              <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'stats' && (
              <motion.div 
                key="stats"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="max-w-6xl mx-auto space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {[
                    { label: "Articles Rédigés", value: "14", icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Données Analysées", value: "1.2k", icon: BarChart3, color: "text-indigo-600", bg: "bg-indigo-50" },
                    { label: "Taux de Réussite", value: "94%", icon: CheckSquare, color: "text-green-600", bg: "bg-green-50" },
                    { label: "Heures de Travail", value: "320h", icon: Calendar, color: "text-amber-600", bg: "bg-amber-50" },
                  ].map((stat, idx) => (
                    <div key={idx} className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
                      <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4`}>
                        <stat.icon size={24} />
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                      <h4 className="text-2xl font-black text-slate-900">{stat.value}</h4>
                    </div>
                  ))}
                </div>

                <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Progression de la Recherche</h3>
                      <p className="text-sm text-slate-500">Volume de données traitées par mois</p>
                    </div>
                    <select className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500">
                      <option>Année 2026</option>
                      <option>Année 2025</option>
                    </select>
                  </div>
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[
                        { name: 'Jan', value: 400 },
                        { name: 'Feb', value: 300 },
                        { name: 'Mar', value: 600 },
                        { name: 'Apr', value: 800 },
                        { name: 'May', value: 500 },
                        { name: 'Jun', value: 900 },
                      ]}>
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                        <Tooltip 
                          contentStyle={{backgroundColor: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                        />
                        <Area type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'calendar' && (
              <motion.div 
                key="calendar"
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-4xl mx-auto"
              >
                <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold text-slate-900">Objectifs d'Agrégation</h3>
                    <div className="flex gap-2">
                      <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg transition-all"><ChevronRight className="rotate-180" /></button>
                      <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg transition-all"><ChevronRight /></button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {[
                      { title: "Finalisation Titres et Travaux", date: "15 Avril 2026", progress: 85, color: "bg-indigo-600" },
                      { title: "Rédaction Mémoire Principal", date: "30 Mai 2026", progress: 45, color: "bg-blue-500" },
                      { title: "Préparation Leçon Clinique", date: "12 Juin 2026", progress: 20, color: "bg-amber-500" },
                    ].map((task, idx) => (
                      <div key={idx} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-all group">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{task.title}</h4>
                            <p className="text-xs text-slate-500 font-medium mt-1">Échéance : {task.date}</p>
                          </div>
                          <span className="text-sm font-black text-indigo-600">{task.progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${task.progress}%` }}
                            transition={{ duration: 1, delay: idx * 0.2 }}
                            className={`h-full ${task.color}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
