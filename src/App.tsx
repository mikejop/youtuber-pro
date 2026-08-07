import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Folder, FolderOpen, FileText, ChevronRight, ChevronDown, ChevronLeft,
  Play, Clock, ArrowRight, Sparkles, CheckCircle2, Circle, Lock, 
  PanelLeftClose, PanelLeft, X, Search, Menu, Target, Wrench, 
  Image as ImageIcon, Shield, Star, GraduationCap, RefreshCw, Layers, Check, Copy, AlertTriangle, PlayCircle, BookOpen, Volume2,
  Compass, Mic, Camera, Sun, Video, Scissors, Palette, Activity, Plus, Upload, User, LogIn, LogOut, Mail, Phone, Eye, EyeOff, Trash2
} from 'lucide-react';
import { modulesData } from './data';
import { UserProgress, CourseModule, ModuleId, Subtopic } from './types';

// Helper to render Apple-style module icons
const getModuleIcon = (modId: ModuleId, isCurrent: boolean) => {
  const colorClass = isCurrent ? 'text-[#0071e3]' : 'text-[#86868b]';
  const size = 20;
  switch (modId) {
    case 'intro':
      return <Compass size={size} className={colorClass} />; // Safari Style
    case 'mod1':
      return <BookOpen size={size} className={colorClass} />; // A Ideia Style
    case 'mod2':
      return <Camera size={size} className={colorClass} />; // Equipamentos Style
    case 'mod3':
      return <Sun size={size} className={colorClass} />; // Cenário Style
    case 'mod4':
      return <Video size={size} className={colorClass} />; // Filmagem Style
    case 'mod5':
      return <Scissors size={size} className={colorClass} />; // Edição Style
    case 'mod6':
      return <Volume2 size={size} className={colorClass} />; // Som Style
    case 'mod7':
      return <Palette size={size} className={colorClass} />; // Color Grading Style
    case 'mod8':
      return <Upload size={size} className={colorClass} />; // Deliver Style (Represented by export icon)
    case 'mod9':
      return <Activity size={size} className={colorClass} />; // Métricas Style
    default:
      return <Folder size={size} className={colorClass} />;
  }
};

const getModuleName = (title: string | undefined): string => {
  if (!title) return '';
  const cleaned = title
    .replace(/^MÓDULO\s+\d+:\s*/i, '')
    .replace(/^INTRODUÇÃO:\s*/i, '')
    .trim();
  if (cleaned.startsWith('Deliver')) {
    return 'Deliver';
  }
  return cleaned;
};

// Importing the interactive modules
import AceleracaoManager from './components/AceleracaoManager';
import AvEditorTeleprompter from './components/AvEditorTeleprompter';
import CenarioPlanner from './components/CenarioPlanner';
import Iluminacao3Pontos from './components/Iluminacao3Pontos';
import ExposureCalculator from './components/ExposureCalculator';
import PudovkinSequencer from './components/PudovkinSequencer';
import AudioMixer from './components/AudioMixer';
import ColorwheelsGrading from './components/ColorwheelsGrading';
import CtrSimulator from './components/CtrSimulator';
import DeliverExporter from './components/DeliverExporter';
import IdeationFlowchart from './components/IdeationFlowchart';
import InteractiveIdeationTheory from './components/InteractiveIdeationTheory';
import LiquidGlass from './components/LiquidGlass';
import DefinirSenha from './components/DefinirSenha';
import EsqueciSenha from './components/EsqueciSenha';
import CriarContaCheckout from './components/CriarContaCheckout';
import Preloader from './components/Preloader';
import SupabaseLoginModal from './components/SupabaseLoginModal';
import StripeCheckoutModal from './components/StripeCheckoutModal';
import { supabase } from './lib/supabase';
import { handleStripeCheckout } from './lib/stripe';
import { sanitizeText, rateLimiter } from './lib/security';
import { getMediaUrl } from './lib/storage';

const STORAGE_KEY = 'youtuber_pro_academy_progress';
const LOGIN_KEY = 'youtuber_pro_academy_logged';
const PROFILE_KEY = 'youtuber_pro_academy_profile';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword?: string;
  avatar: string;
}

const DEFAULT_PROFILE: UserProfile = {
  firstName: 'Dan',
  lastName: 'Rocha',
  email: 'dojoacademybr@gmail.com',
  phone: '(11) 98765-4321',
  password: '••••••••',
  confirmPassword: '••••••••',
  avatar: getMediaUrl('banners/hero_01.webp')
};

const DEFAULT_PROGRESS: UserProgress = {
  completedModules: [],
  completedLessons: [],
  checklistStates: {},
  challengeDrafts: {},
  notes: {},
  scriptEditorAudio: '',
  scriptEditorVideo: '',
  activeTab: {}
};

const BG_VIDEOS = [
  getMediaUrl('bg/02.webm')
];

const BG_IMAGES = [
  getMediaUrl('bg/02.webp')
];

const HERO_IMAGES = [
  getMediaUrl('banners/hero_01.webp'),
  getMediaUrl('banners/hero_02.webp'),
  getMediaUrl('banners/hero_03.webp'),
  getMediaUrl('banners/hero_04.webp')
];

