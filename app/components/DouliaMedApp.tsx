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
  LogOut,
  Loader2,
  Clock
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
        .from('sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) console.error('Erreur Supabase (Sessions):', error);
      else setSessions(data || []);
      setIsLoading(false);
    };
    fetchSessions();
  }, []);

  return (
    <div className="p-10 space-y-8 bg-[#F9FAFB] min-h-full">
      <div>
        <h2 className="text-3xl font-bold text-[#001F3F]">Historique des Sessions</h2>
        <p className="text-gray-500 mt-2">Gérez vos consultations et recherches passées.</p>
      </div>
      <div className="grid gap-6">
        {isLoading ? (
          <div className="flex items-center gap-3 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin" /> Chargement des sessions...
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-gray-400 p-12 border-2 border-dashed border-gray-200 rounded-[32px] text-center bg-white">
            Aucune session enregistrée.
          </div>
        ) : (
          sessions.map(s => (
            <div key={s.id} className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 hover:shadow-xl transition-all cursor-pointer group">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#008080]/10 flex items-center justify-center text-[#008080] group-hover:bg-[#008080] group-hover:text-white transition-all">
                    <History className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#001F3F] group-hover:text-[#008080] transition-colors">
                      {s.title || 'Session sans titre'}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-400">
                        {new Date(s.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-gray-300 group-hover:text-[#008080] transition-all" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const SourcesTab = () => {
  const [sources, setSources] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSources = async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) console.error('Erreur Supabase (Sources):', error);
      else setSources(data || []);
      setIsLoading(false);
    };
    fetchSources();
  }, []);

  const saveSource = async (title: string) => {
    const newSource = {
      title,
      author: "Dr. Charlotte Eposse",
      type: "PDF",
      created_at: new Date().toISOString()
    };
    const { error } = await supabase.from('documents').insert([newSource]);
    if (error) console.error("Erreur saveSource:", error);
    else {
      // Refresh
      const { data } = await supabase.from('documents').select('*').order('created_at', { ascending: false });
      setSources(data || []);
    }
  };

  return (
    <div className="p-10 space-y-8 bg-[#F9FAFB] min-h-full">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-[#001F3F]">Sources Bibliographiques</h2>
          <p className="text-gray-500 mt-2">Archive centralisée de vos références scientifiques.</p>
        </div>
        <button 
          onClick={() => saveSource("Nouveau Document Médical")}
          className="flex items-center gap-2 px-6 py-3 bg-[#008080] text-white rounded-2xl hover:bg-[#006666] transition-all shadow-lg shadow-[#008080]/20 font-bold text-sm"
        >
          <Plus className="w-4 h-4" /> Ajouter une source
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {isLoading ? (
          <div className="col-span-full text-gray-400 flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" /> Chargement des documents...
          </div>
        ) : sources.length === 0 ? (
          <div className="text-gray-400 col-span-full p-16 border-2 border-dashed border-gray-200 rounded-[40px] text-center bg-white">
            Aucun document dans l&apos;archive.
          </div>
        ) : (
          sources.map(s => (
            <div key={s.id} className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 hover:shadow-xl transition-all group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-[#008080] opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-6 text-gray-400 group-hover:text-[#008080] group-hover:bg-[#008080]/5 transition-all">
                <FileText className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-[#001F3F] mb-2 group-hover:text-[#008080] transition-colors line-clamp-1">{s.title}</h3>
              <p className="text-sm text-gray-500 mb-6">{s.author || 'Auteur inconnu'} • {s.type || 'PDF'}</p>
              <div className="flex gap-3">
                <button className="flex-1 text-[11px] font-bold uppercase tracking-wider py-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-gray-600">Vancouver</button>
                <button className="flex-1 text-[11px] font-bold uppercase tracking-wider py-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-gray-600">APA</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const TasksTab = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) console.error('Erreur Supabase (Tasks):', error);
      else setTasks(data || []);
      setIsLoading(false);
    };
    fetchTasks();
  }, []);

  const addTask = async (text: string) => {
    const newTask = {
      text,
      completed: false,
      created_at: new Date().toISOString()
    };
    const { error } = await supabase.from('tasks').insert([newTask]);
    if (error) console.error("Erreur addTask:", error);
    else {
      const { data } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
      setTasks(data || []);
    }
  };

  const toggleTask = async (id: string, completed: boolean) => {
    const { error } = await supabase
      .from('tasks')
      .update({ completed: !completed })
      .eq('id', id);
    if (error) console.error("Erreur toggleTask:", error);
    else {
      setTasks(tasks.map(t => t.id === id ? { ...t, completed: !completed } : t));
    }
  };

  const deleteTask = async (id: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) console.error("Erreur deleteTask:", error);
    else {
      setTasks(tasks.filter(t => t.id !== id));
    }
  };

  return (
    <div className="p-10 space-y-8 bg-[#F9FAFB] min-h-full">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-[#001F3F]">Objectifs Académiques</h2>
          <p className="text-gray-500 mt-2">Suivez votre progression vers l&apos;agrégation.</p>
        </div>
        <button 
          onClick={() => addTask("Nouvelle tâche académique")}
          className="px-6 py-3 bg-[#008080] text-white rounded-2xl font-bold text-sm shadow-lg shadow-[#008080]/20 hover:bg-[#006666] transition-all"
        >
          Ajouter une tâche
        </button>
      </div>
      <div className="bg-white rounded-[40px] border border-gray-100 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 text-gray-400 flex items-center gap-2 justify-center">
            <Loader2 className="w-5 h-5 animate-spin" /> Chargement des tâches...
          </div>
        ) : tasks.length === 0 ? (
          <div className="p-16 text-center text-gray-400">
            Aucune tâche pour le moment.
          </div>
        ) : (
          tasks.map(t => (
            <div key={t.id} className="flex items-center gap-6 p-6 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors group">
              <button 
                onClick={() => toggleTask(t.id, t.completed)}
                className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${
                  t.completed ? 'bg-[#008080] border-[#008080] text-white' : 'border-gray-200 bg-white'
                }`}
              >
                {t.completed && <CheckSquare className="w-5 h-5" />}
              </button>
              <span className={`flex-1 text-base font-medium ${t.completed ? 'text-gray-300 line-through' : 'text-[#001F3F]'}`}>{t.text}</span>
              <button 
                onClick={() => deleteTask(t.id)}
                className="p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const ChronoTab = () => {
  const events = [
    { date: "15 Avril 2026", title: "Dépôt des dossiers", desc: "Date limite pour l'inscription officielle au concours.", type: 'deadline' },
    { date: "10 Mai 2026", title: "Validation des Titres et Travaux", desc: "Examen par le comité scientifique.", type: 'exam' },
    { date: "15 Juin 2026", title: "Début des épreuves", desc: "Première session d'agrégation.", type: 'exam' },
  ];

  return (
    <div className="p-10 space-y-8 bg-[#F9FAFB] min-h-full">
      <h2 className="text-3xl font-bold text-[#001F3F]">Chronogramme de Préparation</h2>
      <div className="relative pl-12 space-y-12 before:content-[''] before:absolute before:left-[19px] before:top-4 before:bottom-4 before:w-1 before:bg-gray-100">
        {events.map((e, i) => (
          <div key={i} className="relative">
            <div className={`absolute -left-[41px] top-2 w-6 h-6 rounded-full border-4 border-white z-10 shadow-sm ${
              e.type === 'deadline' ? 'bg-red-500' : 'bg-green-500'
            }`} />
            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl transition-all">
              <span className={`text-xs font-black uppercase tracking-widest ${e.type === 'deadline' ? 'text-red-500' : 'text-green-500'}`}>{e.date}</span>
              <h3 className="text-xl font-bold text-[#001F3F] mt-2">{e.title}</h3>
              <p className="text-gray-500 mt-3 leading-relaxed">{e.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const VisuTab = () => {
  return (
    <div className="p-10 space-y-8 bg-[#F9FAFB] min-h-full flex flex-col items-center justify-center text-center">
      <div className="w-full max-w-4xl p-20 border-4 border-dashed border-gray-200 rounded-[40px] bg-white space-y-6">
        <div className="w-24 h-24 rounded-3xl bg-gray-50 flex items-center justify-center mx-auto text-gray-300">
          <BarChart3 className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold text-[#001F3F]">En attente de vos données</h2>
        <p className="text-gray-500 max-w-md mx-auto">Importez un fichier CSV ou Excel pour générer des visualisations biostatistiques avancées (ANOVA, Régressions).</p>
        <button className="px-8 py-4 bg-[#008080] text-white rounded-2xl font-bold shadow-lg shadow-[#008080]/20 hover:scale-105 transition-all">
          Importer des données
        </button>
      </div>
    </div>
  );
};

const AnalyseTab = () => {
  return (
    <div className="p-10 space-y-8 bg-[#F9FAFB] min-h-full flex flex-col items-center justify-center text-center">
      <div className="w-full max-w-4xl p-20 border-4 border-dashed border-gray-200 rounded-[40px] bg-white space-y-6">
        <div className="w-24 h-24 rounded-3xl bg-gray-50 flex items-center justify-center mx-auto text-gray-300">
          <Upload className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold text-[#001F3F]">Téléversement de l&apos;Image</h2>
        <p className="text-gray-500 max-w-md mx-auto">Glissez-déposez vos clichés médicaux ou radiographies pour une analyse assistée par IA.</p>
        <button className="px-8 py-4 bg-[#008080] text-white rounded-2xl font-bold shadow-lg shadow-[#008080]/20 hover:scale-105 transition-all">
          Sélectionner un fichier
        </button>
      </div>
    </div>
  );
};

// --- Main App ---

export default function DouliaMedApp() {
  const [activeTab, setActiveTab] = useState('chat');
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const createNewSession = async () => {
    const sid = crypto.randomUUID();
    // 1. Mise à jour de l'UI
    setCurrentSessionId(sid);
    
    // 2. Enregistrement direct dans Supabase
    const { error } = await supabase.from('sessions').insert([{
      id: sid,
      title: "Nouvelle Session",
      created_at: new Date().toISOString()
    }]);
    if (error) console.error("Erreur création session:", error);
    return sid;
  };

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
    <div className="flex flex-col h-screen bg-[#F9FAFB] text-[#001F3F] overflow-hidden font-sans">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-gray-100 z-50 px-8 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo & Profile */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 text-[#008080]">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-sm border border-gray-100">
                <Image 
                  src="https://i.postimg.cc/v8hD1LQP/Whats_App_Image_2026_03_24_at_06_04_08.jpg" 
                  alt="DouliaMed Logo" 
                  fill 
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight leading-none">DouliaMed</span>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Écosystème DOULIA</span>
              </div>
            </div>
            
            <div className="h-8 w-px bg-gray-100 mx-2 hidden md:block" />
            
            <div className="hidden md:flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                <Image 
                  src="https://i.postimg.cc/Z5MH4cqY/Capture_d_e_cran_2026_02_24_a_12_47_09_PM.png" 
                  alt="Dr. Charlotte Eposse" 
                  fill 
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="text-left">
                <h1 className="text-sm font-bold text-[#001F3F] leading-tight">Dr. Charlotte Eposse</h1>
                <p className="text-[10px] text-gray-400 font-medium">Pédiatre & Enseignante-Chercheuse</p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-gray-50 p-1.5 rounded-[24px]">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-[20px] text-xs font-bold transition-all ${
                  activeTab === tab.id 
                    ? 'bg-[#008080] text-white shadow-md shadow-[#008080]/20' 
                    : 'text-gray-500 hover:text-[#001F3F] hover:bg-white'
                }`}
              >
                <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-white' : 'text-gray-400'}`} />
                <span className="hidden lg:inline">{tab.label}</span>
              </button>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button className="p-2.5 text-gray-400 hover:text-[#008080] transition-all rounded-xl hover:bg-gray-50">
              <Settings className="w-5 h-5" />
            </button>
            <button className="p-2.5 text-gray-400 hover:text-red-500 transition-all rounded-xl hover:bg-red-50">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full overflow-y-auto"
            >
              {activeTab === 'chat' && <Chat sessionId={currentSessionId} onNewSession={createNewSession} />}
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
