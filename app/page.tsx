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
import { GoogleGenAI } from "@google/genai";
import { createClient } from '@supabase/supabase-js';

// --- Supabase Client ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- Constants ---
const WELCOME_MESSAGE = "Bienvenue, **Docteur Eposse**. Je suis **DouliaMed**, votre partenaire d'intelligence médicale exclusive.\n\nVoici un résumé des capacités majeures que j'intègre actuellement pour votre période de recherche :\n\n1. **Intelligence Scientifique (Gemini 3.1 Pro)** : Analyse de données complexes, aide au diagnostic et rédaction académique.\n2. **Veille en Temps Réel** : Accès aux dernières publications (PubMed, OMS) via ma recherche hybride.\n3. **Analyse de votre Bibliographie** : Résumé et synthèse de vos documents PDF ou Word téléchargés.\n4. **Interaction Vocale** : Posez vos questions à l'oral pour une fluidité totale.\n5. **Expertise en Biostatistiques** : Vérification de la cohérence de vos résultats (ANOVA, régressions, IC 95%).\n\nJe mets également à votre disposition des outils dédiés : Un **Générateur de Citations**, Un **Chronogramme de Recherche** et La **Visualisation de Données**.\n\nComment pouvons-nous faire progresser la science médicale aujourd'hui ?";

const SYSTEM_INSTRUCTION = "Tu es DouliaMed, l'intelligence médicale exclusive du Docteur Charlotte Eposse. RÈGLES DE RÉPONSE : 1. Mets TOUJOURS les TITRES et les MOTS-CLÉS en GRAS en utilisant la syntaxe markdown **TEXTE**. 2. Utilise TOUJOURS des LISTES NUMÉROTÉES (1., 2., 3.) pour les étapes ou niveaux. 3. Citer tes sources à la fin (ex: [Tavily: OMS 2024]). 4. Fais des sauts de ligne réguliers pour la clarté. 5. Ton ton est académique, rigoureux et respectueux.";

// --- Sub-components ---

