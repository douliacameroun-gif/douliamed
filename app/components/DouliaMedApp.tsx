'use client';

import React, { useState, useEffect } from 'react';
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
  Image as ImageIcon,
  FileSearch,
  ExternalLink,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Chat from './Chat';
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
import { supabase } from '@/lib/supabase';

// --- Components for each Tab ---

const SessionsTab = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) console.error('Error fetching sessions:', error);
      else setSessions(data || []);
      setIsLoading(false);
    };
    fetchSessions();
  }, []);

  return (
    <div className="p-8 space-y-6 bg-white min-h-full">
      <h2 className="text-2xl font-bold text-gray-800">Historique des Sessions</h2>
      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-gray-400">Chargement...</div>
        ) : sessions.length === 0 ? (
          <div className="text-gray-400">Aucune session trouvée.</div>
        ) : (
          sessions.map(s => (
            <div key={s.id} className="bg-white p-6 rounded-2xl border border-gray-200 hover:border-[#008080] transition-all cursor-pointer group shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-gray-800 group-hover:text-[#008080] transition-colors">
                  {s.role === 'user' ? 'Question du Docteur' : 'Réponse de DouliaMed'}
                </h3>
                <span className="text-xs text-gray-400">{new Date(s.created_at).toLocaleDateString('fr-FR')}</span>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">{s.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const SourcesTab = () => {
  const [sources, setSources] = useState<any[]>([]);

  useEffect(() => {
    const fetchSources = async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('*');
      if (error) console.error('Error fetching sources:', error);
      else setSources(data || []);
    };
    fetchSources();
  }, []);

  return (
    <div className="p-8 space-y-6 bg-white min-h-full">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Sources et Documents</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#008080] text-white rounded-xl hover:bg-[#006666] transition-all shadow-md">
          <Plus className="w-4 h-4" /> Ajouter une source
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sources.length === 0 ? (
          <div className="text-gray-400 col-span-full">Aucun document dans l&apos;archive médicale.</div>
        ) : (
          sources.map(s => (
            <div key={s.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-xl bg-[#008080]/10 flex items-center justify-center mb-4 text-[#008080]">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-800 mb-1 group-hover:text-[#008080] transition-colors">{s.title}</h3>
              <p className="text-xs text-gray-400 mb-4">{s.author || 'Auteur inconnu'} • {s.type || 'PDF'}</p>
              <div className="flex gap-2">
                <button className="flex-1 text-xs py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-600">Vancouver</button>
                <button className="flex-1 text-xs py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-600">APA</button>
              </div>
            </div>
          ))
        )}
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
    <div className="p-8 space-y-6 bg-white min-h-full">
      <h2 className="text-2xl font-bold text-gray-800">Jalons de l&apos;Agrégation</h2>
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {tasks.map(t => (
          <div key={t.id} className="flex items-center gap-4 p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
            <button 
              onClick={() => setTasks(tasks.map(task => task.id === t.id ? {...task, completed: !task.completed} : task))}
              className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                t.completed ? 'bg-[#008080] border-[#008080] text-white' : 'border-gray-300'
              }`}
            >
              {t.completed && <CheckSquare className="w-4 h-4" />}
            </button>
            <span className={`flex-1 text-sm ${t.completed ? 'text-gray-300 line-through' : 'text-gray-700'}`}>{t.text}</span>
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
    <div className="p-8 space-y-6 bg-white min-h-full">
      <h2 className="text-2xl font-bold text-gray-800">Chronogramme Critique</h2>
      <div className="relative pl-8 space-y-12 before:content-[''] before:absolute before:left-[11px] before:top-0 before:bottom-0 before:w-0.5 before:bg-gray-200">
        {events.map((e, i) => (
          <div key={i} className="relative">
            <div className="absolute -left-[29px] top-1 w-6 h-6 rounded-full bg-white border-4 border-[#008080] z-10" />
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <span className="text-xs font-bold text-[#008080] uppercase tracking-wider">{e.date}</span>
              <h3 className="text-lg font-bold text-gray-800 mt-1">{e.title}</h3>
              <p className="text-sm text-gray-500 mt-2">{e.desc}</p>
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
    <div className="flex h-full bg-white">
      <div className="flex-1 p-8 space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Visualisation de Données</h2>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 h-[400px] shadow-sm">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#008080" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#008080" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#00000010" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#00000040', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#00000040', fontSize: 12}} />
              <Tooltip 
                contentStyle={{backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #00000010', color: '#000'}}
              />
              <Area type="monotone" dataKey="value" stroke="#008080" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="w-80 bg-slate-50 border-l border-gray-200 p-6 space-y-6">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <FileSearch className="w-4 h-4 text-[#008080]" /> Interprétation IA
        </h3>
        <div className="text-sm text-gray-600 leading-relaxed">
          La tendance observée montre une corrélation positive entre les variables X et Y. L&apos;augmentation significative en Juin suggère un impact direct des nouveaux protocoles.
        </div>
        <button className="w-full py-3 bg-[#008080]/10 text-[#008080] rounded-xl text-xs font-bold hover:bg-[#008080]/20 transition-all">
          Générer un rapport complet
        </button>
      </div>
    </div>
  );
};

const AnalyseTab = () => {
  const [preview, setPreview] = useState<string | null>(null);

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto bg-white min-h-full">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-800">Analyse Assistée</h2>
        <p className="text-gray-500">Déposez vos images médicales (DICOM, JPG, PNG) pour une analyse par DouliaMed.</p>
      </div>
      
      <div className="aspect-video bg-slate-50 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center p-12 transition-all hover:border-[#008080] group cursor-pointer shadow-inner">
        {preview ? (
          <div className="relative w-full h-full">
            <Image src={preview} alt="Preview" fill className="object-contain rounded-2xl" />
            <button onClick={() => setPreview(null)} className="absolute top-4 right-4 p-2 bg-white/80 rounded-full shadow-lg text-gray-800">
              <Plus className="w-4 h-4 rotate-45" />
            </button>
          </div>
        ) : (
          <>
            <div className="w-20 h-20 rounded-full bg-[#008080]/5 flex items-center justify-center mb-6 text-[#008080] group-hover:scale-110 transition-transform">
              <Upload className="w-10 h-10" />
            </div>
            <p className="font-bold text-gray-800">Glissez-déposez vos fichiers ici</p>
            <p className="text-sm text-gray-400 mt-2">ou cliquez pour parcourir vos dossiers</p>
          </>
        )}
      </div>

      <div className="flex gap-4">
        <button className="flex-1 py-4 bg-[#008080] text-white rounded-2xl font-bold shadow-lg shadow-[#008080]/20 hover:bg-[#006666] transition-all flex items-center justify-center gap-3">
          <ImageIcon className="w-5 h-5" /> Lancer l&apos;Analyse Assistée
        </button>
        <button className="px-6 py-4 border border-gray-200 rounded-2xl hover:bg-gray-50 transition-all">
          <Download className="w-5 h-5 text-gray-400" />
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
    <div className="flex h-screen bg-slate-50 text-gray-800 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-72 bg-white border-r border-gray-200 flex flex-col z-50 shadow-sm">
        {/* Profile Header */}
        <div className="p-8 border-b border-gray-100">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-[#008080] shadow-lg">
              <Image 
                src="https://i.postimg.cc/Z5MH4cqY/Capture_d_e_cran_2026_02_24_a_12_47_09_PM.png" 
                alt="Dr. Charlotte Eposse" 
                fill 
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-gray-900">Dr. Charlotte Eposse</h1>
              <p className="text-[10px] text-[#008080] font-bold uppercase tracking-widest mt-1">Pédiatre & Chercheuse</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all group ${
                activeTab === tab.id 
                  ? 'bg-[#008080] text-white shadow-md shadow-[#008080]/20' 
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <tab.icon className={`w-5 h-5 transition-colors ${activeTab === tab.id ? 'text-white' : 'text-gray-400 group-hover:text-[#008080]'}`} />
              <span className="flex-1 text-left">{tab.label}</span>
              {activeTab === tab.id && <ChevronRight className="w-4 h-4 text-white/60" />}
            </button>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-6 border-t border-gray-100 space-y-4">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-gray-100">
            <div className="w-8 h-8 rounded-lg bg-[#008080]/10 flex items-center justify-center text-[#008080]">
              <Bot className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">IA Active</p>
              <p className="text-xs font-bold text-gray-700">Gemini 3 Flash</p>
            </div>
          </div>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all text-sm font-bold">
            <LogOut className="w-5 h-5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar Status */}
        <header className="h-16 bg-white border-b border-gray-200 px-8 flex items-center justify-between z-40">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">DouliaMed v2.0 — Système Opérationnel</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
              <Calendar className="w-4 h-4 text-[#008080]" />
              <span>25 Mars 2026</span>
            </div>
            <button className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent"
            >
              {activeTab === 'chat' && <Chat />}
              {activeTab === 'sessions' && <SessionsTab />}
              {activeTab === 'sources' && <SourcesTab />}
              {activeTab === 'tasks' && <TasksTab />}
              {activeTab === 'chrono' && <ChronoTab />}
              {activeTab === 'visu' && <VisuTab />}
              {activeTab === 'analyse' && <AnalyseTab />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
