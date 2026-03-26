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
  Trash2
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Historique des Sessions</h2>
          <p className="text-sm text-gray-500">Retrouvez vos échanges précédents avec DouliaMed.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-[#008080] text-white rounded-xl font-bold hover:bg-[#006666] transition-all shadow-lg shadow-[#008080]/20">
          <Plus className="w-5 h-5" /> Nouvelle Session
        </button>
      </div>
      
      <div className="grid gap-4">
        {isLoading ? (
          <div className="flex items-center gap-2 text-gray-400">
            <Loader2 className="w-4 h-4 animate-spin" /> Chargement...
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-gray-400 py-12 text-center border-2 border-dashed border-gray-100 rounded-3xl">
            Aucune session trouvée. Commencez une nouvelle discussion !
          </div>
        ) : (
          sessions.map(s => (
            <div key={s.id} className="bg-white p-6 rounded-2xl border border-gray-100 hover:border-[#008080] transition-all cursor-pointer group shadow-sm hover:shadow-md">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-gray-800 group-hover:text-[#008080] transition-colors">
                  {s.role === 'user' ? 'Question du Docteur' : 'Réponse de DouliaMed'}
                </h3>
                <span className="text-xs text-gray-400 font-bold">{new Date(s.created_at).toLocaleDateString('fr-FR')}</span>
              </div>
              <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{s.content}</p>
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
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Bibliothèque de Sources</h2>
          <p className="text-sm text-gray-500">Gérez vos documents de recherche et références académiques.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 border-2 border-[#008080] text-[#008080] rounded-xl font-bold hover:bg-[#008080]/5 transition-all">
            <ExternalLink className="w-4 h-4" /> Lien URL
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-[#008080] text-white rounded-xl font-bold hover:bg-[#006666] transition-all shadow-lg shadow-[#008080]/20">
            <Upload className="w-4 h-4" /> Téléverser
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sources.length === 0 ? (
          <div className="text-gray-400 col-span-full py-12 text-center border-2 border-dashed border-gray-100 rounded-3xl">
            Aucun document dans l&apos;archive médicale.
          </div>
        ) : (
          sources.map(s => (
            <div key={s.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-xl bg-[#008080]/10 flex items-center justify-center mb-4 text-[#008080]">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-800 mb-1 group-hover:text-[#008080] transition-colors">{s.title}</h3>
              <p className="text-xs text-gray-400 mb-4">{s.author || 'Auteur inconnu'} • {s.type || 'PDF'}</p>
              <div className="flex gap-2">
                <button className="flex-1 text-xs py-2 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors font-bold text-gray-500">Vancouver</button>
                <button className="flex-1 text-xs py-2 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors font-bold text-gray-500">APA</button>
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
    { id: 1, text: "Finaliser l'analyse statistique du chapitre 3", completed: false },
    { id: 2, text: "Soumettre l'article à la revue 'Pediatrics'", completed: false },
    { id: 3, text: "Finaliser le dossier Titres et Travaux", completed: true },
    { id: 4, text: "Préparer la leçon de 24h (Simulation)", completed: false },
  ]);
  const [newTask, setNewTask] = useState('');

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    setTasks([{ id: Date.now(), text: newTask, completed: false }, ...tasks]);
    setNewTask('');
  };

  return (
    <div className="p-8 space-y-6 bg-white min-h-full">
      <div>
        <h2 className="text-2xl font-black text-gray-900">Objectifs de Recherche</h2>
        <p className="text-sm text-gray-500">Gérez vos tâches et jalons pour votre concours d&apos;agrégation.</p>
      </div>

      <form onSubmit={addTask} className="flex gap-3">
        <input 
          type="text" 
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Ex: Finaliser l'analyse statistique..."
          className="flex-1 px-5 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#008080] transition-all text-sm"
        />
        <button type="submit" className="px-6 py-3 bg-[#008080] text-white rounded-xl font-bold hover:bg-[#006666] transition-all shadow-md">
          Ajouter
        </button>
      </form>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        {tasks.map(t => (
          <div key={t.id} className="flex items-center gap-4 p-5 border-b border-gray-50 last:border-0 hover:bg-slate-50 transition-colors">
            <button 
              onClick={() => setTasks(tasks.map(task => task.id === t.id ? {...task, completed: !task.completed} : task))}
              className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                t.completed ? 'bg-[#008080] border-[#008080] text-white' : 'border-gray-200'
              }`}
            >
              {t.completed && <CheckSquare className="w-4 h-4" />}
            </button>
            <span className={`flex-1 text-sm font-bold ${t.completed ? 'text-gray-300 line-through' : 'text-gray-700'}`}>{t.text}</span>
            <button onClick={() => setTasks(tasks.filter(task => task.id !== t.id))} className="text-gray-300 hover:text-red-500 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
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

  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="p-8 space-y-8 bg-white min-h-full flex flex-col lg:flex-row gap-8">
      <div className="flex-1 space-y-6">
        <h2 className="text-2xl font-black text-gray-900">Chronogramme Critique</h2>
        <div className="relative pl-8 space-y-12 before:content-[''] before:absolute before:left-[11px] before:top-0 before:bottom-0 before:w-0.5 before:bg-gray-100">
          {events.map((e, i) => (
            <div key={i} className="relative">
              <div className="absolute -left-[29px] top-1 w-6 h-6 rounded-full bg-white border-4 border-[#008080] z-10" />
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                <span className="text-xs font-black text-[#008080] uppercase tracking-wider">{e.date}</span>
                <h3 className="text-lg font-black text-gray-800 mt-1">{e.title}</h3>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">{e.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full lg:w-96 space-y-6">
        <div className="bg-slate-50 p-6 rounded-3xl border border-gray-100 shadow-inner">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-black text-gray-900">Mars 2026</h3>
            <div className="flex gap-2">
              <button className="p-1.5 bg-white rounded-lg border border-gray-200 hover:bg-gray-50"><ChevronRight className="w-4 h-4 rotate-180" /></button>
              <button className="p-1.5 bg-white rounded-lg border border-gray-200 hover:bg-gray-50"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map(d => (
              <div key={d} className="text-center text-[10px] font-black text-gray-400 uppercase">{d}</div>
            ))}
            {days.map(d => (
              <button 
                key={d} 
                className={`aspect-square flex items-center justify-center text-xs font-bold rounded-lg transition-all ${
                  d === 25 ? 'bg-[#008080] text-white shadow-lg shadow-[#008080]/20' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-100'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
          <div className="space-y-3">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Notes du jour</h4>
            <textarea 
              placeholder="Ajoutez vos notes pour aujourd'hui..."
              className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-[#008080] min-h-[100px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const VisuTab = () => {
  const data = [
    { name: 'Paludisme', value: 60 },
    { name: 'Infections Resp.', value: 45 },
    { name: 'Diarrhées', value: 30 },
    { name: 'Autres', value: 15 },
  ];

  return (
    <div className="flex flex-col lg:flex-row h-full bg-white">
      <div className="flex-1 p-8 space-y-6">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Visualisation de Données</h2>
          <p className="text-sm text-gray-500">Interprétez vos statistiques de recherche avec des graphiques interactifs.</p>
        </div>

        <div className="bg-slate-50 p-8 rounded-3xl border border-gray-100 shadow-inner">
          <h3 className="text-lg font-bold text-gray-800 mb-8">Répartition des Pathologies Pédiatriques (Exemple)</h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#008080" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#008080" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#00000010" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#00000040', fontSize: 12, fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#00000040', fontSize: 12, fontWeight: 'bold'}} />
                <Tooltip 
                  contentStyle={{backgroundColor: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold'}}
                />
                <Area type="monotone" dataKey="value" stroke="#008080" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-96 bg-white border-l border-gray-100 p-8 space-y-8 overflow-y-auto">
        <div className="space-y-6">
          <h3 className="font-black text-gray-900 flex items-center gap-3 text-lg">
            <div className="p-2 bg-[#008080]/10 rounded-lg text-[#008080]">
              <FileSearch className="w-5 h-5" />
            </div>
            Interprétation IA
          </h3>
          
          <div className="space-y-4">
            <p className="text-sm text-gray-600 leading-relaxed">
              L&apos;analyse biostatistique des données visualisées révèle plusieurs points critiques :
            </p>
            
            <div className="p-4 bg-slate-50 rounded-2xl border border-gray-100 space-y-3">
              <div className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#008080] mt-1.5 shrink-0" />
                <p className="text-xs text-gray-700"><span className="font-black">Tendance Significative :</span> Une corrélation positive forte (r &gt; 0.75) est observée entre les variables clés.</p>
              </div>
              <div className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#008080] mt-1.5 shrink-0" />
                <p className="text-xs text-gray-700"><span className="font-black">Stabilité :</span> L&apos;écart-type reste dans les limites de confiance de 95%, suggérant une fiabilité des données.</p>
              </div>
              <div className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#008080] mt-1.5 shrink-0" />
                <p className="text-xs text-gray-700"><span className="font-black">Projection :</span> Une croissance soutenue est anticipée pour le prochain cycle d&apos;observation.</p>
              </div>
            </div>
          </div>
        </div>

        <button className="w-full py-4 bg-[#008080] text-white rounded-2xl font-black text-sm hover:bg-[#006666] transition-all shadow-lg shadow-[#008080]/20 flex items-center justify-center gap-2">
          <Download className="w-4 h-4" /> Exporter le Rapport
        </button>
      </div>
    </div>
  );
};

const AnalyseTab = () => {
  const [preview, setPreview] = useState<string | null>(null);

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto bg-white min-h-full">
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-black text-gray-900">Analyse d&apos;Imagerie Médicale</h2>
        <p className="text-gray-500 max-w-2xl mx-auto">Utilisez l&apos;IA pour assister votre diagnostic sur radios, scanners et IRM.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="aspect-square bg-slate-50 border-2 border-dashed border-gray-200 rounded-[40px] flex flex-col items-center justify-center p-12 transition-all hover:border-[#008080] group cursor-pointer shadow-inner relative overflow-hidden">
            {preview ? (
              <div className="relative w-full h-full">
                <Image src={preview} alt="Preview" fill className="object-contain rounded-2xl" />
                <button onClick={() => setPreview(null)} className="absolute top-4 right-4 p-2 bg-white/80 rounded-full shadow-lg text-gray-800">
                  <Plus className="w-4 h-4 rotate-45" />
                </button>
              </div>
            ) : (
              <>
                <div className="w-24 h-24 rounded-3xl bg-[#008080]/5 flex items-center justify-center mb-6 text-[#008080] group-hover:scale-110 transition-transform shadow-sm">
                  <Upload className="w-12 h-12" />
                </div>
                <p className="font-black text-gray-900 text-lg">Téléversement de l&apos;Image</p>
                <button className="mt-4 px-6 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all">
                  Sélectionner un cliché
                </button>
                <p className="text-xs text-gray-400 mt-6 font-bold uppercase tracking-widest">Format supportés : DICOM, JPG, PNG</p>
              </>
            )}
          </div>

          <button className="w-full py-5 bg-[#008080] text-white rounded-3xl font-black text-lg shadow-xl shadow-[#008080]/20 hover:bg-[#006666] transition-all flex items-center justify-center gap-4">
            <Search className="w-6 h-6" /> Lancer l&apos;Analyse Assistée
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 rounded-[40px] p-8 text-white h-full shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Bot className="w-32 h-32" />
            </div>
            
            <div className="relative z-10 space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <FileText className="w-5 h-5 text-[#008080]" />
                  </div>
                  Rapport Préliminaire IA
                </h3>
                <span className="px-3 py-1 bg-[#008080] text-[10px] font-black uppercase tracking-widest rounded-full">Demo</span>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-[#008080] uppercase tracking-widest">Exemple de Rapport</h4>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    Téléversez un cliché pour une analyse réelle. Voici à quoi ressemblera votre rapport d&apos;assistance.
                  </p>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/10">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-300">Confiance Diagnostic</span>
                    <span className="text-sm font-black text-[#008080]">98.2%</span>
                  </div>
                  <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#008080] h-full w-[98%]"></div>
                  </div>
                </div>

                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-xs text-gray-400 italic">
                    &quot;Présence d&apos;une opacité focale dans le lobe inférieur droit compatible avec un foyer de pneumopathie bactérienne. Recommandation : Corrélation clinique et biologique.&quot;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function DouliaMedApp() {
  const [activeTab, setActiveTab] = useState('chat');
  const [showSettings, setShowSettings] = useState(true); // Forced to true

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
    <div className="flex flex-col h-screen bg-slate-50 text-gray-800 overflow-hidden font-sans">
      {/* Top Navigation Bar (The main header now contains the tabs) */}
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex flex-col md:flex-row items-center justify-between z-50 shadow-sm gap-4">
        <div className="flex items-center gap-4">
          <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-[#008080]/20">
            <Image 
              src="https://i.postimg.cc/v8hD1LQP/Whats_App_Image_2026_03_24_at_06_04_08.jpg" 
              alt="Logo" 
              fill 
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="text-xl font-black tracking-tight text-gray-900">DouliaMed</h1>
        </div>

        {/* Navigation Menu - Now in the top bar */}
        <nav className="flex flex-wrap justify-center gap-1 bg-slate-100 p-1 rounded-xl border border-gray-200">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === tab.id 
                  ? 'bg-[#008080] text-white shadow-sm' 
                  : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-white' : 'text-gray-400'}`} />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <div className="text-right hidden lg:block">
            <p className="text-sm font-bold text-gray-900">Dr. Charlotte Eposse</p>
            <p className="text-[10px] text-[#008080] font-bold uppercase tracking-widest">Pédiatre & Chercheuse</p>
          </div>
          <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-[#008080]">
            <Image 
              src="https://i.postimg.cc/Z5MH4cqY/Capture_d_e_cran_2026_02_24_a_12_47_09_PM.png" 
              alt="User" 
              fill 
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-lg transition-colors ${showSettings ? 'text-[#008080] bg-[#008080]/10' : 'text-gray-400 hover:text-gray-900'}`}
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 overflow-hidden relative flex flex-col">
          {/* Status Bar moved inside main */}
          <div className="h-8 bg-slate-100 border-b border-gray-200 px-8 flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              <span>DouliaMed v2.0 — Système Opérationnel</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1"><Bot className="w-3 h-3" /> Gemini 3 Flash</span>
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> 25 Mars 2026</span>
            </div>
          </div>

          <div className="flex-1 overflow-hidden relative">
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
          </div>
        </main>

        {/* Settings Panel (Forced Open) */}
        {showSettings && (
          <aside className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto hidden xl:block shadow-xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-black text-gray-900">Paramètres</h3>
              <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-gray-900">
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>
            
            <div className="space-y-8">
              <section>
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Préférences IA</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-gray-100">
                    <span className="text-sm font-bold text-gray-700">Mode Recherche</span>
                    <div className="w-10 h-5 bg-[#008080] rounded-full relative">
                      <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-gray-100">
                    <span className="text-sm font-bold text-gray-700">Synthèse Vocale</span>
                    <div className="w-10 h-5 bg-[#008080] rounded-full relative">
                      <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Base de Données</h4>
                <div className="p-4 bg-[#008080]/5 rounded-xl border border-[#008080]/10">
                  <p className="text-xs text-[#008080] font-bold mb-2">Supabase Connecté</p>
                  <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#008080] h-full w-3/4"></div>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2">75% de stockage utilisé</p>
                </div>
              </section>

              <button className="w-full flex items-center justify-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all text-sm font-bold border border-red-100">
                <LogOut className="w-5 h-5" />
                <span>Déconnexion</span>
              </button>
            </div>
          </aside>
        )}
      </div>

      {/* Footer Status Bar */}
      <footer className="bg-white border-t border-gray-200 px-8 py-2 flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
        <div className="flex gap-4">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Système Opérationnel</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#008080]"></span> IA : Gemini 3 Flash</span>
        </div>
        <div>DouliaMed © 2026 — Partenaire d&apos;Excellence</div>
      </footer>
    </div>
  );
}