const SessionsTab = ({ setActiveTab }: { setActiveTab: (tab: string) => void }) => {
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
    <div className="p-6 space-y-4 bg-transparent min-h-full">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Historique des Sessions</h2>
          <p className="text-xs text-gray-500">Retrouvez vos échanges précédents avec DouliaMed.</p>
        </div>
        <button 
          onClick={() => setActiveTab('chat')}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#008080] text-white text-xs font-bold hover:bg-[#006666] transition-all shadow-md rounded-lg"
        >
          <Plus className="w-4 h-4" /> Nouvelle Session
        </button>
      </div>
      
      <div className="grid gap-3">
        {isLoading ? (
          <div className="flex items-center gap-2 text-gray-400 text-xs">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Chargement...
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-gray-400 py-8 text-center border-2 border-dashed border-gray-100 rounded-2xl text-xs">
            Aucune session trouvée. Commencez une nouvelle discussion !
          </div>
        ) : (
          sessions.map(s => (
            <div 
              key={s.id} 
              onClick={() => setActiveTab('chat')}
              className="p-4 bg-white border border-gray-100 rounded-2xl hover:border-[#008080] transition-all cursor-pointer group shadow-sm"
            >
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-bold text-xs text-gray-800 group-hover:text-[#008080] transition-colors uppercase tracking-wide">
                  {s.role === 'user' ? 'Question du Docteur' : 'Réponse de DouliaMed'}
                </h3>
                <span className="text-[10px] text-gray-400 font-bold">{new Date(s.created_at).toLocaleDateString('fr-FR')}</span>
              </div>
              <p className="text-xs text-gray-500 line-clamp-1 leading-relaxed">{s.content}</p>
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

  const handleAction = (action: string) => {
    alert(`Action "${action}" en cours de préparation pour votre bibliothèque.`);
  };

  return (
    <div className="p-6 space-y-4 bg-transparent min-h-full">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Bibliothèque de Sources</h2>
          <p className="text-xs text-gray-500">Gérez vos documents de recherche et références académiques.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => handleAction('Ajouter un lien URL')}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-[#008080] text-[#008080] text-[11px] font-bold hover:bg-[#008080]/5 transition-all rounded-lg"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Lien URL
          </button>
          <button 
            onClick={() => handleAction('Téléverser un document')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#008080] text-white text-[11px] font-bold hover:bg-[#006666] transition-all shadow-md rounded-lg"
          >
            <Upload className="w-3.5 h-3.5" /> Téléverser
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sources.length === 0 ? (
          <div className="text-gray-400 col-span-full py-8 text-center border-2 border-dashed border-gray-100 rounded-2xl text-xs">
            Aucun document dans l&apos;archive médicale.
          </div>
        ) : (
          sources.map(s => (
            <div key={s.id} className="p-4 bg-white border border-gray-100 rounded-2xl group shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-[#008080]/10 flex items-center justify-center mb-3 text-[#008080]">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-xs text-gray-800 mb-0.5 group-hover:text-[#008080] transition-colors uppercase tracking-wide">{s.title}</h3>
              <p className="text-[10px] text-gray-400 mb-3">{s.author || 'Auteur inconnu'} • {s.type || 'PDF'}</p>
              <div className="flex gap-1.5">
                <button className="flex-1 text-[9px] py-1.5 border border-gray-100 rounded-md hover:bg-gray-50 transition-colors font-bold text-gray-500 uppercase">Vancouver</button>
                <button className="flex-1 text-[9px] py-1.5 border border-gray-100 rounded-md hover:bg-gray-50 transition-colors font-bold text-gray-500 uppercase">APA</button>
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
    <div className="p-6 space-y-4 bg-white min-h-full">
      <div>
        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Objectifs de Recherche</h2>
        <p className="text-xs text-gray-500">Gérez vos tâches et jalons pour votre concours d&apos;agrégation.</p>
      </div>

      <form onSubmit={addTask} className="flex gap-2">
        <input 
          type="text" 
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Ex: Finaliser l'analyse statistique..."
          className="flex-1 px-4 py-2 bg-slate-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#008080] transition-all text-xs"
        />
        <button type="submit" className="px-4 py-2 bg-[#008080] text-white rounded-lg text-xs font-bold hover:bg-[#006666] transition-all shadow-sm">
          Ajouter
        </button>
      </form>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        {tasks.map(t => (
          <div key={t.id} className="flex items-center gap-3 p-4 border-b border-gray-50 last:border-0 hover:bg-slate-50 transition-colors">
            <button 
              onClick={() => setTasks(tasks.map(task => task.id === t.id ? {...task, completed: !task.completed} : task))}
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                t.completed ? 'bg-[#008080] border-[#008080] text-white' : 'border-gray-200'
              }`}
            >
              {t.completed && <CheckSquare className="w-3 h-3" />}
            </button>
            <span className={`flex-1 text-xs font-bold ${t.completed ? 'text-gray-300 line-through' : 'text-gray-700'}`}>{t.text}</span>
            <button onClick={() => setTasks(tasks.filter(task => task.id !== t.id))} className="text-gray-300 hover:text-red-500 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
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
    <div className="p-6 space-y-6 bg-white min-h-full flex flex-col lg:flex-row gap-6">
      <div className="flex-1 space-y-4">
        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Chronogramme Critique</h2>
        <div className="relative pl-6 space-y-8 before:content-[''] before:absolute before:left-[9px] before:top-0 before:bottom-0 before:w-0.5 before:bg-gray-100">
          {events.map((e, i) => (
            <div key={i} className="relative">
              <div className="absolute -left-[23px] top-1 w-4 h-4 rounded-full bg-white border-2 border-[#008080] z-10" />
              <div className="p-4 bg-white border border-gray-100 rounded-2xl hover:shadow-md transition-all shadow-sm">
                <span className="text-[10px] font-black text-[#008080] uppercase tracking-wider">{e.date}</span>
                <h3 className="text-sm font-black text-gray-800 mt-0.5 uppercase tracking-wide">{e.title}</h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{e.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full lg:w-72 space-y-4">
        <div className="bg-slate-50 p-4 rounded-2xl border border-gray-100 shadow-inner">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Mars 2026</h3>
            <div className="flex gap-1.5">
              <button 
                onClick={() => alert("Mois précédent")}
                className="p-1 bg-white rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <ChevronRight className="w-3 h-3 rotate-180" />
              </button>
              <button 
                onClick={() => alert("Mois suivant")}
                className="p-1 bg-white rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-3">
            {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
              <div key={`${d}-${i}`} className="text-center text-[9px] font-black text-gray-400 uppercase">{d}</div>
            ))}
            {days.map(d => (
              <button 
                key={d} 
                className={`aspect-square flex items-center justify-center text-[10px] font-bold rounded-md transition-all ${
                  d === 25 ? 'bg-[#008080] text-white shadow-md shadow-[#008080]/20' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-50'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Notes du jour</h4>
            <textarea 
              placeholder="Ajoutez vos notes..."
              className="w-full bg-white border border-gray-200 rounded-lg p-2 text-[10px] focus:outline-none focus:border-[#008080] min-h-[80px]"
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
      <div className="flex-1 p-6 space-y-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Visualisation de Données</h2>
          <p className="text-xs text-gray-500">Interprétez vos statistiques de recherche avec des graphiques interactifs.</p>
        </div>

        <div className="bg-slate-50 p-6 rounded-2xl border border-gray-100 shadow-inner">
          <h3 className="text-sm font-black text-gray-800 mb-6 uppercase tracking-wide">Répartition des Pathologies Pédiatriques (Exemple)</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#008080" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#008080" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#00000010" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#00000040', fontSize: 10, fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#00000040', fontSize: 10, fontWeight: 'bold'}} />
                <Tooltip 
                  contentStyle={{backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)', fontWeight: 'bold', fontSize: '10px'}}
                />
                <Area type="monotone" dataKey="value" stroke="#008080" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-80 bg-white border-l border-gray-100 p-6 space-y-6 overflow-y-auto">
        <div className="space-y-4">
          <h3 className="font-black text-gray-900 flex items-center gap-2 text-base uppercase tracking-tight">
            <div className="p-1.5 bg-[#008080]/10 rounded-lg text-[#008080]">
              <FileSearch className="w-4 h-4" />
            </div>
            Interprétation IA
          </h3>
          
          <div className="space-y-3">
            <p className="text-xs text-gray-600 leading-relaxed">
              L&apos;analyse biostatistique des données visualisées révèle plusieurs points critiques :
            </p>
            
            <div className="p-3 bg-slate-50 rounded-xl border border-gray-100 space-y-2">
              <div className="flex gap-2">
                <div className="w-1 h-1 rounded-full bg-[#008080] mt-1.5 shrink-0" />
                <p className="text-[10px] text-gray-700 leading-tight"><span className="font-black">Tendance Significative :</span> Une corrélation positive forte (r &gt; 0.75) est observée.</p>
              </div>
              <div className="flex gap-2">
                <div className="w-1 h-1 rounded-full bg-[#008080] mt-1.5 shrink-0" />
                <p className="text-[10px] text-gray-700 leading-tight"><span className="font-black">Stabilité :</span> L&apos;écart-type reste dans les limites de confiance de 95%.</p>
              </div>
              <div className="flex gap-2">
                <div className="w-1 h-1 rounded-full bg-[#008080] mt-1.5 shrink-0" />
                <p className="text-[10px] text-gray-700 leading-tight"><span className="font-black">Projection :</span> Une croissance soutenue est anticipée.</p>
              </div>
            </div>
          </div>
        </div>

        <button 
          onClick={() => alert("Exportation du rapport biostatistique en cours...")}
          className="w-full py-3 bg-[#008080] text-white rounded-xl font-black text-xs hover:bg-[#006666] transition-all shadow-md shadow-[#008080]/10 flex items-center justify-center gap-2"
        >
          <Download className="w-3.5 h-3.5" /> Exporter le Rapport
        </button>
      </div>
    </div>
  );
};

const AnalyseTab = () => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = () => {
    if (!preview) {
      alert("Veuillez d'abord sélectionner un cliché.");
      return;
    }
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      alert("Analyse terminée. Rapport préliminaire disponible.");
    }, 3000);
  };

  const handleFileSelect = () => {
    setPreview("https://picsum.photos/seed/medical/800/800");
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto bg-white min-h-full">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Analyse d&apos;Imagerie Médicale</h2>
        <p className="text-xs text-gray-500 max-w-xl mx-auto">Utilisez l&apos;IA pour assister votre diagnostic sur radios, scanners et IRM.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div 
            onClick={handleFileSelect}
            className="aspect-square bg-slate-50 border-2 border-dashed border-gray-200 rounded-[32px] flex flex-col items-center justify-center p-8 transition-all hover:border-[#008080] group cursor-pointer shadow-inner relative overflow-hidden"
          >
            {preview ? (
              <div className="relative w-full h-full">
                <Image src={preview} alt="Aperçu médical" fill className="object-contain rounded-xl" />
                <button 
                  onClick={(e) => { e.stopPropagation(); setPreview(null); }} 
                  className="absolute top-3 right-3 p-1.5 bg-white/80 rounded-full shadow-md text-gray-800 hover:bg-white"
                >
                  <Plus className="w-3.5 h-3.5 rotate-45" />
                </button>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 rounded-2xl bg-[#008080]/5 flex items-center justify-center mb-4 text-[#008080] group-hover:scale-110 transition-transform shadow-sm">
                  <Upload className="w-8 h-8" />
                </div>
                <p className="font-black text-gray-900 text-base uppercase tracking-tight">Téléversement</p>
                <button className="mt-3 px-4 py-1.5 bg-white border border-gray-200 rounded-lg text-[11px] font-bold text-gray-700 hover:bg-gray-50 transition-all">
                  Sélectionner un cliché
                </button>
                <p className="text-[9px] text-gray-400 mt-4 font-black uppercase tracking-widest">DICOM, JPG, PNG</p>
              </>
            )}
          </div>

          <button 
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="w-full py-4 bg-[#008080] text-white rounded-2xl font-black text-base shadow-lg shadow-[#008080]/10 hover:bg-[#006666] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            {isAnalyzing ? "Analyse..." : "Lancer l'Analyse"}
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-900 rounded-[32px] p-6 text-white h-full shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <Bot className="w-24 h-24" />
            </div>
            
            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black flex items-center gap-2 uppercase tracking-tight">
                  <div className="p-1.5 bg-white/10 rounded-lg">
                    <FileText className="w-4 h-4 text-[#008080]" />
                  </div>
                  Rapport IA
                </h3>
                <span className="px-2 py-0.5 bg-[#008080] text-[8px] font-black uppercase tracking-widest rounded-full">Demo</span>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <h4 className="text-[9px] font-black text-[#008080] uppercase tracking-widest">Exemple de Rapport</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Téléversez un cliché pour une analyse réelle. Voici à quoi ressemblera votre rapport d&apos;assistance.
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-white/10">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-300">Confiance Diagnostic</span>
                    <span className="text-xs font-black text-[#008080]">98.2%</span>
                  </div>
                  <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#008080] h-full w-[98%]"></div>
                  </div>
                </div>

                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                  <p className="text-[11px] text-gray-400 italic leading-relaxed">
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

// --- Chat Component ---

const ChatTab = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
  const tavilyKey = process.env.NEXT_PUBLIC_TAVILY_API_KEY || "";
  const ai = new GoogleGenAI({ apiKey });

  useEffect(() => {
    const loadMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (data && data.length > 0) {
        setMessages(data);
      } else {
        setMessages([{
          id: 'welcome',
          role: 'assistant',
          content: WELCOME_MESSAGE,
          created_at: new Date().toISOString()
        }]);
      }
    };
    loadMessages();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
      // @ts-ignore
      const html2pdf = (await import('html2pdf.js')).default;
      const opt = {
        margin: 1,
        filename: `DouliaMed_Response_${messageId}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' as const }
      };
      html2pdf().set(opt).from(element).save();
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
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
      recognition.onend = () => { if (isListening) recognition.start(); };
      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
        }
        if (finalTranscript) setInput(prev => prev + (prev ? ' ' : '') + finalTranscript);
      };
      recognitionRef.current = recognition;
      recognition.start();
    } else {
      alert("La reconnaissance vocale n'est pas supportée.");
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
    await supabase.from('messages').insert([userMsg]);

    try {
      setStatusMessage('Recherche hybride en cours...');
      // Tavily search
      let tavilyCtx = "";
      if (tavilyKey) {
        const tRes = await fetch('https://api.tavily.com/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ api_key: tavilyKey, query: userText, search_depth: "advanced", max_results: 3 })
        });
        const tData = await tRes.json();
        tavilyCtx = tData.results?.map((r: any) => `[Web: ${r.title}] ${r.content}`).join('\n\n') || "";
      }

      const chat = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: { systemInstruction: SYSTEM_INSTRUCTION },
        history: messages.map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }]
        }))
      });

      const result = await chat.sendMessage({ message: `CONTEXTE WEB:\n${tavilyCtx}\n\nQUESTION: ${userText}` });
      const assistantMsg = { role: 'assistant', content: result.text, created_at: new Date().toISOString() };
      setMessages(prev => [...prev, assistantMsg]);
      await supabase.from('messages').insert([assistantMsg]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Erreur de génération.", created_at: new Date().toISOString() }]);
    } finally {
      setIsGenerating(false);
      setStatusMessage('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => (
            <motion.div
              key={msg.id || idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className={`flex gap-4 group ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
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
                    <div className="prose prose-sm max-w-none prose-headings:text-[#008080] prose-strong:text-[#008080]">
                      <div dangerouslySetInnerHTML={{ 
                        __html: msg.content
                          .replace(/\*\*(.*?)\*\*/g, '<span class="text-[#008080] font-black">$1</span>')
                          .replace(/^\s*\d+\.\s/gm, (match: string) => `<span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#008080] text-white text-[9px] font-black mr-2">${match.trim().split('.')[0]}</span>`)
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
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isGenerating && (
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-lg bg-[#008080]/10 flex items-center justify-center text-[#008080]">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-slate-50/50 p-3 rounded-xl rounded-tl-none border border-slate-100">
              <span className="text-[10px] font-bold text-[#008080] uppercase tracking-wider">{statusMessage}</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="px-6 py-4 bg-white/80 backdrop-blur-sm border-t border-gray-100">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="relative flex items-center gap-2 bg-slate-50 border border-gray-200 p-1.5 rounded-xl shadow-inner focus-within:border-[#008080] transition-all">
            <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.doc,.docx,image/*" />
            <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-400 hover:text-[#008080] transition-colors rounded-lg hover:bg-white">
              <Paperclip className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Posez votre question médicale..."
              className="flex-1 bg-transparent border-none py-2 text-gray-800 placeholder-gray-400 focus:outline-none text-[13px] font-medium"
            />
            <button type="button" onClick={toggleListening} className={`p-2 transition-colors rounded-lg hover:bg-white ${isListening ? 'text-red-500 bg-red-50 animate-pulse' : 'text-gray-400 hover:text-[#008080]'}`}>
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <button type="submit" disabled={isGenerating || !input.trim()} className={`p-2 rounded-lg transition-all ${input.trim() ? 'bg-[#008080] text-white shadow-md hover:scale-105' : 'bg-gray-200 text-gray-400'}`}>
              <Send className="w-5 h-5" />
            </button>
          </form>
          <div className="mt-2 flex justify-center gap-8 text-[8px] font-black text-gray-300 uppercase tracking-[0.3em]">
            <span>PROPULSÉ PAR DOULIA</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main Page ---

export default function Home() {
  const [activeTab, setActiveTab] = useState('chat');
  const [showSettings, setShowSettings] = useState(true);

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
    <div className="flex flex-col h-screen bg-transparent text-gray-800 overflow-hidden font-sans">
      <header className="bg-white/70 backdrop-blur-md border-b border-gray-200/50 px-6 py-2 flex flex-col md:flex-row items-center justify-between z-50 shadow-sm gap-4">
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-[#008080]/20">
            <Image 
              src="https://i.postimg.cc/v8hD1LQP/Whats_App_Image_2026_03_24_at_06_04_08.jpg" 
              alt="DouliaMed Logo" 
              fill 
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight text-gray-900">DouliaMed</h1>
            <p className="text-[8px] text-[#008080] font-bold uppercase tracking-widest">Assistant Médical IA</p>
          </div>
        </div>

        <nav className="flex flex-wrap justify-center gap-1 bg-slate-100/50 p-1 rounded-lg border border-gray-200/50">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-bold transition-all ${
                activeTab === tab.id 
                  ? 'bg-[#008080] text-white shadow-sm' 
                  : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <tab.icon className={`w-3.5 h-3.5 ${activeTab === tab.id ? 'text-white' : 'text-gray-400'}`} />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="text-right hidden lg:block">
            <p className="text-xs font-bold text-gray-900">Dr. Charlotte Eposse</p>
            <p className="text-[9px] text-[#008080] font-bold uppercase tracking-widest">Pédiatre & Chercheuse</p>
          </div>
          <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-[#008080]">
            <Image 
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Charlotte" 
              alt="Avatar Docteur" 
              fill 
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={`p-1.5 rounded-md transition-colors ${showSettings ? 'text-[#008080] bg-[#008080]/10' : 'text-gray-400 hover:text-gray-900'}`}
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 overflow-hidden relative flex flex-col">
          <div className="flex-1 overflow-hidden relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="h-full overflow-y-auto scrollbar-hide">
                  {activeTab === 'chat' && <ChatTab />}
                  {activeTab === 'sessions' && <SessionsTab setActiveTab={setActiveTab} />}
                  {activeTab === 'sources' && <SourcesTab />}
                  {activeTab === 'tasks' && <TasksTab />}
                  {activeTab === 'chrono' && <ChronoTab />}
                  {activeTab === 'visu' && <VisuTab />}
                  {activeTab === 'analyse' && <AnalyseTab />}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {showSettings && (
          <aside className="w-72 bg-white/80 backdrop-blur-md border-l border-gray-200 p-5 overflow-y-auto hidden xl:block shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-black text-gray-900 uppercase tracking-tight">Paramètres</h3>
              <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
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
