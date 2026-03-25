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
  Volume2,
  Send,
  Loader2,
  User,
  Bot,
  Plus,
  Download,
  Upload,
  Image as ImageIcon,
  FileSearch
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import Image from 'next/image';

// --- Types ---
interface Message {
  role: 'user' | 'model';
  text: string;
}

// --- Components ---

const WELCOME_MESSAGE = `Bienvenue, Docteur Eposse. Je suis DouliaMed, votre partenaire d&apos;intelligence médicale et de réussite académique.

Pour cette nouvelle session, je suis prêt à vous assister sur les points suivants :
1. Analyse critique de la littérature scientifique et rédaction de vos Titres et Travaux.
2. Synthèse de protocoles cliniques pédiatriques actualisés.
3. Organisation de votre chronogramme de préparation au concours d&apos;agrégation.
4. Interprétation biostatistique avancée de vos données de recherche.
5. Veille bibliographique en temps réel via Tavily et vos archives Supabase.

Comment pouvons-nous faire progresser vos travaux aujourd&apos;hui ?`;

const ChatTab = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: WELCOME_MESSAGE }
  ]);
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
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
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
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'model', text: "Désolé Docteur, une erreur est survenue. Veuillez réessayer." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'model' && (
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Bot className="w-6 h-6 text-accent" />
              </div>
            )}
            <div className={`max-w-[80%] p-4 rounded-2xl ${
              msg.role === 'user' 
                ? 'bg-accent text-white rounded-tr-none' 
                : 'bg-white border border-border text-navy rounded-tl-none shadow-sm'
            }`}>
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
              {msg.role === 'model' && (
                <button 
                  onClick={() => handleSpeak(msg.text)}
                  className="mt-2 p-1 text-text-secondary hover:text-accent transition-colors"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex gap-4 justify-start">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-accent animate-spin" />
            </div>
            <div className="bg-white border border-border p-4 rounded-2xl rounded-tl-none shadow-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-accent rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-6 bg-white border-t border-border">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Posez votre question médicale..."
            className="w-full bg-background border border-border rounded-xl px-6 py-4 pr-14 focus:outline-none focus:border-accent transition-all"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition-all"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

const SessionsTab = () => {
  const sessions = [
    { id: 1, title: "Analyse ANOVA - Étude Drépanocytose", date: "24 Mars 2026", preview: "Discussion sur les résultats de l'étude..." },
    { id: 2, title: "Rédaction Titres et Travaux", date: "22 Mars 2026", preview: "Structuration de la section méthodologie..." },
    { id: 3, title: "Veille : Protocoles OMS 2026", date: "20 Mars 2026", preview: "Mise à jour des recommandations..." },
  ];

  return (
    <div className="p-8 space-y-6">
      <h2 className="text-2xl font-bold text-navy">Historique des Sessions</h2>
      <div className="grid gap-4">
        {sessions.map(s => (
          <div key={s.id} className="bg-white p-6 rounded-2xl border border-border hover:border-accent transition-all cursor-pointer group">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-navy group-hover:text-accent transition-colors">{s.title}</h3>
              <span className="text-xs text-text-secondary">{s.date}</span>
            </div>
            <p className="text-sm text-text-secondary">{s.preview}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const SourcesTab = () => {
  const sources = [
    { id: 1, title: "Lancet - Pediatric Oncology 2025", type: "PDF", author: "Smith et al." },
    { id: 2, title: "Protocoles Nationaux Cameroun", type: "DOCX", author: "MINSANTE" },
    { id: 3, title: "NEJM - Sickle Cell Advances", type: "URL", author: "NEJM" },
  ];

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-navy">Sources et Documents</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-xl hover:bg-accent-hover transition-all">
          <Plus className="w-4 h-4" /> Ajouter une source
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sources.map(s => (
          <div key={s.id} className="bg-white p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 text-accent">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-navy mb-1">{s.title}</h3>
            <p className="text-xs text-text-secondary mb-4">{s.author} • {s.type}</p>
            <div className="flex gap-2">
              <button className="flex-1 text-xs py-2 border border-border rounded-lg hover:bg-background transition-colors">Vancouver</button>
              <button className="flex-1 text-xs py-2 border border-border rounded-lg hover:bg-background transition-colors">APA</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const TasksTab = () => {
  const [tasks, setTasks] = useState([
    { id: 1, text: "Finaliser le dossier Titres et Travaux", completed: true },
    { id: 2, text: "Soumettre l'article ANOVA au Journal of Pediatrics", completed: false },
    { id: 3, text: "Préparer la leçon de 24h (Simulation)", completed: false },
    { id: 4, text: "Mise à jour de la bibliographie Vancouver", completed: true },
  ]);

  return (
    <div className="p-8 space-y-6">
      <h2 className="text-2xl font-bold text-navy">Jalons de l&apos;Agrégation</h2>
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        {tasks.map(t => (
          <div key={t.id} className="flex items-center gap-4 p-4 border-b border-border last:border-0 hover:bg-background transition-colors">
            <button 
              onClick={() => setTasks(tasks.map(task => task.id === t.id ? {...task, completed: !task.completed} : task))}
              className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                t.completed ? 'bg-accent border-accent text-white' : 'border-border'
              }`}
            >
              {t.completed && <CheckSquare className="w-4 h-4" />}
            </button>
            <span className={`flex-1 text-sm ${t.completed ? 'text-text-secondary line-through' : 'text-navy'}`}>{t.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ChronoTab = () => {
  const events = [
    { date: "15 Avril 2026", title: "Dépôt des dossiers", desc: "Date limite pour l'inscription officielle au concours." },
    { date: "10 Mai 2026", title: "Validation des Titres et Travaux", desc: "Examen par le comité scientifique." },
    { date: "15 Juin 2026", title: "Début des épreuves", desc: "Première session d'agrégation." },
  ];

  return (
    <div className="p-8 space-y-6">
      <h2 className="text-2xl font-bold text-navy">Chronogramme Critique</h2>
      <div className="relative pl-8 space-y-12 before:content-[''] before:absolute before:left-[11px] before:top-0 before:bottom-0 before:w-0.5 before:bg-border">
        {events.map((e, i) => (
          <div key={i} className="relative">
            <div className="absolute -left-[29px] top-1 w-6 h-6 rounded-full bg-white border-4 border-accent z-10" />
            <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
              <span className="text-xs font-bold text-accent uppercase tracking-wider">{e.date}</span>
              <h3 className="text-lg font-bold text-navy mt-1">{e.title}</h3>
              <p className="text-sm text-text-secondary mt-2">{e.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const VisuTab = () => {
  const data = [
    { name: 'Jan', value: 400 },
    { name: 'Fév', value: 300 },
    { name: 'Mar', value: 600 },
    { name: 'Avr', value: 800 },
    { name: 'Mai', value: 500 },
    { name: 'Juin', value: 900 },
  ];

  return (
    <div className="flex h-full">
      <div className="flex-1 p-8 space-y-6">
        <h2 className="text-2xl font-bold text-navy">Visualisation de Données</h2>
        <div className="bg-white p-6 rounded-2xl border border-border h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#008080" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#008080" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <Tooltip 
                contentStyle={{backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
              />
              <Area type="monotone" dataKey="value" stroke="#008080" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="w-80 bg-white border-l border-border p-6 space-y-6">
        <h3 className="font-bold text-navy flex items-center gap-2">
          <FileSearch className="w-4 h-4 text-accent" /> Interprétation IA
        </h3>
        <div className="text-sm text-text-secondary leading-relaxed">
          La tendance observée montre une corrélation positive entre les variables X et Y. L&apos;augmentation significative en Juin suggère un impact direct des nouveaux protocoles.
        </div>
        <button className="w-full py-3 bg-accent/10 text-accent rounded-xl text-xs font-bold hover:bg-accent/20 transition-all">
          Générer un rapport complet
        </button>
      </div>
    </div>
  );
};

const AnalyseTab = () => {
  const [preview, setPreview] = useState<string | null>(null);

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-navy">Analyse Assistée</h2>
        <p className="text-text-secondary">Déposez vos images médicales (DICOM, JPG, PNG) pour une analyse par DouliaMed.</p>
      </div>
      
      <div className="aspect-video bg-white border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center p-12 transition-all hover:border-accent group cursor-pointer">
        {preview ? (
          <div className="relative w-full h-full">
            <Image src={preview} alt="Preview" fill className="object-contain rounded-2xl" />
            <button onClick={() => setPreview(null)} className="absolute top-4 right-4 p-2 bg-white/80 rounded-full shadow-lg">
              <Plus className="w-4 h-4 rotate-45" />
            </button>
          </div>
        ) : (
          <>
            <div className="w-20 h-20 rounded-full bg-accent/5 flex items-center justify-center mb-6 text-accent group-hover:scale-110 transition-transform">
              <Upload className="w-10 h-10" />
            </div>
            <p className="font-bold text-navy">Glissez-déposez vos fichiers ici</p>
            <p className="text-sm text-text-secondary mt-2">ou cliquez pour parcourir vos dossiers</p>
          </>
        )}
      </div>

      <div className="flex gap-4">
        <button className="flex-1 py-4 bg-accent text-white rounded-2xl font-bold shadow-lg shadow-accent/20 hover:bg-accent-hover transition-all flex items-center justify-center gap-3">
          <ImageIcon className="w-5 h-5" /> Lancer l&apos;Analyse Assistée
        </button>
        <button className="px-6 py-4 border border-border rounded-2xl hover:bg-white transition-all">
          <Download className="w-5 h-5 text-text-secondary" />
        </button>
      </div>
    </div>
  );
};

// --- Main App ---

export default function DouliaMedApp() {
  const [activeTab, setActiveTab] = useState('chat');

  const tabs = [
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'sessions', label: 'Sessions', icon: History },
    { id: 'sources', label: 'Sources', icon: FileText },
    { id: 'tasks', label: 'Tâches', icon: CheckSquare },
    { id: 'chrono', label: 'Chrono', icon: Calendar },
    { id: 'visu', label: 'Visu', icon: BarChart3 },
    { id: 'analyse', label: 'Analyse', icon: Search },
  ];

  return (
    <div className="flex flex-col h-screen bg-background text-navy">
      {/* Header / Top Nav */}
      <header className="bg-white border-b border-border px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-accent/20">
            <Image 
              src="https://i.postimg.cc/v8hD1LQP/Whats_App_Image_2026_03_24_at_06_04_08.jpg" 
              alt="Logo" 
              fill 
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="text-xl font-black tracking-tight text-navy">DouliaMed</h1>
        </div>

        <nav className="flex gap-1 bg-background p-1 rounded-xl border border-border">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === tab.id 
                  ? 'bg-white text-accent shadow-sm' 
                  : 'text-text-secondary hover:text-navy hover:bg-white/50'
              }`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-accent' : 'text-text-secondary'}`} />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-navy">Dr. Charlotte Eposse</p>
            <p className="text-[10px] text-accent font-bold uppercase tracking-widest">Pédiatre & Chercheuse</p>
          </div>
          <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-accent">
            <Image 
              src="https://i.postimg.cc/Z5MH4cqY/Capture_d_e_cran_2026_02_24_a_12_47_09_PM.png" 
              alt="User" 
              fill 
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full overflow-y-auto"
          >
            {activeTab === 'chat' && <ChatTab />}
            {activeTab === 'sessions' && <SessionsTab />}
            {activeTab === 'sources' && <SourcesTab />}
            {activeTab === 'tasks' && <TasksTab />}
            {activeTab === 'chrono' && <ChronoTab />}
            {activeTab === 'visu' && <VisuTab />}
            {activeTab === 'analyse' && <AnalyseTab />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer Status Bar */}
      <footer className="bg-white border-t border-border px-8 py-2 flex justify-between items-center text-[10px] font-bold text-text-secondary uppercase tracking-widest">
        <div className="flex gap-4">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Système Opérationnel</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-accent"></span> IA : Gemini 3 Flash</span>
        </div>
        <div>DouliaMed © 2026 — Partenaire d&apos;Excellence</div>
      </footer>
    </div>
  );
}