function shuffleIndices(length: number): number[] {
  const indices = Array.from({ length }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices;
}

// FAQS
const FAQ_ITEMS = [
  { q: "Preciso de câmera cara para começar?", a: "Absolutamente não! No Módulo 04, mostramos como extrair imagem de cinema usando celulares intermediários através de exposição e iluminação estratégica de 3 pontos." },
  { q: "As ferramentas recomendadas são gratuitas?", a: "Sim, todos os assets do Kit de Aceleração são 100% gratuitos, livres de direitos autorais e prontos para uso comercial no YouTube." },
  { q: "Como funciona a garantia de 7 dias?", a: "Se você achar que o guia não serve para seu canal, envie um e-mail em até 7 dias e devolveremos seu valor integralmente, sem questionamentos." },
  { q: "Terei acesso vitalício?", a: "Sim, adquirindo o Guia de Sobrevivência hoje você garante acesso a todas as atualizações futuras e novas ferramentas de simulação." }
];

// DEPOIMENTOS
const TESTIMONIALS = [
  { name: "Thiago Rocha", title: "CRIADOR COM 120K INSCRITOS", text: "O simulador de 3 pontos mudou meu set de gravação. Meus vídeos parecem gravados em estúdio de TV agora!", rating: 5 },
  { name: "Mariana Alencar", title: "VIDEOMAKER INDEPENDENTE", text: "As fórmulas de áudio e a regra de Pudovkin me salvaram de dezenas de horas de edição travada. Recomendadíssimo!", rating: 5 },
  { name: "Pedro Mendes", title: "CRIADOR DE CONTEÚDO TECH", text: "O Teleprompter integrado e o sequenciador de ganchos narratives me ajudaram a dobrar minha retenção média no YouTube.", rating: 5 }
];

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [progress, setProgress] = useState<UserProgress>(DEFAULT_PROGRESS);
  const [activeModuleId, setActiveModuleId] = useState<ModuleId>('intro');
  const [activeLessonId, setActiveLessonId] = useState<string>(''); // empty means Dashboard
  const [activeTab, setActiveTab] = useState<'teoria' | 'pratica' | 'desafio' | 'checklist'>('teoria');
  
  const [bgPlaylist, setBgPlaylist] = useState<number[]>(() => shuffleIndices(BG_VIDEOS.length));
  const [playlistIndex, setPlaylistIndex] = useState<number>(0);
  const currentBgIndex = bgPlaylist[playlistIndex] ?? 0;

  // Random hero banner image on page load / F5 refresh
  const [randomHeroIndex] = useState<number>(() => {
    return Math.floor(Math.random() * (HERO_IMAGES.length || 1));
  });
  const [heroScrollY, setHeroScrollY] = useState<number>(0);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState<boolean>(() => {
    return localStorage.getItem(LOGIN_KEY) === 'true';
  });
  const [isMaximized, setIsMaximized] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isExclusiveModalOpen, setIsExclusiveModalOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isSupabaseLoginOpen, setIsSupabaseLoginOpen] = useState<boolean>(false);
  const [isPaidUser, setIsPaidUser] = useState<boolean>(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState<boolean>(false);
  const [checkoutModalInfo, setCheckoutModalInfo] = useState<{ title?: string; description?: string }>({});
  const [copiedChallengeId, setCopiedChallengeId] = useState<string | null>(null);

  // Route state for /definir-senha and /esqueci-senha
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    if (path.includes('/definir-senha') || hash.includes('type=recovery') || hash.includes('type=invite')) {
      return 'definir-senha';
    }
    if (path.includes('/esqueci-senha')) {
      return 'esqueci-senha';
    }
    if (path.includes('/criar-conta')) {
      return 'criar-conta';
    }
    return 'main';
  });
  
  // Timer for Urgency Section
  const [countdown, setCountdown] = useState<string>("14:59");
  const [expandedFAQ, setExpandedFAQ] = useState<Record<number, boolean>>({});
  const [expandedEmenta, setExpandedEmenta] = useState<Record<string, boolean>>({});
  const [activeFlyoutModule, setActiveFlyoutModule] = useState<string | null>(null);
  const [hoveredTrafficLight, setHoveredTrafficLight] = useState<boolean>(false);
  const [activePreviewVideo, setActivePreviewVideo] = useState<boolean>(false);
  const [hoveredModuleIndex, setHoveredModuleIndex] = useState<number | null>(null);
  const [hoveredLessonIndex, setHoveredLessonIndex] = useState<number | null>(null);

  // Liquid Glass Procedural Distortion Parameters
  const [glassDistortionScale, setGlassDistortionScale] = useState<number>(25);
  const [glassBaseFrequency, setGlassBaseFrequency] = useState<number>(0.012);

  // User Profile state
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(PROFILE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading profile:', e);
      }
    }
    return DEFAULT_PROFILE;
  });

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState<boolean>(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [saveToastVisible, setSaveToastVisible] = useState<boolean>(false);

  const saveToastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  // Auto-save user profile (com sanitização XSS)
  const updateUserProfile = (fields: Partial<UserProfile>) => {
    const sanitizedFields: Partial<UserProfile> = {};
    if (fields.firstName) sanitizedFields.firstName = sanitizeText(fields.firstName);
    if (fields.lastName) sanitizedFields.lastName = sanitizeText(fields.lastName);
    if (fields.email) sanitizedFields.email = sanitizeText(fields.email);

    setUserProfile(prev => {
      const updated = { ...prev, ...fields, ...sanitizedFields };
      localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
      return updated;
    });

    setSaveToastVisible(true);
    if (saveToastTimeoutRef.current) clearTimeout(saveToastTimeoutRef.current);
    saveToastTimeoutRef.current = setTimeout(() => {
      setSaveToastVisible(false);
    }, 2000);
  };

  // Close profile dropdown menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        updateUserProfile({ avatar: result });
      }
    };
    reader.readAsDataURL(file);
  };

  const flyoutTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setProgress({
          ...DEFAULT_PROGRESS,
          ...parsed
        });
      } catch (e) {
        console.error('Error loading progress:', e);
      }
    }

    const savedLogged = localStorage.getItem(LOGIN_KEY);
    if (savedLogged === 'true') {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
      setIsSidebarExpanded(false);
    }

    // Helper para verificar status de pagamento (1º no Supabase, 2º Fallback na Stripe API + Auto-sync)
    const checkSubscriptionStatus = async (userId: string, email: string) => {
      try {
        const cleanEmail = email.toLowerCase().trim();

        // PASSO 1: Busca direta no Supabase (Tabela 'subscribers')
        const { data: subData } = await supabase
          .from('subscribers')
          .select('status')
          .or(`id.eq.${userId},email.eq.${cleanEmail}`)
          .maybeSingle();

        if (subData?.status === 'active') {
          console.log('✅ Acesso liberado via Supabase Database:', cleanEmail);
          setIsPaidUser(true);
          return;
        }

        // PASSO 2: Fallback para a API da Stripe via Edge Function
        console.log('🔍 Não encontrado como ativo no Supabase. Verificando na API da Stripe...', cleanEmail);
        const res = await fetch('https://txmaffxbrmxlzakxathe.supabase.co/functions/v1/check-subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail, userId }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.paid) {
            console.log('✅ Acesso liberado via Stripe API (sincronizado no Supabase):', cleanEmail);
            setIsPaidUser(true);
            return;
          }
        }

        setIsPaidUser(false);
      } catch (e) {
        console.warn('⚠️ Erro ao verificar assinatura:', e);
        setIsPaidUser(false);
      }
    };

    // Check Supabase Auth active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setIsLoggedIn(true);
        localStorage.setItem(LOGIN_KEY, 'true');
        if (session.user.email) {
          setUserProfile(prev => ({ ...prev, email: session.user.email || prev.email }));
          checkSubscriptionStatus(session.user.id, session.user.email);
        }
      } else {
        setIsPaidUser(false);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setIsLoggedIn(true);
        localStorage.setItem(LOGIN_KEY, 'true');
        if (session.user.email) {
          setUserProfile(prev => ({ ...prev, email: session.user.email || prev.email }));
          checkSubscriptionStatus(session.user.id, session.user.email);
        }
      } else if (event === 'SIGNED_OUT') {
        setIsLoggedIn(false);
        setIsPaidUser(false);
        localStorage.setItem(LOGIN_KEY, 'false');
      }
    });

    // Protection Context Menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  // Background rotador (WebM video rotation + 100ms crossfade)
  useEffect(() => {
    if (BG_VIDEOS.length <= 1) return;

    const interval = setInterval(() => {
      setPlaylistIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        if (nextIndex < bgPlaylist.length) {
          return nextIndex;
        } else {
          let newPlaylist = shuffleIndices(BG_VIDEOS.length);
          if (BG_VIDEOS.length > 1 && newPlaylist[0] === bgPlaylist[prevIndex]) {
            const swapIdx = 1;
            [newPlaylist[0], newPlaylist[swapIdx]] = [newPlaylist[swapIdx], newPlaylist[0]];
          }
          setBgPlaylist(newPlaylist);
          return 0;
        }
      });
    }, 120000);

    return () => clearInterval(interval);
  }, [bgPlaylist.length]);

  // Countdown Timer Simulation
  useEffect(() => {
    let seconds = 899; // 14m 59s
    const timer = setInterval(() => {
      if (seconds <= 0) {
        seconds = 899; // reset loop
      } else {
        seconds--;
      }
      const m = Math.floor(seconds / 60).toString().padStart(2, '0');
      const s = (seconds % 60).toString().padStart(2, '0');
      setCountdown(`${m}:${s}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Save progress helper
  const saveProgress = (newProgress: UserProgress) => {
    setProgress(newProgress);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    localStorage.setItem(LOGIN_KEY, 'true');
    setIsExclusiveModalOpen(false);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Note on signOut:', e);
    }
    setIsLoggedIn(false);
    localStorage.setItem(LOGIN_KEY, 'false');
    setActiveLessonId('');
    setIsSidebarExpanded(false);
  };

  const handleToggleMaximize = () => {
    setIsMaximized(prev => !prev);
  };

  // Toggle lesson complete
  const handleToggleLessonComplete = (lessonId: string) => {
    if (!isLoggedIn) {
      setIsExclusiveModalOpen(true);
      return;
    }

    const completed = [...progress.completedLessons];
    const isCompleted = completed.includes(lessonId);
    
    let nextCompleted;
    if (isCompleted) {
      nextCompleted = completed.filter(id => id !== lessonId);
    } else {
      nextCompleted = [...completed, lessonId];
    }

    const finalCompletedModules = [...progress.completedModules];
    modulesData.forEach(m => {
      const allLessonsCompleted = m.subtopics.every(s => nextCompleted.includes(s.id));
      const hasCompletedRecord = finalCompletedModules.includes(m.id);
      
      if (allLessonsCompleted && !hasCompletedRecord) {
        finalCompletedModules.push(m.id);
      } else if (!allLessonsCompleted && hasCompletedRecord) {
        const index = finalCompletedModules.indexOf(m.id);
        if (index > -1) finalCompletedModules.splice(index, 1);
      }
    });
    
    saveProgress({ 
      ...progress, 
      completedLessons: nextCompleted,
      completedModules: finalCompletedModules
    });
  };

  // Toggle checklist item progress
  const handleToggleChecklist = (itemId: string) => {
    if (!isLoggedIn) {
      setIsExclusiveModalOpen(true);
      return;
    }
    const nextStates = { ...progress.checklistStates, [itemId]: !progress.checklistStates[itemId] };
    saveProgress({ ...progress, checklistStates: nextStates });
  };

  // Form field challenge draft changes
  const handleChallengeFieldChange = (challengeId: string, key: string, value: string) => {
    if (!isLoggedIn) {
      setIsExclusiveModalOpen(true);
      return;
    }
    const drafts = { ...progress.challengeDrafts };
    if (!drafts[challengeId]) {
      drafts[challengeId] = {};
    }
    drafts[challengeId][key] = value;
    saveProgress({ ...progress, challengeDrafts: drafts });
  };

  // Notes change
  const handleNotesChange = (modId: string, text: string) => {
    if (!isLoggedIn) {
      setIsExclusiveModalOpen(true);
      return;
    }
    const nextNotes = { ...progress.notes, [modId]: text };
    saveProgress({ ...progress, notes: nextNotes });
  };

  const handleCopyChallenge = (challengeId: string, fields: any[]) => {
    let copyText = `📋 PLANO DE ESTUDO & EXERCÍCIO\n`;
    copyText += `==============================================\n\n`;
    
    const draft = progress.challengeDrafts[challengeId] || {};
    fields.forEach(field => {
      const val = draft[field.key] || '';
      copyText += `👉 ${field.label}:\n   ${val || 'Não preenchido.'}\n\n`;
    });

    navigator.clipboard.writeText(copyText);
    setCopiedChallengeId(challengeId);
    setTimeout(() => setCopiedChallengeId(null), 2000);
  };

  const handleNextLesson = () => {
    if (!activeLessonId) return;
    const currentModule = modulesData.find(m => m.id === activeModuleId);
    if (!currentModule) return;

    const currentIdx = currentModule.subtopics.findIndex(s => s.id === activeLessonId);
    if (currentIdx < currentModule.subtopics.length - 1) {
      const nextLesson = currentModule.subtopics[currentIdx + 1];
      setActiveLessonId(nextLesson.id);
      setActiveTab('teoria');
    } else {
      const moduleIdx = modulesData.findIndex(m => m.id === activeModuleId);
      if (moduleIdx < modulesData.length - 1) {
        const nextMod = modulesData[moduleIdx + 1];
        setActiveModuleId(nextMod.id);
        setActiveLessonId(nextMod.subtopics[0].id);
        setActiveTab('teoria');
      } else {
        // finished course or go to dashboard
        setActiveLessonId('');
      }
    }
  };

  const handlePrevLesson = () => {
    if (!activeLessonId) return;
    const currentModule = modulesData.find(m => m.id === activeModuleId);
    if (!currentModule) return;

    const currentIdx = currentModule.subtopics.findIndex(s => s.id === activeLessonId);
    if (currentIdx > 0) {
      const prevLesson = currentModule.subtopics[currentIdx - 1];
      setActiveLessonId(prevLesson.id);
      setActiveTab('teoria');
    } else {
      const moduleIdx = modulesData.findIndex(m => m.id === activeModuleId);
      if (moduleIdx > 0) {
        const prevMod = modulesData[moduleIdx - 1];
        setActiveModuleId(prevMod.id);
        setActiveLessonId(prevMod.subtopics[prevMod.subtopics.length - 1].id);
        setActiveTab('teoria');
      }
    }
  };

  // Find the module that actually owns the activeLessonId, or fallback to activeModuleId
  const activeModule = activeLessonId 
    ? (modulesData.find(m => m.subtopics.some(s => s.id === activeLessonId)) || modulesData.find(m => m.id === activeModuleId) || modulesData[0])
    : (modulesData.find(m => m.id === activeModuleId) || modulesData[0]);

  const activeLesson = activeModule?.subtopics.find(s => s.id === activeLessonId);

  // Total lessons count
  const totalLessons = modulesData.reduce((acc, m) => acc + m.subtopics.length, 0);
  const completedCount = progress.completedLessons.length;
  const percentComplete = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  // Search results calculation
  const searchResults = searchQuery.trim() 
    ? modulesData.flatMap(m => 
        m.subtopics
          .filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()) || s.concept.toLowerCase().includes(searchQuery.toLowerCase()))
          .map(s => ({ module: m, lesson: s }))
      )
    : [];

  const handleSelectSearchResult = (modId: ModuleId, lessonId: string) => {
    setActiveModuleId(modId);
    setActiveLessonId(lessonId);
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  // Route-based early rendering for /definir-senha and /esqueci-senha
  if (currentRoute === 'definir-senha') {
    return <DefinirSenha onSuccessRedirect={() => { setCurrentRoute('main'); window.location.href = '/'; }} />;
  }

  if (currentRoute === 'esqueci-senha') {
    return <EsqueciSenha onBackToLogin={() => setCurrentRoute('main')} />;
  }

  if (currentRoute === 'criar-conta') {
    return <CriarContaCheckout onBackToMain={() => setCurrentRoute('main')} />;
  }

  // Flyout on hover for collapsed sidebar
  const handleModuleMouseEnter = (modId: string) => {
    if (isSidebarExpanded) return;
    if (flyoutTimeoutRef.current) clearTimeout(flyoutTimeoutRef.current);
    setActiveFlyoutModule(modId);
  };

  const handleModuleMouseLeave = () => {
    if (isSidebarExpanded) return;
    flyoutTimeoutRef.current = setTimeout(() => {
      setActiveFlyoutModule(null);
    }, 150);
  };

  // Render the interactive tools inside 'Na Prática' block
  const renderInteractiveTool = (moduleId: ModuleId) => {
    switch (moduleId) {
      case 'intro': return <AceleracaoManager />;
      case 'mod1': return <AvEditorTeleprompter />;
      case 'mod2': return <Iluminacao3Pontos />;
      case 'mod3': return <CenarioPlanner />;
      case 'mod4': return <ExposureCalculator />;
      case 'mod5': return <PudovkinSequencer />;
      case 'mod6': return <AudioMixer />;
      case 'mod7': return <ColorwheelsGrading />;
      case 'mod8': return <DeliverExporter />;
      case 'mod9': return <CtrSimulator />;
      default: return null;
    }
  };

  return (
    <div className="h-screen w-screen bg-[#000000] text-[#f5f5f7] flex items-center justify-center font-sans overflow-hidden selection:bg-[#0071e3]/30 selection:text-white relative" id="app-viewport-root">
      
      {/* High-End Page Preloader */}
      <Preloader />

      {/* Background Geral (Vídeos WebM em Loop com Crossfade de 100ms) */}
      <div className="hidden md:block absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentBgIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.1,
              ease: 'easeInOut'
            }}
            className="absolute inset-0 w-full h-full"
          >
            {BG_VIDEOS[currentBgIndex]?.toLowerCase().endsWith('.webm') ? (
              <video
                src={BG_VIDEOS[currentBgIndex]}
                autoPlay
                muted
                playsInline
                onEnded={(e) => {
                  e.currentTarget.pause();
                }}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div
                className="absolute inset-0 w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${BG_VIDEOS[currentBgIndex]})` }}
              />
            )}
          </motion.div>
        </AnimatePresence>
        {/* Subtle Dark Contrast Overlay */}
        <div className="absolute inset-0 bg-black/25 backdrop-blur-xs" />
      </div>

      {/* Procedural SVG Glass Distortion Filter */}
      <svg className="absolute w-0 h-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <defs>
          <filter id="liquid-glass-distortion" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency={glassBaseFrequency}
              numOctaves={2}
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={glassDistortionScale}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* ALWAYS RENDER THE FINDER WINDOW */}
      <motion.div 
        layout
        transition={{
          layout: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }, // Ultra-smooth easy-out transition
          default: { ease: "easeOut" }
        }}
        style={{
          backdropFilter: `url(#liquid-glass-distortion) blur(4px)`,
          WebkitBackdropFilter: `url(#liquid-glass-distortion) blur(4px)`
        }}
        className={`w-full h-full ${isMaximized ? 'md:w-full md:h-full rounded-none border-none' : `${isLoggedIn ? 'md:w-[85vw]' : 'md:w-[70vw]'} md:h-[95vh] rounded-[24px] border border-white/15 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)]`} bg-[#121214]/80 flex flex-col md:flex-row overflow-hidden relative z-10`} 
        id="finder-window"
      >
          
          {/* SIDEBAR */}
          <aside className={`${isSidebarExpanded ? 'w-56' : 'w-16'} bg-transparent border-r border-white/10 flex flex-col shrink-0 overflow-y-auto select-none transition-all duration-300 relative`} id="window-sidebar">
            
            {/* Liquid Glass Organic Floating Blobs (Neutral frosted effect) */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-15">
              <div className="absolute -top-10 -left-10 w-32 h-32 bg-white/20 rounded-full blur-[45px] animate-pulse" />
              <div className="absolute bottom-1/4 -right-12 w-24 h-24 bg-white/10 rounded-full blur-[40px] animate-pulse" style={{ animationDelay: '2s' }} />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-32 bg-white/15 rounded-full blur-[35px]" />
            </div>
            
            {/* Sidebar Header: Traffic Lights & Collapse Button */}
            <div className={`h-14 border-b border-white/15 bg-transparent flex items-center ${isSidebarExpanded ? 'px-3 justify-between' : 'px-0 justify-center'} select-none shrink-0 relative z-10 gap-1`} id="sidebar-header">
              
              {/* Traffic Lights */}
              {isSidebarExpanded && (
                <div 
                  className="flex items-center gap-1.5 shrink-0"
                  onMouseEnter={() => setHoveredTrafficLight(true)}
                  onMouseLeave={() => setHoveredTrafficLight(false)}
                >
                  <button 
                    onClick={handleToggleMaximize}
                    className={`w-3 h-3 rounded-full ${isMaximized ? 'bg-[#27c93f]' : 'bg-[#8e8e93]'} hover:brightness-110 active:brightness-90 flex items-center justify-center cursor-pointer border border-black/15 shrink-0 transition-colors`}
                    title={isMaximized ? "Restaurar Janela" : "Maximizar na Janela"}
                  >
                    {hoveredTrafficLight && <span className="text-[7px] text-neutral-950 font-black leading-none">＋</span>}
                  </button>
                </div>
              )}

              {/* Collapse Trigger Button */}
              {isSidebarExpanded ? (
                <button 
                  onClick={() => setIsSidebarExpanded(false)}
                  className="text-[#86868b] hover:text-white transition-colors p-1 rounded-md hover:bg-white/5 cursor-pointer shrink-0"
                  title="Recolher Barra"
                >
                  <PanelLeftClose size={15} />
                </button>
              ) : (
                <button 
                  onClick={() => setIsSidebarExpanded(true)}
                  className="text-[#86868b] hover:text-white transition-colors p-2 rounded-md hover:bg-white/10 cursor-pointer shrink-0 flex items-center justify-center"
                  title="Expandir Barra"
                >
                  <PanelLeft size={16} />
                </button>
              )}
            </div>

            {/* Sidebar Content Tree */}
            <div className="flex-1 py-4 px-2 space-y-4 custom-scrollbar overflow-y-auto relative z-10 bg-transparent border-t border-white/15">
              <div className="space-y-4 w-full">
                
                {/* Dashboard Return Button */}
                <button 
                  onClick={() => {
                    if (activeModuleId !== 'intro' && !isPaidUser) {
                      setCheckoutModalInfo({
                        title: 'Visão Geral Reservada para Alunos',
                        description: 'A visão geral e ferramentas dos módulos avançados são exclusivas para inscritos no YouTuber Pro. Desbloqueie sua vaga com o Stripe para acessar!'
                      });
                      setIsCheckoutModalOpen(true);
                      return;
                    }
                    setActiveLessonId('');
                  }}
                  className={`w-full flex items-center ${isSidebarExpanded ? 'justify-between px-3' : 'justify-center px-0'} py-2.5 rounded-[12px] text-left text-xs font-semibold cursor-pointer transition-colors ${
                    !activeLessonId 
                      ? 'bg-white/15 text-white border border-white/20' 
                      : 'text-neutral-300 hover:text-white hover:bg-white/5'
                  }`}
                  title={!isSidebarExpanded ? "Visão Geral" : undefined}
                >
                  <div className="flex items-center gap-2.5">
                    <BookOpen size={16} className={!activeLessonId ? 'text-[#00c7fc]' : 'text-neutral-400'} />
                    {isSidebarExpanded && <span>Visão Geral</span>}
                  </div>
                  {isSidebarExpanded && activeModuleId !== 'intro' && !isPaidUser && (
                    <Lock size={12} className="text-neutral-400 shrink-0" />
                  )}
                </button>

                <div className="space-y-1" onMouseLeave={() => setHoveredModuleIndex(null)}>
                  {isSidebarExpanded && (
                    <span className="text-[9px] font-bold text-[#86868b] tracking-widest uppercase block px-3 mb-2">MÓDULOS</span>
                  )}
                  
                  {modulesData.map((mod, mIdx) => {
                    const isCurrent = activeLessonId 
                      ? mod.subtopics.some(s => s.id === activeLessonId)
                      : false;
                    const completedLessons = mod.subtopics.filter(s => progress.completedLessons.includes(s.id)).length;
                    const isAllCompleted = completedLessons === mod.subtopics.length;
                    const isLockedModule = mod.id !== 'intro' && !isPaidUser;

                    // Cálculo de Proximidade para Degradê do Cadeado & Efeito macOS Dock Magnification Centralizado
                    let lockOpacity = 0;
                    let dockScale = 1;

                    if (hoveredModuleIndex !== null) {
                      const dist = Math.abs(mIdx - hoveredModuleIndex);
                      if (dist === 0) {
                        lockOpacity = 1;      // Módulo focado: Cadeado 100% visível
                        dockScale = 1.035;    // Magnificação macOS Dock centralizada
                      } else if (dist === 1) {
                        lockOpacity = 0.5;    // Vizinhos 1: Cadeado 50% visível (degradê)
                        dockScale = 1.018;    // Escala vizinha suave
                      } else if (dist === 2) {
                        lockOpacity = 0.2;    // Vizinhos 2: Cadeado 20% visível (degradê)
                        dockScale = 1.008;
                      }
                    }

                    return (
                      <div 
                        key={mod.id} 
                        className="space-y-0.5 w-full overflow-hidden"
                        style={{
                          transform: `scale(${dockScale})`,
                          transformOrigin: 'center center',
                          transition: 'transform 220ms cubic-bezier(0.25, 1, 0.5, 1), opacity 300ms ease-out',
                        }}
                        onMouseEnter={() => {
                          setHoveredModuleIndex(mIdx);
                          handleModuleMouseEnter(mod.id);
                        }}
                        onMouseLeave={handleModuleMouseLeave}
                      >
                        
                        {/* Module Button */}
                        <button
                          onClick={() => {
                            if (isLockedModule) {
                              setCheckoutModalInfo({
                                title: 'Desbloquear todo o conteúdo',
                                description: 'Este módulo técnico é reservado para alunos pagantes do YouTuber Pro. Ative seu acesso instantâneo para liberar!'
                              });
                              setIsCheckoutModalOpen(true);
                              return;
                            }
                            setActiveModuleId(mod.id);
                            if (!isSidebarExpanded) {
                              setIsSidebarExpanded(true);
                            }
                            setExpandedEmenta(prev => ({ ...prev, [mod.id]: !prev[mod.id] }));
                          }}
                          className={`w-full flex items-center ${isSidebarExpanded ? 'justify-between px-3' : 'justify-center px-0'} py-2.5 rounded-[12px] text-[13px] transition-all text-left cursor-pointer ${
                            isCurrent 
                              ? 'bg-white/15 text-white border border-white/20 shadow-sm' 
                              : 'text-neutral-300 hover:text-white hover:bg-white/5'
                          }`}
                          title={!isSidebarExpanded ? getModuleName(mod.title) : undefined}
                        >
                          <div className={`flex items-center ${isSidebarExpanded ? 'gap-2.5 truncate' : 'justify-center w-full'}`}>
                            {getModuleIcon(mod.id, isCurrent)}
                            {isSidebarExpanded && (
                              <span className="truncate font-semibold text-xs">{getModuleName(mod.title)}</span>
                            )}
                          </div>

                          {isSidebarExpanded && (
                            <div className="shrink-0 flex items-center gap-1">
                              {isLockedModule ? (
                                <Lock 
                                  size={12} 
                                  className="text-neutral-300 shrink-0 transition-opacity duration-300 ease-out" 
                                  style={{ opacity: lockOpacity }}
                                />
                              ) : (
                                <>
                                  {isAllCompleted && <CheckCircle2 size={11} className="text-[#30d158] shrink-0 mr-1" />}
                                  {expandedEmenta[mod.id] ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                                </>
                              )}
                            </div>
                          )}
                        </button>

                        {/* Lesson Nest under Expanded Module */}
                        <AnimatePresence initial={false}>
                          {isSidebarExpanded && expandedEmenta[mod.id] && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.35, ease: "easeInOut" }}
                              className="pl-2 ml-3 border-l border-white/5 space-y-0.5 py-1 overflow-hidden"
                              onMouseLeave={() => setHoveredLessonIndex(null)}
                            >
                              {mod.subtopics.map((sub, sIdx) => {
                                const isCurrentLesson = activeLessonId === sub.id;
                                const isCompleted = progress.completedLessons.includes(sub.id);
                                const isLockedLesson = mod.id !== 'intro' && !isPaidUser;

                                let lessonLockOpacity = 0;
                                let lessonDockScale = 1;

                                if (hoveredLessonIndex !== null) {
                                  const lDist = Math.abs(sIdx - hoveredLessonIndex);
                                  if (lDist === 0) {
                                    lessonLockOpacity = 1;
                                    lessonDockScale = 1.025;
                                  } else if (lDist === 1) {
                                    lessonLockOpacity = 0.5;
                                    lessonDockScale = 1.01;
                                  } else if (lDist === 2) {
                                    lessonLockOpacity = 0.2;
                                  }
                                }

                                return (
                                  <button
                                    key={sub.id}
                                    onMouseEnter={() => setHoveredLessonIndex(sIdx)}
                                    onClick={() => {
                                      if (isLockedLesson) {
                                        setCheckoutModalInfo({
                                          title: 'Desbloquear todo o conteúdo',
                                          description: 'Esta aula prática e seus simuladores são reservados para alunos inscritos. Finalize sua inscrição via Stripe para liberar!'
                                        });
                                        setIsCheckoutModalOpen(true);
                                        return;
                                      }
                                      setActiveModuleId(mod.id);
                                      setActiveLessonId(sub.id);
                                      setActiveTab('teoria');
                                    }}
                                    style={{
                                      transform: `scale(${lessonDockScale})`,
                                      transformOrigin: 'center center',
                                      transition: 'transform 220ms cubic-bezier(0.25, 1, 0.5, 1), opacity 300ms ease-out',
                                    }}
                                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-[10px] text-[11px] transition-all text-left cursor-pointer ${
                                      isCurrentLesson
                                        ? 'bg-[#0071e3] text-white font-medium shadow-md shadow-blue-500/10'
                                        : 'text-[#a1a1a6] hover:text-[#f5f5f7] hover:bg-white/5'
                                    }`}
                                  >
                                    <span className="truncate">{sIdx + 1}. {sub.title.replace(/^\d+\.\s*/, '')}</span>
                                    {isLockedLesson ? (
                                      <Lock 
                                        size={10} 
                                        className="text-[#a1a1a6] shrink-0 ml-1 transition-opacity duration-300 ease-out" 
                                        style={{ opacity: lessonLockOpacity }}
                                      />
                                    ) : (
                                      isCompleted && (
                                        <CheckCircle2 size={10} className={isCurrentLesson ? 'text-white' : 'text-[#30d158]'} />
                                      )
                                    )}
                                  </button>
                                );
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>

                      </div>
                    );
                  })}
                </div>

              </div>
            </div>

            {/* Collapsed Sidebar Hover Flyout Panel */}
            {!isSidebarExpanded && activeFlyoutModule && (
              <div 
                className="absolute left-[84px] z-50 w-64"
                style={{ top: '80px' }}
                onMouseEnter={() => {
                  if (flyoutTimeoutRef.current) clearTimeout(flyoutTimeoutRef.current);
                }}
                onMouseLeave={handleModuleMouseLeave}
              >
                <LiquidGlass cornerRadius={16} padding="8px" className="w-full">
                  <div className="w-full">
                    <div className="px-2.5 py-1.5 border-b border-white/5 mb-1.5">
                      <span className="text-[10px] font-bold text-[#00c7fc] uppercase font-mono tracking-wider">
                        {activeFlyoutModule === 'intro' ? 'Introdução' : 'Módulo'}
                      </span>
                      <p className="text-xs font-bold text-white truncate">
                        {getModuleName(modulesData.find(m => m.id === activeFlyoutModule)?.title)}
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      {modulesData.find(m => m.id === activeFlyoutModule)?.subtopics.map((sub, idx) => {
                        const isCompleted = progress.completedLessons.includes(sub.id);
                        return (
                          <button
                            key={sub.id}
                            onClick={() => {
                              setActiveModuleId(activeFlyoutModule as ModuleId);
                              setActiveLessonId(sub.id);
                              setActiveFlyoutModule(null);
                            }}
                            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] text-[#a1a1a6] hover:text-white hover:bg-white/5 text-left cursor-pointer"
                          >
                            <span className="truncate">{idx + 1}. {sub.title}</span>
                            {isCompleted && <CheckCircle2 size={10} className="text-[#30d158]" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </LiquidGlass>
              </div>
            )}

          </aside>

          {/* MAIN SPACE (TOOLBAR + CONTENT) */}
          <main className="flex-1 flex flex-col overflow-hidden relative">
            
            {/* Seção 3.2 · Toolbar */}
            <header className={`h-14 bg-transparent border-b border-white/15 ${isMaximized ? '' : 'md:rounded-tr-[24px]'} flex items-center px-6 justify-between select-none relative z-20 shrink-0`}>
              
              {/* Left Toolbar Info */}
              <div className="flex items-center gap-3">
                {/* Mobile Menu Toggle Button */}
                <button 
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden text-white hover:text-neutral-300 p-1 rounded-md"
                >
                  {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>

                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <button 
                      onClick={handlePrevLesson}
                      disabled={!activeLessonId}
                      className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-[#f5f5f7] disabled:opacity-20 cursor-pointer"
                      title="Aula Anterior"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button 
                      onClick={handleNextLesson}
                      disabled={!activeLessonId}
                      className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-[#f5f5f7] disabled:opacity-20 cursor-pointer"
                      title="Próxima Aula"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>

                  <div className="border-l border-white/10 pl-3 hidden sm:block">
                    <span className="block text-sm font-bold tracking-tight text-white leading-none">Dojo Academy</span>
                  </div>
                </div>
              </div>

              {/* Center Progress Meter */}
              <div className="hidden lg:flex items-center gap-3 bg-neutral-900/30 px-4 py-1.5 rounded-full border border-white/5">
                <span className="text-[10px] font-bold tracking-wider text-[#86868b] uppercase leading-none">Progresso Geral</span>
                <div className="w-40 h-1.5 rounded-full bg-white/10 border border-white/5 shadow-inner overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#0071e3] to-[#00c7fc] shadow-[0_0_8px_rgba(0,199,252,0.4)] transition-all duration-500"
                    style={{ width: `${percentComplete}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold tracking-wider text-[#00c7fc] font-mono leading-none">{percentComplete}%</span>
              </div>

              {/* Right Search & Profile */}
              <div className="flex items-center gap-3">
                
                {/* Search Bar Trigger */}
                <div 
                  onClick={() => setIsSearchOpen(true)}
                  className="hidden md:flex items-center bg-[#1d1d1f] border border-white/5 rounded-full px-3 py-1.5 w-32 cursor-pointer hover:bg-[#2c2c2e]/80 transition-colors relative"
                >
                  <Search size={12} className="text-[#86868b] mr-1.5" />
                  <span className="text-[11px] text-[#86868b] select-none">Buscar...</span>
                </div>

                <button 
                  onClick={() => setIsSearchOpen(true)}
                  className="md:hidden text-white p-1 rounded-full hover:bg-white/5"
                >
                  <Search size={16} />
                </button>

                {/* Profile Avatar & Menu Dropdown (Visível somente quando logado) */}
                {isLoggedIn ? (
                  <div className="relative flex items-center gap-2" ref={profileMenuRef}>
                    <button
                      onClick={() => setIsProfileMenuOpen(prev => !prev)}
                      className="flex items-center gap-1.5 p-0.5 pr-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer group"
                      title="Menu da Conta"
                    >
                      <img 
                        src={userProfile.avatar} 
                        alt="Perfil" 
                        className="w-8 h-8 rounded-full border border-white/20 group-hover:border-[#0071e3] transition-colors object-cover shrink-0"
                      />
                      <ChevronDown size={12} className={`text-neutral-400 group-hover:text-white transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {isProfileMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -8 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -8 }}
                          transition={{ duration: 0.15, ease: 'easeOut' }}
                          className="absolute right-0 top-11 w-64 z-50 overflow-hidden"
                        >
                          <LiquidGlass 
                            displacementScale={24}
                            aberrationIntensity={1.5}
                            blurAmount={0.15}
                            cornerRadius={16} 
                            padding="8px" 
                            className="w-full"
                          >
                            {/* Profile Summary */}
                            <div className="px-3 py-2.5 border-b border-white/10 flex items-center gap-3">
                              <img 
                                src={userProfile.avatar} 
                                alt="Perfil" 
                                className="w-9 h-9 rounded-full border border-white/20 object-cover shrink-0"
                              />
                              <div className="overflow-hidden">
                                <p className="text-xs font-bold text-white truncate">{userProfile.firstName} {userProfile.lastName}</p>
                                <p className="text-[11px] text-neutral-400 truncate">{userProfile.email}</p>
                              </div>
                            </div>

                            <div className="py-1 space-y-0.5">
                              {/* Minha Conta option */}
                              <button
                                onClick={() => {
                                  setIsProfileMenuOpen(false);
                                  setIsAccountModalOpen(true);
                                }}
                                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-neutral-200 hover:text-white hover:bg-[#0071e3] transition-colors cursor-pointer text-left font-medium"
                              >
                                <User size={15} />
                               <span>Minha Conta</span>
                              </button>

                              {/* Sair option */}
                              <button
                                onClick={() => {
                                  setIsProfileMenuOpen(false);
                                  handleLogout();
                                }}
                                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-red-400 hover:text-red-200 hover:bg-red-500/20 transition-colors cursor-pointer text-left font-medium"
                              >
                                <LogOut size={15} />
                                <span>Sair</span>
                              </button>
                            </div>
                          </LiquidGlass>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsSupabaseLoginOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white font-bold text-xs transition-all shadow-md shadow-blue-500/20 cursor-pointer"
                  >
                    <LogIn size={13} />
                    <span>Entrar</span>
                  </button>
                )}
              </div>

              {/* Progress Line on bottom edge */}
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/[0.05]">
                <div 
                  className="h-full bg-gradient-to-r from-[#0071e3] to-[#00c7fc] transition-all duration-500" 
                  style={{ width: `${percentComplete}%` }}
                />
              </div>
            </header>

            {/* CONTENT SPACE ROUTER */}
            {!isLoggedIn ? (
              /* LANDING PAGE (DESLOGADO) */
              <div 
                className="flex-1 overflow-y-auto bg-[#f5f5f7] select-text scroll-smooth" 
                id="landing-container"
                onScroll={(e) => setHeroScrollY(e.currentTarget.scrollTop)}
              >
                
                {/* Seção 00 · Nav Sticky */}
                <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-neutral-200/50 shadow-sm transition-all">
                  <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-xl bg-clip-text text-transparent bg-gradient-to-r from-[#0071e3] to-[#00c7fc] tracking-tight">YouTuber Pro</span>
                    </div>

                    <nav className="hidden md:flex items-center gap-6">
                      <a href="#modulos" className="text-xs font-medium text-neutral-600 hover:text-[#0071e3] transition-colors">Conteúdo</a>
                      <a href="#faq" className="text-xs font-medium text-neutral-600 hover:text-[#0071e3] transition-colors">Perguntas Frequentes</a>
                    </nav>

                  </div>
                </header>

                {/* Seção 01 · Hero Section (Full width edge-to-edge - Text Aligned at Bottom) */}
                <section className="w-full relative min-h-[480px] md:min-h-[540px] flex flex-col justify-end p-8 md:p-14 bg-black overflow-hidden border-b border-neutral-200/20">
                  {/* Hero background with vertical-only parallax */}
                  <img 
                    src={HERO_IMAGES[randomHeroIndex % HERO_IMAGES.length]} 
                    alt="Hero Background" 
                    className="absolute left-0 right-0 w-full h-[125%] -top-[12.5%] object-cover pointer-events-none z-0 opacity-100 will-change-transform"
                    style={{
                      transform: `translate3d(0, ${heroScrollY * 0.35}px, 0)`
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-0 pointer-events-none" />

                  <div className="relative z-10 max-w-4xl mx-auto w-full space-y-6 pt-12">
                    <div className="space-y-4">
                      <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-white leading-tight max-w-3xl">
                        Seus vídeos podem parecer <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00c7fc] to-[#30d158]">profissionais</span> mesmo gravando em casa, com pouco espaço e sem comprar equipamentos caros.
                      </h2>
                    </div>

                    <div>
                      <button 
                        onClick={() => {
                          if (rateLimiter.isRateLimited('checkout', 4, 30000)) {
                            alert('Muitas tentativas em pouco tempo. Por favor, aguarde alguns segundos.');
                            return;
                          }
                          handleStripeCheckout('price_1U1M973VfcJ3qJcs97vRW0op');
                        }}
                        className="w-full md:w-auto px-8 py-4 bg-[#0071e3] text-white rounded-full font-bold text-sm hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/20 transition-all cursor-pointer text-center"
                      >
                        Começar Guia de Sobrevivência
                      </button>
                    </div>
                  </div>
                </section>

                <div className="max-w-4xl mx-auto px-4 py-12 space-y-16">

                  {/* Seção 03 · Seção de Dor */}
                  <section className="space-y-6">
                    <div className="text-center max-w-md mx-auto space-y-1">
                      <span className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase">OS OBSTÁCULOS</span>
                      <h2 className="text-2xl font-black text-neutral-900 tracking-tight">O que está travando o crescimento do seu canal?</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[
                        { title: "Roteiros Sem Retenção", desc: "Seus espectadores vão embora nos primeiros 10 segundos porque você não aplica a Teoria dos Anzóis (Hooks) estruturada." },
                        { title: "Visual Amador", desc: "Câmeras caras não salvam vídeos mal iluminados. Falta dominar proporções de luz e o cálculo correto de exposição." },
                        { title: "Áudio Ruim e Abafado", desc: "O público tolera imagem de baixa resolução, mas desiste de assistir instantaneamente se houver ruído e áudio desequilibrado." }
                      ].map((item, idx) => (
                        <div key={idx} className="p-8 bg-white rounded-2xl border border-neutral-200/80 shadow-sm space-y-4">
                          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
                            <AlertTriangle size={24} />
                          </div>
                          <h3 className="text-sm font-bold text-neutral-900">{item.title}</h3>
                          <p className="text-xs text-neutral-500 leading-relaxed">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Seção 04 · Seção de Solução */}
                  <section className="bg-neutral-900 text-white py-12 px-6 rounded-3xl border border-white/5 space-y-8">
                    <div className="text-center max-w-md mx-auto space-y-1">
                      <span className="text-[10px] font-bold tracking-widest text-[#00c7fc] uppercase">A VIRADA DE CHAVE</span>
                      <h2 className="text-2xl font-black tracking-tight">O Amador vs. O Profissional</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Amador */}
                      <div className="bg-neutral-950 p-6 rounded-2xl border border-red-500/20 space-y-4">
                        <span className="text-xs font-bold text-red-400 uppercase tracking-wider block">O Criador Comum</span>
                        <ul className="space-y-2.5 text-xs text-neutral-400">
                          <li className="flex items-start gap-2">
                            <span className="text-red-500 font-bold mt-0.5">✕</span> Começa vídeos dizendo "Olá pessoal, se inscreve no canal" (fuga imediata de público).
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-red-500 font-bold mt-0.5">✕</span> Grava com lâmpada de teto gerando sombras escuras sob os olhos.
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-red-500 font-bold mt-0.5">✕</span> Ajusta volume de áudio de trilha no 'olhômetro' cobrindo a voz principal.
                          </li>
                        </ul>
                      </div>

                      {/* Profissional */}
                      <div className="bg-neutral-950 p-6 rounded-2xl border border-emerald-500/20 space-y-4">
                        <span className="text-xs font-bold text-[#30d158] uppercase tracking-wider block font-bold">O Criador Profissional</span>
                        <ul className="space-y-2.5 text-xs text-neutral-300">
                          <li className="flex items-start gap-2">
                            <span className="text-[#30d158] font-bold mt-0.5">✓</span> Aplica ganchos narrativos estritos de 15s com estímulos e promessas visuais claras.
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-[#30d158] font-bold mt-0.5">✓</span> Entende relações de Key Light, Fill Light e Backlight calculando taxa de contraste.
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-[#30d158] font-bold mt-0.5">✓</span> Mantém trilha a -24dB, voz limpa e comprimida a -6dB para máximo conforto acústico.
                          </li>
                        </ul>
                      </div>
                    </div>
                  </section>

                  {/* Seção 05 · Seção Instrutor */}
                  <section className="bg-white rounded-3xl border border-neutral-200/80 shadow-md p-8 md:p-12 flex flex-col md:flex-row gap-8 items-center">
                    <img 
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop" 
                      alt="Instrutor" 
                      className="w-32 h-32 rounded-full border-4 border-neutral-100 shadow-md object-cover"
                    />
                    <div className="space-y-4 flex-1">
                      <div className="space-y-1">
                        <span className="px-3 py-1 bg-neutral-100 rounded-full text-xs font-semibold border border-neutral-200 text-neutral-600 uppercase tracking-widest text-[9px]">Instrutor Master</span>
                        <h3 className="text-xl font-bold text-neutral-900">Bruna Alencar</h3>
                        <p className="text-xs text-neutral-500">Diretora de Fotografia e Especialista em Audiovisual para Web com mais de 8 anos de experiência em estúdios de cinema e canais que somam mais de 5 milhões de inscritos.</p>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 items-center text-[10px] text-neutral-400 font-bold tracking-tight uppercase">
                        <span>Marcas Parceiras:</span>
                        <span className="hover:text-neutral-500 transition-colors">Sony Alpha</span>
                        <span>•</span>
                        <span className="hover:text-neutral-500 transition-colors">Aputure</span>
                        <span>•</span>
                        <span className="hover:text-neutral-500 transition-colors">Røde Microphones</span>
                      </div>
                      
                      <a 
                        href="#modulos"
                        className="inline-flex items-center gap-1.5 bg-blue-50 text-[#0071e3] hover:bg-blue-100 px-4 py-2 rounded-full text-xs font-semibold border border-blue-100 transition-colors"
                      >
                        Conhecer a Grade Curricular <ArrowRight size={12} />
                      </a>
                    </div>
                  </section>

                  {/* Seção 06 · Seção Formato */}
                  <section className="bg-neutral-100/50 border-y border-neutral-200/50 py-10 px-6 rounded-2xl flex flex-col md:flex-row justify-around gap-6 text-center">
                    {[
                      { icon: <RefreshCw size={20} />, title: "Aprenda Praticando", desc: "Simuladores interativos de estúdio em tempo real.", color: "bg-blue-100 text-[#0071e3]" },
                      { icon: <GraduationCap size={20} />, title: "Didática Direta", desc: "Sem enrolação técnica, foco na aplicação prática imediata.", color: "bg-emerald-100 text-emerald-600" },
                      { icon: <Clock size={20} />, title: "Passo a Passo", desc: "Siga o roteiro em etapas e monte sua engrenagem.", color: "bg-orange-100 text-orange-600" }
                    ].map((item, idx) => (
                      <div key={idx} className="flex flex-col items-center max-w-xs space-y-2">
                        <div className={`w-12 h-12 rounded-full shadow-inner flex items-center justify-center ${item.color}`}>
                          {item.icon}
                        </div>
                        <h4 className="text-sm font-bold text-neutral-800">{item.title}</h4>
                        <p className="text-xs text-neutral-500 leading-relaxed">{item.desc}</p>
                      </div>
                    ))}
                  </section>

                  {/* Seção 07 · Ementa / Accordion */}
                  <section className="space-y-6" id="modulos">
                    <div className="text-center max-w-md mx-auto space-y-1">
                      <span className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase">A GRADE</span>
                      <h2 className="text-2xl font-black text-neutral-900 tracking-tight">O que você vai dominar no Guia</h2>
                    </div>

                    <div className="space-y-3">
                      {modulesData.map((mod) => {
                        const isOpen = !!expandedEmenta[mod.id];
                        return (
                          <div key={mod.id} className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
                            <button
                              onClick={() => setExpandedEmenta(prev => ({ ...prev, [mod.id]: !prev[mod.id] }))}
                              className="px-6 py-5 hover:bg-neutral-50/50 flex justify-between items-center w-full text-left cursor-pointer transition-colors"
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center shrink-0">
                                  {getModuleIcon(mod.id, false)}
                                </div>
                                <div>
                                  <span className="text-[9px] font-mono font-bold text-[#0071e3] uppercase tracking-wider block">
                                    {mod.id === 'intro' ? 'Introdução' : 'Módulo'}
                                  </span>
                                  <span className="text-sm font-bold text-neutral-900 mt-0.5">{getModuleName(mod.title)}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                {isOpen ? <ChevronDown size={18} className="text-neutral-400" /> : <ChevronRight size={18} className="text-neutral-400" />}
                              </div>
                            </button>

                            <AnimatePresence initial={false}>
                              {isOpen && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.35, ease: "easeInOut" }}
                                  className="bg-neutral-50/30 border-t border-neutral-100 divide-y divide-neutral-100 p-4 space-y-2 overflow-hidden"
                                >
                                  {mod.subtopics.map((sub, i) => (
                                    <div key={sub.id} className="py-2.5 px-4 flex items-start gap-3">
                                      <span className="text-[11px] font-mono text-[#00c7fc] font-bold mt-0.5">{String(i+1).padStart(2, '0')}</span>
                                      <div>
                                        <h4 className="text-xs font-bold text-neutral-800">{sub.title}</h4>
                                        <p className="text-[11px] text-neutral-500 leading-relaxed mt-0.5">{sub.concept}</p>
                                      </div>
                                    </div>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  {/* Seção 08 · Video Preview */}
                  <section className="bg-neutral-900 py-12 px-6 rounded-3xl space-y-6 text-center">
                    <div className="max-w-md mx-auto space-y-1">
                      <span className="text-[10px] font-bold tracking-widest text-[#00c7fc] uppercase">AULA DEMONSTRATIVA</span>
                      <h2 className="text-2xl font-black text-white tracking-tight">Assista a uma simulação técnica em segundos</h2>
                    </div>

                    <div className="aspect-video max-w-2xl mx-auto rounded-3xl bg-neutral-950 border border-white/10 shadow-2xl relative overflow-hidden flex items-center justify-center">
                      {activePreviewVideo ? (
                        <iframe 
                          className="absolute inset-0 w-full h-full"
                          src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1" 
                          title="Vídeo de Amostra"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <>
                          <div className="absolute inset-0 bg-cover bg-center opacity-60" style={{ backgroundImage: `url(${BG_IMAGES[0]})` }} />
                          <button 
                            onClick={() => setActivePreviewVideo(true)}
                            className="w-20 h-20 rounded-full bg-[#0071e3] hover:bg-[#147ce5] hover:scale-110 active:scale-95 shadow-xl transition-all duration-300 flex items-center justify-center text-white cursor-pointer relative z-10"
                          >
                            <Play size={32} className="ml-1" />
                            <div className="absolute -inset-2 rounded-full border border-[#0071e3]/30 animate-ping" />
                          </button>
                          
                          <div className="absolute bottom-4 right-4 bg-black/50 px-2.5 py-1 rounded-md font-mono border border-white/5 text-[10px] text-white">
                            04:30 MIN
                          </div>
                          <div className="absolute top-4 left-4 text-[10px] font-bold text-emerald-400 uppercase tracking-widest font-mono">
                            PLAYBACK PREVIEW
                          </div>
                        </>
                      )}
                    </div>
                  </section>

                  {/* Seção 09 · Depoimentos */}
                  <section className="space-y-6">
                    <div className="text-center max-w-md mx-auto space-y-1">
                      <span className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase">DEPOIMENTOS</span>
                      <h2 className="text-2xl font-black text-neutral-900 tracking-tight">O que dizem os criadores de conteúdo</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {TESTIMONIALS.map((t, idx) => (
                        <div key={idx} className="p-8 bg-white rounded-2xl border border-neutral-200/80 shadow-sm flex flex-col justify-between gap-4">
                          <div className="space-y-3">
                            <div className="flex gap-1">
                              {[...Array(t.rating)].map((_, i) => (
                                <Star key={i} size={14} className="fill-current text-amber-400" />
                              ))}
                            </div>
                            <p className="text-xs text-neutral-600 leading-relaxed font-medium">"{t.text}"</p>
                          </div>
                          <div>
                            <span className="block font-bold text-neutral-900 text-sm">{t.name}</span>
                            <span className="text-[9px] font-bold text-[#0071e3] uppercase tracking-wider block mt-0.5">{t.title}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Seção 10 · Oferta / Urgência */}
                  <section className="bg-[#0071e3]/5 border-y border-[#0071e3]/10 py-12 px-6 rounded-3xl space-y-8">
                    <div className="text-center max-w-md mx-auto space-y-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0071e3]/10 text-[#0071e3] px-4 py-2 text-xs font-bold font-mono">
                        <Clock size={12} className="animate-spin" /> OFERTA POR TEMPO LIMITADO: {countdown}
                      </span>
                      <h2 className="text-3xl font-black text-neutral-900 tracking-tight">Consiga sua engrenagem profissional hoje</h2>
                    </div>

                    <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-lg max-w-md mx-auto relative space-y-6">
                      <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#30d158] text-white text-[10px] font-bold uppercase tracking-wider">
                        60% DE DESCONTO EXCLUSIVO
                      </span>

                      <div className="text-center space-y-2">
                        <span className="text-xs text-neutral-400 line-through block">De R$ 67,00 por apenas</span>
                        <div className="flex flex-col items-center justify-center">
                          <span className="text-5xl font-black text-neutral-900 tracking-tighter">R$ 27,00</span>
                          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mt-1.5 block">Por um ano de acesso</span>
                        </div>
                      </div>

                      <button 
                        onClick={handleLogin}
                        className="w-full py-4 bg-[#30d158] hover:bg-[#28b54b] text-white rounded-xl font-black uppercase text-sm shadow-md shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer text-center"
                      >
                        Adquirir Acesso Instantâneo
                      </button>

                      <div className="text-[9px] text-neutral-400 font-bold tracking-wide uppercase text-center space-y-1">
                        <p>Pagamento Seguro via Stripe</p>
                        <p className="opacity-60">Crédito • Débito • Boleto</p>
                      </div>
                    </div>
                  </section>

                  {/* Seção 11 · Garantia */}
                  <section className="rounded-3xl border border-neutral-200 shadow-sm p-8 md:p-12 bg-white flex flex-col md:flex-row gap-6 items-center">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 shadow-inner flex items-center justify-center shrink-0">
                      <Shield size={32} />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold text-neutral-900">Garantia Blindada de Satisfação</h3>
                      <p className="text-xs text-neutral-500 leading-relaxed">Você tem 7 dias para testar todas as fórmulas e simuladores. Se você não notar diferença drástica na retenção e qualidade do seu canal, devolvemos seu dinheiro imediatamente. Sem taxas, sem burocracia.</p>
                    </div>
                  </section>

                  {/* Seção 12 · FAQ */}
                  <section className="bg-neutral-100/40 border-t border-neutral-200/50 py-12 px-6 rounded-2xl space-y-6" id="faq">
                    <div className="text-center max-w-md mx-auto space-y-1">
                      <span className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase">DÚVIDAS FREQUENTES</span>
                      <h2 className="text-2xl font-black text-neutral-900 tracking-tight">Perguntas Respondidas</h2>
                    </div>

                    <div className="space-y-3">
                      {FAQ_ITEMS.map((item, idx) => {
                        const isOpen = !!expandedFAQ[idx];
                        return (
                          <div key={idx} className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
                            <button
                              onClick={() => setExpandedFAQ(prev => ({ ...prev, [idx]: !prev[idx] }))}
                              className="px-6 py-4 flex justify-between items-center w-full text-left cursor-pointer transition-colors"
                            >
                              <span className="text-xs font-bold text-neutral-800">{item.q}</span>
                              {isOpen ? <ChevronDown size={16} className="text-[#0071e3]" /> : <ChevronRight size={16} className="text-neutral-400" />}
                            </button>

                            <AnimatePresence initial={false}>
                              {isOpen && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.3, ease: [0.42, 0, 0.58, 1] }}
                                  className="px-6 pb-4 bg-neutral-50/20 text-xs text-neutral-500 leading-relaxed border-t border-neutral-100 pt-3 overflow-hidden"
                                >
                                  {item.a}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  {/* Seção 13 · CTA Final */}
                  <section className="bg-neutral-900 text-white py-16 px-6 text-center rounded-3xl space-y-6">
                    <h2 className="text-3xl font-black tracking-tight max-w-xl mx-auto">Prepare seu set, destrave seu potencial criativo e comece hoje</h2>
                    <button 
                      onClick={() => {
                        if (rateLimiter.isRateLimited('checkout', 4, 30000)) {
                          alert('Muitas tentativas em pouco tempo. Por favor, aguarde alguns segundos.');
                          return;
                        }
                        handleStripeCheckout('price_1U1M973VfcJ3qJcs97vRW0op');
                      }}
                      className="px-10 py-5 bg-[#0071e3] text-white rounded-full font-black uppercase text-xs hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/20 transition-all cursor-pointer text-center"
                    >
                      Garantir Minha Vaga No Guia
                    </button>
                  </section>

                  {/* Seção 14 · Footer */}
                  <footer className="bg-neutral-950 border-t border-neutral-900 text-neutral-500 py-10 px-6 rounded-3xl text-center space-y-4">
                    <span className="font-black text-xl bg-clip-text text-transparent bg-gradient-to-r from-[#0071e3] to-[#00c7fc]">YouTuber Pro</span>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-neutral-600">© 2026 PLAYBOOK DO VIDEOMAKER - DOJO ACADEMY. TODOS OS DIREITOS RESERVADOS.</p>
                    <div className="flex justify-center gap-4 text-xs font-semibold text-neutral-400">
                      <a href="#modulos" className="hover:text-white transition-colors">Grade</a>
                      <span>•</span>
                      <a href="#garantia" className="hover:text-white transition-colors">Termos</a>
                      <span>•</span>
                      <a href="#faq" className="hover:text-white transition-colors">Suporte</a>
                    </div>
                  </footer>

                </div>
              </div>
            ) : !activeLessonId ? (
              <div className="flex-1 overflow-y-auto bg-[#f5f5f7] p-6 md:p-10 space-y-8 select-text">
                
                {/* Welcoming Header */}
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-4"
                >
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-neutral-200/50 border border-neutral-300/40 px-3 py-1 text-xs font-semibold text-neutral-600 uppercase tracking-widest">
                    <Sparkles size={11} className="text-[#0071e3]" /> EDIÇÃO DO CRIADOR PRO
                  </div>
                  
                  <div className="space-y-1">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                      <span className="block bg-clip-text text-transparent bg-gradient-to-b from-[#1d1d1f] via-[#2c2c2e] to-[#636366]">Seja bem-vindo ao</span>
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#0071e3] via-[#00c7fc] to-[#30d158] font-extrabold block">Guia de Sobrevivência</span>
                    </h1>
                  </div>

                  <p className="text-sm text-neutral-500 leading-relaxed max-w-xl">
                    Seu acesso completo à engrenagem de produção está liberado. Utilize os simuladores integrados a cada aula técnica para obter parâmetros perfeitos para seus vídeos.
                  </p>

                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
                    <button 
                      onClick={() => {
                        // Go to first lesson
                        setActiveModuleId('intro');
                        setActiveLessonId('intro-1');
                        setActiveTab('teoria');
                      }}
                      className="px-8 py-3 bg-[#0071e3] text-white rounded-full font-semibold text-xs hover:scale-105 active:scale-95 shadow-md shadow-blue-500/10 transition-all cursor-pointer"
                    >
                      Começar ou Continuar Estudos
                    </button>
                    <a 
                      href="#bento-highlights" 
                      className="text-[#0071e3] hover:underline font-semibold text-xs flex items-center gap-1 transition-all"
                    >
                      Ver destaques do painel <ArrowRight size={13} />
                    </a>
                  </div>
                </motion.div>

                {/* Dashboard Stats Panel */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { value: `${percentComplete}%`, label: "Conclusão Geral" },
                    { value: `${completedCount}/${totalLessons}`, label: "Aulas Concluídas" },
                    { value: `${modulesData.filter(m => progress.completedModules.includes(m.id)).length}`, label: "Módulos Prontos" },
                    { value: `${Object.keys(progress.challengeDrafts).length}`, label: "Projetos Rascunhados" }
                  ].map((s, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm space-y-1">
                      <span className="text-2xl font-bold text-[#1d1d1f] block tracking-tight">{s.value}</span>
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">{s.label}</span>
                    </div>
                  ))}
                </div>

                {/* Bento Grid Highlights Section */}
                <section className="space-y-4 pt-4" id="bento-highlights">
                  <span className="text-[11px] font-bold tracking-widest text-neutral-400 uppercase">Destaques & Simuladores Rápidos</span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    
                    {/* Bento Card 1 */}
                    <div className="md:col-span-4 bg-white rounded-[18px] border border-neutral-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:scale-[1.01] transition-transform duration-300 p-6 flex flex-col justify-between min-h-[220px]">
                      <div className="space-y-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#0071e3] shadow-sm">
                          <Layers size={16} />
                        </div>
                        <h4 className="text-sm font-bold text-neutral-900">Kit de Aceleração</h4>
                        <p className="text-xs text-neutral-500 leading-relaxed">Baixe lower thirds prontas, efeitos sonoros (SFX) e músicas gratuitas.</p>
                      </div>
                      <span className="text-[10px] font-mono text-neutral-400 font-bold tracking-wider uppercase block mt-4">DISPONÍVEL NA INTRODUÇÃO</span>
                    </div>

                    {/* Bento Card 2 */}
                    <div className="md:col-span-4 bg-white rounded-[18px] border border-neutral-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:scale-[1.01] transition-transform duration-300 p-6 flex flex-col justify-between min-h-[220px]">
                      <div className="space-y-2">
                        <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500 shadow-sm">
                          <Volume2 size={16} />
                        </div>
                        <h4 className="text-sm font-bold text-neutral-900">Fórmula de Áudio</h4>
                        <p className="text-xs text-neutral-500 leading-relaxed">Voz clara e comprimida em -6dB, trilha de apoio sutil em -24dB.</p>
                      </div>
                      <span className="text-[10px] font-mono text-neutral-400 font-bold tracking-wider uppercase block mt-4">
                        REQUISITO: {getModuleName(modulesData.find(m => m.id === 'mod6')?.title)}
                      </span>
                    </div>

                    {/* Bento Card 3 */}
                    <div className="md:col-span-4 bg-white rounded-[18px] border border-neutral-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:scale-[1.01] transition-transform duration-300 p-6 flex flex-col justify-between min-h-[220px]">
                      <div className="space-y-2">
                        <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 shadow-sm">
                          <Sparkles size={16} />
                        </div>
                        <h4 className="text-sm font-bold text-neutral-900">Teoria dos Anzóis</h4>
                        <p className="text-xs text-neutral-500 leading-relaxed">Gancho inegável nos primeiros 15 segundos para aumentar a retenção.</p>
                      </div>
                      <span className="text-[10px] font-mono text-neutral-400 font-bold tracking-wider uppercase block mt-4">
                        PRÁTICA NO: {getModuleName(modulesData.find(m => m.id === 'mod1')?.title)}
                      </span>
                    </div>

                    {/* Bento Card 4 */}
                    <div className="md:col-span-6 bg-white rounded-[18px] border border-neutral-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:scale-[1.01] transition-transform duration-300 p-6 flex flex-col justify-between min-h-[240px]">
                      <div className="space-y-3">
                        <span className="text-[9px] font-mono font-bold text-[#00c7fc] uppercase tracking-wider block">FOTOGRAFIA & DESIGN DE SET</span>
                        <h4 className="text-base font-bold text-neutral-900">Estúdio de 3 Pontos</h4>
                        <p className="text-xs text-neutral-500 leading-relaxed">Simule as posições e proporções exatas da Key Light, Fill Light e Backlight no seu set técnico.</p>
                        <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-100 flex items-center justify-between text-[11px] font-mono text-neutral-400 mt-2">
                          <span>Contraste Ideal: 3:1 ou 4:1</span>
                          <span className="text-[#0071e3] font-bold">
                            {getModuleName(modulesData.find(m => m.id === 'mod3')?.title)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bento Card 5 */}
                    <div className="md:col-span-6 bg-white rounded-[18px] border border-neutral-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:scale-[1.01] transition-transform duration-300 p-6 flex flex-col justify-between min-h-[240px]">
                      <div className="space-y-3">
                        <span className="text-[9px] font-mono font-bold text-[#30d158] uppercase tracking-wider block">TEORIA DA MONTAGEM</span>
                        <h4 className="text-base font-bold text-neutral-900">Princípio de Pudovkin</h4>
                        <p className="text-xs text-neutral-500 leading-relaxed">Descubra como a ordem de justaposição das imagens gera reações psicológicas involuntárias no espectador.</p>
                        <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-100 flex items-center justify-between text-[11px] font-mono text-neutral-400 mt-2">
                          <span>Associação Cognitiva de Clipes</span>
                          <span className="text-[#0071e3] font-bold">
                            {getModuleName(modulesData.find(m => m.id === 'mod5')?.title)}
                          </span>
                        </div>
                      </div>
                    </div>

                  </div>
                </section>

              </div>
            ) : (
              
              /* LESSON VIEW (ACTIVE LESSON) */
              <div className="flex-1 overflow-y-auto bg-[#f5f5f7] pb-24 relative select-text custom-scrollbar flex flex-col" id="lesson-view-container">
                
                <motion.div 
                  key={activeLessonId}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="px-6 md:px-12 py-10 flex-1 space-y-10"
                >
                  
                  {/* Lesson Header */}
                  <div className="space-y-4">
                    {progress.completedLessons.includes(activeLessonId) && (
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200/60 px-3 py-1 text-xs font-bold uppercase tracking-wider animate-fade-in">
                          <CheckCircle2 size={13} /> Concluída
                        </span>
                      </div>
                    )}

                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight bg-clip-text text-transparent bg-gradient-to-b from-[#1d1d1f] via-[#2c2c2e] to-[#636366]">
                      {activeLesson.title}
                    </h1>
                  </div>

                  {/* Section Label: Teoria */}
                  <div className="space-y-4">
                    <span className="text-[11px] font-bold tracking-widest text-neutral-400 uppercase block">TEORIA E FUNDAMENTOS</span>
                    {activeLessonId === 'mod1-1' ? (
                      <InteractiveIdeationTheory />
                    ) : (
                      <div className="bg-white rounded-[24px] border border-neutral-200/80 p-8 shadow-[0_4px_24px_rgba(0,0,0,0.01)] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#0071e3]/5 to-transparent rounded-full blur-xl pointer-events-none" />
                        <p className="text-neutral-800 text-[15px] leading-relaxed whitespace-pre-line font-normal">{activeLesson.concept}</p>
                        <div className="absolute bottom-6 right-6 w-8 h-8 rounded-full bg-neutral-50 border border-neutral-200/60 flex items-center justify-center text-neutral-400 group-hover:text-neutral-700 transition-colors">
                          <Plus size={14} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Roadmap Section */}
                  <div className="space-y-4">
                    <span className="text-[11px] font-bold tracking-widest text-neutral-400 uppercase block">ROTEIRO RECOMENDADO DE AÇÃO</span>
                    <div className="bg-white rounded-[24px] border border-neutral-200/80 p-8 shadow-[0_4px_24px_rgba(0,0,0,0.01)] relative overflow-hidden">
                      <div className="absolute left-[39px] top-12 bottom-12 w-0.5 bg-neutral-100 hidden md:block" />
                      <div className="space-y-5 relative z-10">
                        {activeLesson.steps.map((step, sIdx) => (
                          <div key={sIdx} className="flex flex-col md:flex-row items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-[#0071e3]/10 text-[#0071e3] flex items-center justify-center text-xs font-bold shrink-0">
                              {sIdx + 1}
                            </div>
                            <div className="bg-neutral-50/70 rounded-[18px] border border-neutral-200/40 p-5 flex-1 hover:bg-neutral-50 transition-colors">
                              <span className="text-neutral-800 text-[14px] font-semibold leading-relaxed block">{step}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Instructor Recommendation / Destaque */}
                  {activeLesson.tips && activeLesson.tips.length > 0 && (
                    <div className="p-6 rounded-[24px] bg-white border border-neutral-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.01)] flex gap-4 items-start relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-[#0071e3]" />
                      <span className="text-[#0071e3] text-lg font-bold leading-none mt-0.5 animate-pulse">✦</span>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-[#86868b] uppercase tracking-wider block">Recomendação do Professor</span>
                        <p className="text-neutral-800 font-semibold text-xs leading-relaxed">{activeLesson.tips[0]}</p>
                      </div>
                    </div>
                  )}

                  {/* Bloco 'Projeção Visual' (Diagrama Técnico) */}
                  <div className="space-y-4">
                    <span className="text-[11px] font-bold tracking-widest text-neutral-400 uppercase block">PROJEÇÃO VISUAL DO CONCEITO</span>
                    
                    {activeLessonId === 'mod1-1' ? (
                      <div className="bg-white rounded-[24px] border border-neutral-200 p-8 shadow-[0_4px_24px_rgba(0,0,0,0.01)]">
                        <IdeationFlowchart />
                      </div>
                    ) : (
                      <div className="bg-white rounded-[24px] border border-neutral-200 p-8 shadow-[0_4px_24px_rgba(0,0,0,0.01)] space-y-6">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-bold text-[#1d1d1f]">Diagrama Esquemático</span>
                          <span className="rounded-full px-3 py-1 bg-neutral-50 border border-neutral-200 text-[10px] font-bold text-neutral-500 flex items-center gap-1 uppercase tracking-wider">
                            Representação Gráfica
                          </span>
                        </div>

                        <div className="h-56 bg-gradient-to-b from-neutral-50/50 to-neutral-100/50 rounded-[20px] border border-neutral-200 flex flex-col items-center justify-center text-center p-6 relative overflow-hidden">
                          {/* Beautiful grid overlay */}
                          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-60" />
                          <div className="absolute w-56 h-56 bg-[#0071e3]/5 rounded-full blur-3xl pointer-events-none" />
                          
                          <div className="w-14 h-14 rounded-full bg-white border border-neutral-200/80 shadow-md flex items-center justify-center text-[#0071e3] mb-4 relative z-10">
                            <ImageIcon size={24} />
                          </div>

                          <span className="font-mono text-xs text-[#0071e3] font-bold bg-[#0071e3]/8 px-4 py-1.5 rounded-full border border-[#0071e3]/15 block relative z-10 shadow-xs uppercase tracking-wide">
                            {activeModule.id.toUpperCase()}_{activeLessonId.replace('-', '_').toUpperCase()}
                          </span>
                          <p className="text-xs text-neutral-500 mt-3 max-w-md relative z-10 leading-relaxed font-medium">
                            A estrutura acima representa visualmente as relações geométricas de iluminação, os tempos de retenção narrativa e as frequências de decibéis explicadas no roteiro.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bloco 'Na Prática' (Tool Section - Simuladores Integrados) */}
                  <div className="space-y-4 pt-2">
                    <span className="text-[11px] font-bold tracking-widest text-neutral-400 uppercase block">NA PRÁTICA</span>
                    
                    <div className="bg-white border border-neutral-200 rounded-[18px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-4 relative overflow-hidden">
                      {/* Accent corner glare */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#ff9f0a]/5 to-transparent rounded-full blur-xl pointer-events-none" />

                      <div className="flex items-center gap-3">
                        <div>
                          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block font-mono">SIMULADOR TÉCNICO COMPLETO</span>
                          <h4 className="text-sm font-bold text-neutral-900">Console Interativo Do Módulo</h4>
                        </div>
                      </div>

                      {/* Simulador Container */}
                      <div className="border border-neutral-200 rounded-xl overflow-hidden bg-black text-white shadow-inner flex flex-col mt-3">
                        <div className="bg-neutral-900/60 px-4 py-2 border-b border-neutral-800 flex justify-between items-center select-none text-[10px] font-mono text-[#86868b]">
                          <span>Simulador Ativo: {activeModule.title.split(': ')[1]}</span>
                          <span className="w-2 h-2 rounded-full bg-[#ff9f0a]" />
                        </div>
                        <div className="p-4 bg-[#09090b] min-h-[300px] select-text">
                          {renderInteractiveTool(activeModule.id)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Exercício Prático (Desafio) Integrado */}
                  {activeModule.challenges && activeModule.challenges.length > 0 && (
                    <div className="space-y-4 pt-2">
                      <span className="text-[11px] font-bold tracking-widest text-neutral-400 uppercase block">EXERCÍCIO PRÁTICO RECOMENDADO</span>
                      
                      <div className="bg-white border border-neutral-200 rounded-[18px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-6">
                        {activeModule.challenges.map(chal => {
                          const draft = progress.challengeDrafts[chal.id] || {};
                          return (
                            <div key={chal.id} className="space-y-6">
                              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                <div className="space-y-1">
                                  <h4 className="text-sm font-bold text-neutral-900">{chal.title}</h4>
                                  <p className="text-xs text-neutral-500 leading-relaxed">{chal.description}</p>
                                </div>

                                <button
                                  onClick={() => handleCopyChallenge(chal.id, chal.fields)}
                                  className="flex items-center gap-1.5 text-[11px] font-semibold text-neutral-700 hover:text-neutral-950 bg-neutral-100 hover:bg-neutral-200 py-1.5 px-4 rounded-full transition-colors border border-neutral-200 shrink-0 select-none cursor-pointer"
                                >
                                  {copiedChallengeId === chal.id ? (
                                    <>
                                      <Check size={12} className="text-[#30d158]" /> Copiado!
                                    </>
                                  ) : (
                                    <>
                                      <Copy size={12} /> Copiar Respostas
                                    </>
                                  )}
                                </button>
                              </div>

                              {/* Form Fields */}
                              <div className="space-y-4">
                                {chal.fields.map(field => (
                                  <div key={field.key} className="space-y-1.5">
                                    <label className="text-xs font-bold text-[#86868b] block">{field.label}</label>
                                    
                                    {field.type === 'text' && (
                                      <input
                                        type="text"
                                        value={draft[field.key] || ''}
                                        onChange={(e) => handleChallengeFieldChange(chal.id, field.key, e.target.value)}
                                        className="w-full text-xs text-neutral-950 bg-neutral-50 border border-neutral-200 rounded-lg p-3 focus:border-[#0071e3] focus:bg-white focus:outline-none transition-colors"
                                        placeholder="Digite sua resposta técnica..."
                                      />
                                    )}

                                    {field.type === 'textarea' && (
                                      <textarea
                                        rows={3}
                                        value={draft[field.key] || ''}
                                        onChange={(e) => handleChallengeFieldChange(chal.id, field.key, e.target.value)}
                                        className="w-full text-xs text-neutral-950 bg-neutral-50 border border-neutral-200 rounded-lg p-3 resize-none focus:border-[#0071e3] focus:bg-white focus:outline-none transition-colors leading-relaxed"
                                        placeholder="Estruture sua reflexão prática..."
                                      />
                                    )}

                                    {field.type === 'select' && (
                                      <select
                                        value={draft[field.key] || ''}
                                        onChange={(e) => handleChallengeFieldChange(chal.id, field.key, e.target.value)}
                                        className="w-full text-xs text-neutral-950 bg-neutral-50 border border-neutral-200 rounded-lg p-3 focus:border-[#0071e3] focus:bg-white focus:outline-none cursor-pointer"
                                      >
                                        <option value="">Selecione uma opção técnica...</option>
                                        {field.options?.map(opt => (
                                          <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                      </select>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Checklist & Conclusão */}
                  <div className="space-y-4 pt-2">
                    <span className="text-[11px] font-bold tracking-widest text-neutral-400 uppercase block">CRITÉRIOS DE SUCESSO DO MÓDULO</span>
                    
                    <div className="bg-white border border-neutral-200 rounded-[18px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-4">
                      <p className="text-xs text-neutral-500 leading-relaxed">
                        Sinale as etapas abaixo conforme concluir na prática para acompanhar a fixação do conteúdo técnico do módulo.
                      </p>

                      <div className="space-y-2">
                        {activeModule.checklistItems.map(item => {
                          const isChecked = !!progress.checklistStates[item.id];
                          return (
                            <button
                              key={item.id}
                              onClick={() => handleToggleChecklist(item.id)}
                              className={`w-full flex items-center justify-between p-3.5 rounded-xl text-left border transition-all cursor-pointer ${
                                isChecked 
                                  ? 'bg-[#0071e3]/5 border-[#0071e3]/20 text-neutral-900' 
                                  : 'bg-neutral-50/50 border-neutral-200 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                                  isChecked ? 'bg-[#0071e3] border-transparent text-white' : 'border-neutral-300 bg-white'
                                }`}>
                                  {isChecked && <Check size={10} strokeWidth={3} />}
                                </div>
                                <span className="text-xs font-semibold leading-relaxed">{item.task}</span>
                              </div>
                              <span className="text-[8px] font-mono uppercase text-[#86868b] px-2 py-0.5 rounded bg-white border border-neutral-200 font-bold">
                                {item.category}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Caderno de Anotações */}
                  <div className="bg-white border border-neutral-200 p-6 rounded-[18px] space-y-2.5 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
                    <div className="flex justify-between items-center border-b border-neutral-100 pb-2">
                      <span className="text-[10px] font-bold text-[#86868b] uppercase tracking-wider font-mono block">Caderno de Anotações Pessoais</span>
                      <span className="text-[8px] font-mono text-neutral-400 uppercase font-bold">Armazenamento Local Criptografado</span>
                    </div>
                    <textarea
                      value={progress.notes[activeModule.id] || ''}
                      onChange={(e) => handleNotesChange(activeModule.id, e.target.value)}
                      placeholder="Anote suas conclusões técnicas, insights do simulador ou rascunho de vídeos..."
                      className="w-full text-xs text-neutral-900 bg-neutral-50 border border-neutral-200 rounded-lg p-3 resize-none focus:border-[#0071e3] focus:bg-white focus:outline-none leading-relaxed h-20"
                    />
                  </div>

                  {/* Botão de Conclusão Centralizado no final da aula */}
                  <div className="flex justify-center pt-6 pb-2">
                    <button
                      onClick={() => handleToggleLessonComplete(activeLessonId)}
                      className={`rounded-full px-8 py-3.5 font-bold text-sm shadow-md transition-all cursor-pointer select-none ${
                        progress.completedLessons.includes(activeLessonId)
                          ? 'text-emerald-600 bg-emerald-50 border border-emerald-200/60'
                          : 'bg-[#0071e3] hover:bg-[#147ce5] text-white hover:scale-105 active:scale-95 shadow-blue-500/10'
                      }`}
                    >
                      {progress.completedLessons.includes(activeLessonId) ? "Atividade Concluída ✓" : "Marcar como concluída"}
                    </button>
                  </div>

                </motion.div>

              </div>
            )}

          </main>

      </motion.div>

      {/* OVERLAY MODAL: BUSCA (SEARCH MODAL) */}
      {isSearchOpen && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-[10vh] p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="bg-[#1c1c1e]/95 border border-white/10 rounded-2xl max-w-lg w-full shadow-2xl max-h-[70vh] flex flex-col overflow-hidden"
          >
            {/* Search Input Bar */}
            <div className="flex items-center gap-2.5 p-4 border-b border-white/10 shrink-0">
              <Search size={18} className="text-[#86868b]" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-white text-sm focus:outline-none placeholder:text-[#86868b]"
                placeholder="Busque por tópicos, conceitos, equipamentos..."
                autoFocus
              />
              <button 
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchQuery('');
                }}
                className="text-xs font-semibold text-[#0071e3] hover:text-[#147ce5] cursor-pointer"
              >
                Cancelar
              </button>
            </div>

            {/* Results Area */}
            <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
              {searchQuery.trim() === '' ? (
                <div className="p-8 text-center text-xs text-[#86868b] space-y-1">
                  <p className="font-bold">Dicas de Busca</p>
                  <p>Procure por 'roteiro', 'contraste', 'iluminação', 'exposição', etc.</p>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#86868b]">
                  Nenhum resultado encontrado para "{searchQuery}"
                </div>
              ) : (
                <div className="space-y-0.5">
                  {searchResults.map(({ module, lesson }) => (
                    <button
                      key={lesson.id}
                      onClick={() => handleSelectSearchResult(module.id, lesson.id)}
                      className="w-full text-left p-3 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer flex justify-between items-center"
                    >
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-[#00c7fc] uppercase tracking-wider">
                          {getModuleName(module.title)}
                        </span>
                        <h4 className="text-sm font-semibold text-[#f5f5f7] group-hover:text-white truncate">
                          {lesson.title}
                        </h4>
                        <p className="text-xs text-[#86868b] line-clamp-1">
                          {lesson.concept}
                        </p>
                      </div>
                      <ChevronRight size={14} className="text-neutral-600 group-hover:text-white transition-colors shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* OVERLAY MODAL: LOGIN PROMPT / CONTEÚDO EXCLUSIVO */}
      {isExclusiveModalOpen && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#1c1c1e]/90 border border-white/10 rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center space-y-6"
          >
            <div className="mx-auto w-12 h-12 rounded-full bg-[#0071e3]/10 border border-[#0071e3]/20 flex items-center justify-center text-[#00c7fc]">
              <Lock size={22} />
            </div>

            <div className="space-y-1.5">
              <h4 className="text-base font-bold text-white">Conteúdo Exclusivo</h4>
              <p className="text-xs text-[#86868b] leading-relaxed">
                Este manual e suas ferramentas são reservados para alunos inscritos no Playbook do Videomaker. Adquira agora ou faça login.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <button 
                onClick={handleLogin}
                className="w-full py-2.5 bg-[#0071e3] hover:bg-[#147ce5] text-white rounded-xl text-xs font-semibold cursor-pointer shadow-md shadow-blue-500/10 transition-colors"
              >
                Acessar Guia de Sobrevivência
              </button>
              <button 
                onClick={() => setIsExclusiveModalOpen(false)}
                className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-[#f5f5f7] rounded-xl text-xs font-semibold border border-white/5 cursor-pointer transition-colors"
              >
                Voltar
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* MODAL MINHA CONTA */}
      <AnimatePresence>
        {isAccountModalOpen && (
          <div 
            className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setIsAccountModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full max-w-lg bg-[#1c1c1e] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-white space-y-6 my-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b border-white/10 pb-4">
                <div className="space-y-1">
                  <h2 className="text-lg font-bold text-white tracking-tight">Minha Conta</h2>
                  <p className="text-xs text-neutral-400">
                    Gerencie seus dados pessoais. Todas as alterações são salvas automaticamente.
                  </p>
                </div>
                
                <button
                  onClick={() => setIsAccountModalOpen(false)}
                  className="p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                  title="Fechar"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Auto-save notification pill */}
              <AnimatePresence>
                {saveToastVisible && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="flex items-center gap-2 bg-[#30d158]/15 border border-[#30d158]/30 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#30d158]"
                  >
                    <Check size={14} />
                    <span>Alterações salvas automaticamente!</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Content Form */}
              <div className="space-y-4">
                
                {/* 1. Mudar Imagem de Perfil */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block">Foto de Perfil</label>
                  <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-3.5">
                    <img 
                      src={userProfile.avatar} 
                      alt="Avatar" 
                      className="w-16 h-16 rounded-full object-cover border-2 border-[#0071e3] shadow-md shrink-0"
                    />
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <label className="cursor-pointer bg-[#0071e3] hover:bg-[#147ce5] text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm">
                          <Upload size={13} />
                          <span>Mudar Imagem</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleAvatarFileChange} 
                            className="hidden" 
                          />
                        </label>
                      </div>
                      <p className="text-[11px] text-neutral-400 leading-tight">
                        Selecione qualquer arquivo de imagem (.webp, .png, .jpg) do seu computador.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. Nome e Sobrenome */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-neutral-300 block">Nome</label>
                    <input 
                      type="text"
                      value={userProfile.firstName}
                      onChange={(e) => updateUserProfile({ firstName: e.target.value })}
                      placeholder="Seu nome"
                      className="w-full bg-[#2c2c2e] border border-white/10 focus:border-[#0071e3] rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-neutral-300 block">Sobrenome</label>
                    <input 
                      type="text"
                      value={userProfile.lastName}
                      onChange={(e) => updateUserProfile({ lastName: e.target.value })}
                      placeholder="Seu sobrenome"
                      className="w-full bg-[#2c2c2e] border border-white/10 focus:border-[#0071e3] rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* 3. E-mail */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-300 block">E-mail</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                    <input 
                      type="email"
                      value={userProfile.email}
                      onChange={(e) => updateUserProfile({ email: e.target.value })}
                      placeholder="seu.email@exemplo.com"
                      className="w-full bg-[#2c2c2e] border border-white/10 focus:border-[#0071e3] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* 4. Número de Telefone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-300 block">Número de Telefone</label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                    <input 
                      type="tel"
                      value={userProfile.phone}
                      onChange={(e) => updateUserProfile({ phone: e.target.value })}
                      placeholder="(11) 98765-4321"
                      className="w-full bg-[#2c2c2e] border border-white/10 focus:border-[#0071e3] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* 5. Mudar a Senha e Confirmar Senha */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-neutral-300 block">Senha</label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                      <input 
                        type={showPassword ? "text" : "password"}
                        value={userProfile.password}
                        onChange={(e) => updateUserProfile({ password: e.target.value })}
                        placeholder="Sua senha"
                        className="w-full bg-[#2c2c2e] border border-white/10 focus:border-[#0071e3] rounded-xl pl-9 pr-9 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(prev => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                        title={showPassword ? "Ocultar senha" : "Exibir senha"}
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-neutral-300 block">Confirmar Senha</label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                      <input 
                        type={showConfirmPassword ? "text" : "password"}
                        value={userProfile.confirmPassword ?? userProfile.password}
                        onChange={(e) => updateUserProfile({ confirmPassword: e.target.value })}
                        placeholder="Repita a senha"
                        className={`w-full bg-[#2c2c2e] border rounded-xl pl-9 pr-9 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none transition-colors ${
                          userProfile.password !== (userProfile.confirmPassword ?? userProfile.password)
                            ? 'border-red-500/60 focus:border-red-500'
                            : 'border-white/10 focus:border-[#0071e3]'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(prev => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                        title={showConfirmPassword ? "Ocultar senha" : "Exibir senha"}
                      >
                        {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                </div>

                {userProfile.confirmPassword !== undefined && userProfile.password !== userProfile.confirmPassword && (
                  <p className="text-[11px] text-red-400 font-medium">As senhas não coincidem.</p>
                )}

              </div>

              {/* Modal Footer */}
              {(() => {
                const isFormComplete = 
                  Boolean(userProfile.firstName?.trim()) &&
                  Boolean(userProfile.lastName?.trim()) &&
                  Boolean(userProfile.email?.trim()) &&
                  Boolean(userProfile.phone?.trim()) &&
                  Boolean(userProfile.password) &&
                  Boolean(userProfile.confirmPassword ?? userProfile.password) &&
                  userProfile.password === (userProfile.confirmPassword ?? userProfile.password);

                return (
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between min-h-[44px]">
                    <span className="text-[11px] text-neutral-400 flex items-center gap-1.5">
                      {isFormComplete ? (
                        <>
                          <CheckCircle2 size={13} className="text-[#30d158]" />
                          Salvo em tempo real
                        </>
                      ) : (
                        <span className="text-amber-400/90 text-[11px]">
                          Preencha todos os campos e confirme a senha
                        </span>
                      )}
                    </span>
                    {isFormComplete && (
                      <button 
                        onClick={() => setIsAccountModalOpen(false)}
                        className="px-5 py-2 bg-[#0071e3] hover:bg-[#147ce5] text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-md shadow-blue-500/20"
                      >
                        Concluído
                      </button>
                    )}
                  </div>
                );
              })()}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DRAWER MOBILE MENU (Para telas pequenas) */}
      {isMobileMenuOpen && isLoggedIn && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
          <motion.div 
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-72 h-full bg-[#111112]/85 backdrop-blur-xl border-r border-white/10 shadow-2xl flex flex-col p-4 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <span className="text-xs font-bold text-[#86868b] uppercase tracking-wider">Módulos de Estudo</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-[#86868b] hover:text-white p-1 rounded-md">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1">
              <button 
                onClick={() => {
                  setActiveLessonId('');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-[12px] text-left text-xs font-semibold ${
                  !activeLessonId ? 'bg-[#0071e3]/20 text-[#0071e3]' : 'text-white'
                }`}
              >
                <BookOpen size={14} />
                <span>Visão Geral do Curso</span>
              </button>

              {modulesData.map(mod => (
                <div key={mod.id} className="space-y-1">
                  <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest block px-2.5 pt-2">{getModuleName(mod.title)}</span>
                  {mod.subtopics.map(sub => (
                    <button
                      key={sub.id}
                      onClick={() => {
                        setActiveModuleId(mod.id);
                        setActiveLessonId(sub.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs flex justify-between items-center ${
                        activeLessonId === sub.id ? 'bg-[#0071e3] text-white' : 'text-neutral-400'
                      }`}
                    >
                      <span className="truncate">{sub.title}</span>
                      {progress.completedLessons.includes(sub.id) && <CheckCircle2 size={10} className="text-[#30d158] ml-2 shrink-0" />}
                    </button>
                  ))}
                </div>
              ))}
            </div>

            <button 
              onClick={handleLogout}
              className="w-full py-2.5 bg-red-600/10 text-red-500 border border-red-500/20 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Fazer Logout
            </button>
          </motion.div>
        </div>
      )}

      {/* Supabase Auth Login Modal */}
      <SupabaseLoginModal
        isOpen={isSupabaseLoginOpen}
        onClose={() => setIsSupabaseLoginOpen(false)}
        onSuccessLogin={(email) => {
          setIsLoggedIn(true);
          localStorage.setItem(LOGIN_KEY, 'true');
          updateUserProfile({ email });
        }}
        onNavigateForgotPassword={() => {
          setCurrentRoute('esqueci-senha');
        }}
      />

      {/* Stripe In-Page Glassmorphic Checkout Modal */}
      <StripeCheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        title={checkoutModalInfo.title}
        description={checkoutModalInfo.description}
      />

    </div>
  );
}
