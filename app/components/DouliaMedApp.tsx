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

const SessionsTab = ({ onNewSession }: { onNewSession: () => void }) => {
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
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-[#001F3F]">Historique des Sessions</h2>
          <p className="text-gray-500 mt-2 font-medium">Retrouvez vos échanges précédents avec DouliaMed.</p>
        </div>
        <button 
          onClick={onNewSession}
          className="flex items-center gap-2 px-6 py-3 bg-[#008080] text-white rounded-2xl hover:bg-[#006666] transition-all shadow-lg shadow-[#008080]/20 font-bold text-sm"
        >
          <Plus className="w-4 h-4" /> Nouvelle Session
        </button>
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
          <h2 className="text-3xl font-bold text-[#001F3F]">Bibliothèque de Sources</h2>
          <p className="text-gray-500 mt-2 font-medium">Gérez vos documents de recherche et références académiques.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => saveSource("Nouveau Document Médical")}
            className="flex items-center gap-2 px-6 py-3 bg-[#008080] text-white rounded-2xl hover:bg-[#006666] transition-all shadow-lg shadow-[#008080]/20 font-bold text-sm"
          >
            <Upload className="w-4 h-4" /> Téléverser
          </button>
          <button 
            className="flex items-center gap-2 px-6 py-3 bg-white text-[#001F3F] border border-gray-200 rounded-2xl hover:bg-gray-50 transition-all shadow-sm font-bold text-sm"
          >
            <ExternalLink className="w-4 h-4" /> Lien URL
          </button>
        </div>
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
  const [newTaskText, setNewTaskText] = useState('');

  useEffect(() => {
    const fetchTasks = async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) console.error('Erreur Supabase (Tasks):', error);
      else {
        if (!data || data.length === 0) {
          // Add examples if empty
          const examples = [
            { text: "Finaliser l'analyse statistique du chapitre 3", completed: false },
            { text: "Soumettre l'article à la revue 'Pediatrics'", completed: false }
          ];
          setTasks(examples.map((e, i) => ({ ...e, id: `ex-${i}`, created_at: new Date().toISOString() })));
        } else {
          setTasks(data);
        }
      }
      setIsLoading(false);
    };
    fetchTasks();
  }, []);

  const addTask = async () => {
    if (!newTaskText.trim()) return;
    const newTask = {
      text: newTaskText,
      completed: false,
      created_at: new Date().toISOString()
    };
    const { error } = await supabase.from('tasks').insert([newTask]);
    if (error) console.error("Erreur addTask:", error);
    else {
      const { data } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
      setTasks(data || []);
      setNewTaskText('');
    }
  };

  const toggleTask = async (id: string, completed: boolean) => {
    if (id.startsWith('ex-')) {
      setTasks(tasks.map(t => t.id === id ? { ...t, completed: !completed } : t));
      return;
    }
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
    if (id.startsWith('ex-')) {
      setTasks(tasks.filter(t => t.id !== id));
      return;
    }
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
          <h2 className="text-3xl font-bold text-[#001F3F]">Objectifs de Recherche</h2>
          <p className="text-gray-500 mt-2 font-medium">Gérez vos tâches et jalons pour votre concours d&apos;agrégation.</p>
        </div>
      </div>

      <div className="flex gap-4 bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
        <input 
          type="text" 
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          placeholder="Ex: Finaliser l'analyse statistique..."
          className="flex-1 bg-gray-50 border-none px-6 py-4 rounded-2xl text-[#001F3F] placeholder-gray-400 focus:ring-2 focus:ring-[#008080]/20 outline-none"
        />
        <button 
          onClick={addTask}
          className="px-8 py-4 bg-[#008080] text-white rounded-2xl font-bold text-sm shadow-lg shadow-[#008080]/20 hover:bg-[#006666] transition-all"
        >
          Ajouter
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
  const [currentDate, setCurrentDate] = useState(new Date());
  const [notes, setNotes] = useState<{[key: string]: string}>({});

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);
    const days = [];

    // Empty cells for previous month
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-32 border border-gray-50 bg-gray-50/30" />);
    }

    // Actual days
    for (let d = 1; d <= totalDays; d++) {
      const dateKey = `${year}-${month + 1}-${d}`;
      days.push(
        <div key={d} className="h-32 border border-gray-50 p-4 hover:bg-gray-50 transition-colors group relative">
          <span className="text-sm font-bold text-gray-400 group-hover:text-[#008080]">{d}</span>
          <textarea 
            value={notes[dateKey] || ''}
            onChange={(e) => setNotes({...notes, [dateKey]: e.target.value})}
            placeholder="Ajouter une note..."
            className="w-full h-full bg-transparent border-none resize-none text-xs text-[#001F3F] focus:ring-0 p-0 mt-1 placeholder-gray-200"
          />
        </div>
      );
    }

    return days;
  };

  return (
    <div className="p-10 space-y-8 bg-[#F9FAFB] min-h-full">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-[#001F3F]">Chronogramme de Préparation</h2>
        <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm">
          <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))} className="p-1 hover:text-[#008080] transition-colors">
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
          <span className="text-sm font-bold text-[#001F3F] min-w-[120px] text-center">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
          <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))} className="p-1 hover:text-[#008080] transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/50">
          {["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"].map(d => (
            <div key={d} className="py-4 text-center text-[10px] font-black uppercase tracking-widest text-gray-400">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {renderCalendar()}
        </div>
      </div>
    </div>
  );
};

const VisuTab = () => {
  const data = [
    { name: 'Paludisme', value: 45 },
    { name: 'Infections Resp.', value: 30 },
    { name: 'Diarrhées', value: 15 },
    { name: 'Autres', value: 10 },
  ];

  const COLORS = ['#008080', '#001F3F', '#F27D26', '#8E9299'];

  return (
    <div className="p-10 space-y-8 bg-[#F9FAFB] min-h-full">
      <div>
        <h2 className="text-3xl font-bold text-[#001F3F]">Visualisation de Données</h2>
        <p className="text-gray-500 mt-2 font-medium">Interprétez vos statistiques de recherche avec des graphiques interactifs.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-8">
          <h3 className="text-xl font-bold text-[#001F3F]">Répartition des Pathologies Pédiatriques (Exemple)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dx={-10} />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Area type="monotone" dataKey="value" stroke="#008080" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#008080" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#008080" stopOpacity={0}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between items-center pt-6 border-t border-gray-50">
            <div className="flex gap-6">
              {data.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[i % COLORS.length]}} />
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#008080]/5 flex items-center justify-center text-[#008080]">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#001F3F]">Interprétation IA</h3>
            </div>
            <div className="space-y-4 text-sm leading-relaxed text-gray-600">
              <p>L&apos;analyse biostatistique des données visualisées révèle plusieurs points critiques :</p>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <span className="font-bold text-[#008080]">Tendance Significative :</span>
                  Une corrélation positive forte (r &gt; 0.75) est observée entre les variables clés.
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-[#008080]">Stabilité :</span>
                  L&apos;écart-type reste dans les limites de confiance de 95%, suggérant une fiabilité des données.
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-[#008080]">Projection :</span>
                  Une croissance soutenue est anticipée pour le prochain cycle d&apos;observation.
                </li>
              </ul>
            </div>
            <button className="w-full py-4 bg-[#008080] text-white rounded-2xl font-bold text-sm shadow-lg shadow-[#008080]/20 hover:bg-[#006666] transition-all flex items-center justify-center gap-2 mt-4">
              <Download className="w-4 h-4" /> Exporter le Rapport
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AnalyseTab = () => {
  return (
    <div className="p-10 space-y-12 bg-[#F9FAFB] min-h-full max-w-6xl mx-auto">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-[#001F3F]">Analyse d&apos;Imagerie Médicale</h2>
        <p className="text-gray-500 max-w-2xl mx-auto font-medium">Utilisez l&apos;IA pour assister votre diagnostic sur radios, scanners et IRM.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="bg-white p-12 rounded-[40px] border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center space-y-8">
          <div className="w-24 h-24 rounded-3xl bg-gray-50 flex items-center justify-center text-gray-300">
            <Upload className="w-12 h-12" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-[#001F3F]">Téléversement de l&apos;Image</h3>
            <p className="text-sm text-gray-400">Format supportés : DICOM, JPG, PNG</p>
          </div>
          <button className="px-10 py-5 bg-[#008080] text-white rounded-2xl font-bold shadow-xl shadow-[#008080]/20 hover:scale-105 transition-all">
            Sélectionner un cliché
          </button>
          <button className="w-full py-4 border-2 border-[#008080] text-[#008080] rounded-2xl font-bold text-sm hover:bg-[#008080]/5 transition-all">
            Lancer l&apos;Analyse Assistée
          </button>
        </div>

        <div className="bg-white p-12 rounded-[40px] border border-gray-100 shadow-sm space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <span className="px-3 py-1 bg-orange-100 text-orange-600 text-[10px] font-black uppercase tracking-widest rounded-full">Demo</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#008080]/5 flex items-center justify-center text-[#008080]">
              <FileSearch className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[#001F3F]">Rapport Préliminaire IA</h3>
          </div>
          
          <div className="space-y-6">
            <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
              <h4 className="font-bold text-[#001F3F] mb-2">Exemple de Rapport</h4>
              <p className="text-sm text-gray-500 leading-relaxed">Téléversez un cliché pour une analyse réelle. Voici à quoi ressemblera votre rapport d&apos;assistance.</p>
            </div>
            
            <div className="space-y-4 opacity-40 grayscale">
              <div className="h-4 bg-gray-100 rounded-full w-3/4" />
              <div className="h-4 bg-gray-100 rounded-full w-1/2" />
              <div className="h-4 bg-gray-100 rounded-full w-5/6" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SettingsTab = ({ mode, setMode }: { mode: string, setMode: (m: string) => void }) => {
  const modes = [
    { id: 'standard', label: 'Standard', desc: 'Recherche rapide et concise', icon: Bot },
    { id: 'approfondi', label: 'Approfondi', desc: 'Analyse détaillée du web', icon: Search },
    { id: 'academique', label: 'Académique', desc: 'Sources scientifiques uniquement', icon: FileSearch },
  ];

  return (
    <div className="p-10 space-y-12 bg-[#F9FAFB] min-h-full max-w-5xl mx-auto">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-[#001F3F]">Paramètres</h2>
        <p className="text-gray-500">Personnalisez votre expérience de recherche avec DouliaMed.</p>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-bold text-[#001F3F] flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#008080]" /> Mode de Recherche
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`p-8 rounded-[32px] border-2 text-left transition-all space-y-4 group ${
                mode === m.id 
                  ? 'border-[#008080] bg-white shadow-xl shadow-[#008080]/10' 
                  : 'border-gray-100 bg-white hover:border-gray-200'
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                mode === m.id ? 'bg-[#008080] text-white' : 'bg-gray-50 text-gray-400 group-hover:text-[#008080]'
              }`}>
                <m.icon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-[#001F3F]">{m.label}</h4>
                <p className="text-xs text-gray-500 mt-1">{m.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#008080]/5 flex items-center justify-center text-[#008080]">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#001F3F]">Besoin d&apos;aide ?</h3>
            <p className="text-sm text-gray-500">Consultez notre guide d&apos;utilisation pour maximiser l&apos;efficacité de vos recherches avec DouliaMed.</p>
          </div>
        </div>
        <button className="w-full py-4 bg-gray-50 text-[#001F3F] rounded-2xl font-bold text-sm hover:bg-gray-100 transition-all flex items-center justify-center gap-2">
          Voir le guide <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// --- Main App ---

export default function DouliaMedApp() {
  const [activeTab, setActiveTab] = useState('settings');
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [researchMode, setResearchMode] = useState('standard');

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
              {activeTab === 'chat' && <Chat sessionId={currentSessionId} onNewSession={createNewSession} researchMode={researchMode} />}
              {activeTab === 'sessions' && <SessionsTab onNewSession={createNewSession} />}
              {activeTab === 'sources' && <SourcesTab />}
              {activeTab === 'tasks' && <TasksTab />}
              {activeTab === 'chrono' && <ChronoTab />}
              {activeTab === 'visu' && <VisuTab />}
              {activeTab === 'analyse' && <AnalyseTab />}
              {activeTab === 'settings' && <SettingsTab mode={researchMode} setMode={setResearchMode} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
