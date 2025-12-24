import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, MessageCircle, Inbox, Brain, FileText, Bell,
  Phone, Video, Users, Clock, CheckCircle, Send, ChevronRight,
  Calendar, Shield, Building2, Radio, PhoneCall, Mail, Trophy, Command, Search,
  Crown, Target, BarChart3, Gift, Sparkles, UsersRound, Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useComms } from '@/contexts/CommsContext';
import { useRealtime } from '@/hooks/useRealtime';
import { useGamification } from '@/hooks/useGamification';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';
import { UserMenu } from '@/components/layout/UserMenu';
import { ServiceSidebar } from '@/components/layout/ServiceSidebar';
import { BadgesPanel } from '@/components/gamification/BadgesPanel';
import { BadgeCelebration } from '@/components/gamification/BadgeCelebration';
import { Leaderboard } from '@/components/gamification/Leaderboard';
import { DailyChallengesPanel } from '@/components/gamification/DailyChallengesPanel';
import { GlobalSearchDialog } from '@/components/search/GlobalSearchDialog';
import { NotificationSettings } from '@/components/gamification/NotificationSettings';
import { StatsPanel } from '@/components/gamification/StatsPanel';
import { WeeklyRewardsPanel } from '@/components/gamification/WeeklyRewardsPanel';
import { MonthlyQuestsPanel } from '@/components/gamification/MonthlyQuestsPanel';
import { TeamPerformancePanel } from '@/components/gamification/TeamPerformancePanel';
import { useDailyChallenges } from '@/hooks/useDailyChallenges';
import { useNotifications } from '@/hooks/useNotifications';
import { useWeeklyRewards } from '@/hooks/useWeeklyRewards';
import { useMonthlyQuests } from '@/hooks/useMonthlyQuests';
import { useActionTracker } from '@/contexts/ActionTrackerContext';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface RecentContact {
  id: string;
  name: string;
  avatar?: string;
  lastSeen: string;
  online: boolean;
  role?: string;
}

interface RecentConversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  participants: string[];
}

interface UpcomingMeeting {
  id: string;
  title: string;
  time: string;
  date: string;
  participants: number;
}

interface OfficialDocument {
  id: string;
  title: string;
  status: 'pending' | 'signed' | 'draft';
  date: string;
  from: string;
}

// Profile types
type DelegatedProfile = 'citizen' | 'gov-agent' | 'custom';

interface ProfileConfig {
  name: string;
  description: string;
  icon: typeof User;
  color: string;
  bgColor: string;
}

const profileConfigs: Record<DelegatedProfile, ProfileConfig> = {
  'citizen': {
    name: 'Espace Citoyen',
    description: 'iChat + iContact',
    icon: User,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
  },
  'gov-agent': {
    name: 'Agent Gouvernemental',
    description: 'Full iCom + iCorrespondance',
    icon: Shield,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20',
  },
  'custom': {
    name: 'Espace Personnel',
    description: 'Configuration personnalisée',
    icon: Building2,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
  },
};

export default function DelegatedDashboard() {
  const { t } = useTranslation();
  const { payload, hasScope } = useAuth();
  const { openCommsCenter } = useComms();
  const { events, isConnected, connect, disconnect } = useRealtime();
  const { stats, badges, unlockedBadges, levelProgress, celebrationBadge, dismissCelebration, userId, addPoints } = useGamification();
  const globalSearch = useGlobalSearch();
  const dailyChallenges = useDailyChallenges();
  const notifications = useNotifications();
  const weeklyRewards = useWeeklyRewards(addPoints);
  const monthlyQuests = useMonthlyQuests(addPoints);
  const actionTracker = useActionTracker();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showBadges, setShowBadges] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showChallenges, setShowChallenges] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showWeeklyRewards, setShowWeeklyRewards] = useState(false);
  const [showMonthlyQuests, setShowMonthlyQuests] = useState(false);
  const [showTeamPerformance, setShowTeamPerformance] = useState(false);
  
  // Auto-connect to realtime on mount
  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);
  
  // Track daily login and check expiring challenges
  useEffect(() => {
    actionTracker.trackAction('daily_login');
    
    // Check for expiring challenges every minute
    const interval = setInterval(() => {
      notifications.checkExpiringChallenges(dailyChallenges.challenges);
    }, 60000);
    
    notifications.checkExpiringChallenges(dailyChallenges.challenges);
    
    return () => clearInterval(interval);
  }, []);
  
  // Check leaderboard position periodically
  useEffect(() => {
    if (userId) {
      notifications.checkLeaderboardPosition(userId);
      
      const interval = setInterval(() => {
        notifications.checkLeaderboardPosition(userId);
      }, 300000);
      
      return () => clearInterval(interval);
    }
  }, [userId, notifications]);
  
  // Keyboard shortcut for global search (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        globalSearch.toggle();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [globalSearch]);
  
  // Check which features are enabled
  const hasChat = hasScope('icom:chat:*');
  const hasCall = hasScope('icom:call:use');
  const hasMeeting = hasScope('icom:meeting:use');
  const hasContact = hasScope('icom:contact:read');
  const hasIboite = hasScope('iboite:read');
  const hasIasted = hasScope('iasted:chat');
  const hasCorrespondance = hasScope('icorrespondance:read');
  
  // Determine profile based on realm and scopes
  const getProfile = (): DelegatedProfile => {
    const realm = payload?.realm;
    if (realm === 'government' && hasChat && hasCall && hasMeeting && hasContact && hasCorrespondance) {
      return 'gov-agent';
    }
    if (realm === 'citizen' && hasChat && hasContact && !hasCall && !hasMeeting) {
      return 'citizen';
    }
    return 'custom';
  };
  
  const profile = getProfile();
  const profileConfig = profileConfigs[profile];
  const ProfileIcon = profileConfig.icon;
  const isGovAgent = profile === 'gov-agent';
  const isCitizen = profile === 'citizen';
  
  // Mock data - Citizen conversations
  const citizenConversations: RecentConversation[] = [
    {
      id: 'conv-1',
      title: 'Service des impôts',
      lastMessage: 'Votre dossier a été traité avec succès.',
      timestamp: 'Il y a 5 min',
      unread: 2,
      participants: ['Agent Fiscal'],
    },
    {
      id: 'conv-2',
      title: 'Mairie - État civil',
      lastMessage: 'Merci de fournir les documents demandés.',
      timestamp: 'Il y a 1h',
      unread: 0,
      participants: ['Agent Municipal'],
    },
    {
      id: 'conv-3',
      title: 'Support NDJOBI',
      lastMessage: 'Comment pouvons-nous vous aider ?',
      timestamp: 'Hier',
      unread: 1,
      participants: ['Assistant'],
    },
  ];
  
  // Mock data - Gov Agent conversations
  const govConversations: RecentConversation[] = [
    {
      id: 'conv-1',
      title: 'Direction Générale',
      lastMessage: 'Rapport validé. Merci pour votre travail.',
      timestamp: 'Il y a 10 min',
      unread: 1,
      participants: ['Directeur Adjoint', 'Chef de Cabinet'],
    },
    {
      id: 'conv-2',
      title: 'Équipe Technique',
      lastMessage: 'Le système est opérationnel.',
      timestamp: 'Il y a 30 min',
      unread: 3,
      participants: ['5 membres'],
    },
    {
      id: 'conv-3',
      title: 'Service Juridique',
      lastMessage: 'Document signé et archivé.',
      timestamp: 'Il y a 2h',
      unread: 0,
      participants: ['Conseiller Juridique'],
    },
  ];
  
  // Mock data - Contacts
  const citizenContacts: RecentContact[] = [
    { id: 'c1', name: 'Service Impôts', lastSeen: 'En ligne', online: true },
    { id: 'c2', name: 'Mairie Centrale', lastSeen: 'Il y a 30 min', online: false },
    { id: 'c3', name: 'Support Citoyen', lastSeen: 'En ligne', online: true },
    { id: 'c4', name: 'Préfecture', lastSeen: 'Il y a 2h', online: false },
  ];
  
  const govContacts: RecentContact[] = [
    { id: 'c1', name: 'Jean-Pierre Martin', role: 'Directeur', lastSeen: 'En ligne', online: true },
    { id: 'c2', name: 'Marie Dubois', role: 'Chef de Service', lastSeen: 'En ligne', online: true },
    { id: 'c3', name: 'Paul Leroy', role: 'Conseiller', lastSeen: 'Il y a 15 min', online: false },
    { id: 'c4', name: 'Sophie Bernard', role: 'Assistante', lastSeen: 'En ligne', online: true },
    { id: 'c5', name: 'Thomas Petit', role: 'Technicien', lastSeen: 'Il y a 1h', online: false },
  ];
  
  // Mock data - Meetings (Gov Agent only)
  const upcomingMeetings: UpcomingMeeting[] = [
    { id: 'm1', title: 'Réunion de cabinet', time: '14:00', date: 'Aujourd\'hui', participants: 8 },
    { id: 'm2', title: 'Point sécurité', time: '10:00', date: 'Demain', participants: 5 },
    { id: 'm3', title: 'Formation RGPD', time: '15:00', date: 'Ven 27', participants: 15 },
  ];
  
  // Mock data - Official documents (Gov Agent only)
  const officialDocuments: OfficialDocument[] = [
    { id: 'd1', title: 'Arrêté N°2024-0892', status: 'pending', date: 'Aujourd\'hui', from: 'Préfet' },
    { id: 'd2', title: 'Note de service #45', status: 'draft', date: 'Hier', from: 'DRH' },
    { id: 'd3', title: 'Convention interministérielle', status: 'signed', date: '20 Déc', from: 'Ministère' },
  ];
  
  const recentConversations = isGovAgent ? govConversations : citizenConversations;
  const frequentContacts = isGovAgent ? govContacts : citizenContacts;
  
  const modules = [
    { 
      id: 'chat', 
      name: 'iChat', 
      icon: MessageCircle, 
      description: 'Messages instantanés',
      color: 'text-blue-500 bg-blue-500/20',
      enabled: hasChat,
      unread: recentConversations.reduce((sum, c) => sum + c.unread, 0),
    },
    { 
      id: 'call', 
      name: 'iAppel', 
      icon: Phone, 
      description: 'Appels vocaux',
      color: 'text-orange-500 bg-orange-500/20',
      enabled: hasCall,
      unread: 1,
    },
    { 
      id: 'meeting', 
      name: 'iRéunion', 
      icon: Video, 
      description: 'Visioconférences',
      color: 'text-purple-500 bg-purple-500/20',
      enabled: hasMeeting,
      unread: upcomingMeetings.length,
    },
    { 
      id: 'contact', 
      name: 'iContact', 
      icon: Users, 
      description: 'Annuaire',
      color: 'text-emerald-500 bg-emerald-500/20',
      enabled: hasContact,
      unread: 0,
    },
    { 
      id: 'iboite', 
      name: 'iBoîte', 
      icon: Inbox, 
      description: 'Messages asynchrones',
      color: 'text-iboite bg-iboite/20',
      enabled: hasIboite,
      unread: 5,
    },
    { 
      id: 'iasted', 
      name: 'iAsted', 
      icon: Brain, 
      description: 'Assistant IA',
      color: 'text-neural bg-neural/20',
      enabled: hasIasted,
      unread: 0,
    },
    { 
      id: 'icorrespondance', 
      name: 'iCorrespondance', 
      icon: FileText, 
      description: 'Courrier officiel',
      color: 'text-primary bg-primary/20',
      enabled: hasCorrespondance,
      unread: officialDocuments.filter(d => d.status === 'pending').length,
    },
  ];
  
  const enabledModules = modules.filter(m => m.enabled);
  const totalUnread = enabledModules.reduce((sum, m) => sum + m.unread, 0);
  const recentEvents = events.slice(-5).reverse();
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-warning/20 text-warning';
      case 'signed': return 'bg-success/20 text-success';
      case 'draft': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'À signer';
      case 'signed': return 'Signé';
      case 'draft': return 'Brouillon';
      default: return status;
    }
  };
  
  // Handle sidebar panel actions
  const handlePanelOpen = (panel: string) => {
    switch (panel) {
      case 'chat':
      case 'call':
      case 'meeting':
      case 'contact':
      case 'iboite':
        openCommsCenter();
        break;
      case 'iasted':
        openCommsCenter();
        break;
      case 'icorrespondance':
        openCommsCenter();
        break;
      case 'challenges':
        setShowChallenges(true);
        break;
      case 'weekly-rewards':
        setShowWeeklyRewards(true);
        break;
      case 'monthly-quests':
        setShowMonthlyQuests(true);
        break;
      case 'badges':
        setShowBadges(true);
        break;
      case 'leaderboard':
        setShowLeaderboard(true);
        break;
      case 'team':
        setShowTeamPerformance(true);
        break;
      case 'stats':
        setShowStats(true);
        break;
      case 'notifications':
        setShowNotificationSettings(true);
        break;
    }
  };
  
  // Calculate unread counts
  const unreadCounts = {
    chat: recentConversations.reduce((sum, c) => sum + c.unread, 0),
    calls: 1,
    meetings: upcomingMeetings.length,
    inbox: 5,
    documents: officialDocuments.filter(d => d.status === 'pending').length,
  };
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        {/* Sidebar */}
        <ServiceSidebar
          mode="delegated"
          onOpenPanel={handlePanelOpen}
          unreadCounts={unreadCounts}
          gamificationStats={{
            level: stats.level,
            streak: weeklyRewards.challengeStreak,
            claimableQuests: monthlyQuests.claimableCount,
            pendingChallenges: dailyChallenges.totalChallenges - dailyChallenges.completedCount,
          }}
        />
        
        {/* Main Content */}
        <SidebarInset className="flex-1">
          {/* Header */}
          <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-40">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <SidebarTrigger className="-ml-1" />
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", profileConfig.bgColor)}>
                      <ProfileIcon className={cn("w-5 h-5", profileConfig.color)} />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-foreground">{profileConfig.name}</h1>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-muted-foreground font-mono">{payload?.actor_id || payload?.app_id}</p>
                        <span className={cn(
                          "w-2 h-2 rounded-full",
                          isConnected ? "bg-green-500" : "bg-muted"
                        )} title={isConnected ? 'Connecté' : 'Déconnecté'} />
                      </div>
                    </div>
                  </div>
                </div>
            
            <div className="flex items-center gap-3">
              {/* Global Search Button */}
              <Button
                variant="outline"
                className="hidden md:flex items-center gap-2 px-3 h-9 text-muted-foreground hover:text-foreground"
                onClick={() => globalSearch.open()}
              >
                <Search className="w-4 h-4" />
                <span className="text-sm">Rechercher...</span>
                <kbd className="ml-2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                  <Command className="w-3 h-3" />K
                </kbd>
              </Button>
              
              {/* Mobile Search Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => globalSearch.open()}
              >
                <Search className="w-5 h-5" />
              </Button>
              
              {/* Stats Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowStats(true)}
                title="Statistiques"
              >
                <BarChart3 className="w-5 h-5 text-cyan-500" />
              </Button>
              
              {/* Team Performance Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowTeamPerformance(true)}
                title="Performance équipe"
              >
                <UsersRound className="w-5 h-5 text-blue-500" />
              </Button>
              
              {/* Monthly Quests Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowMonthlyQuests(true)}
                className="relative"
                title="Quêtes mensuelles"
              >
                <Sparkles className="w-5 h-5 text-purple-500" />
                {monthlyQuests.claimableCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full text-xs flex items-center justify-center text-white font-medium">
                    {monthlyQuests.claimableCount}
                  </span>
                )}
              </Button>
              
              {/* Weekly Rewards Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowWeeklyRewards(true)}
                className="relative"
                title="Récompenses hebdo"
              >
                <Gift className="w-5 h-5 text-pink-500" />
                {weeklyRewards.challengeStreak > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 rounded-full text-xs flex items-center justify-center text-white font-medium">
                    {weeklyRewards.challengeStreak}
                  </span>
                )}
              </Button>
              
              {/* Daily Challenges Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowChallenges(true)}
                className="relative"
                title="Défis du jour"
              >
                <Target className="w-5 h-5 text-orange-500" />
                {dailyChallenges.completedCount < dailyChallenges.totalChallenges && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full text-xs flex items-center justify-center text-white font-medium">
                    {dailyChallenges.totalChallenges - dailyChallenges.completedCount}
                  </span>
                )}
              </Button>
              
              {/* Badges Button */}
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:flex items-center gap-2"
                onClick={() => setShowBadges(true)}
              >
                <Trophy className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium">Niv. {stats.level}</span>
              </Button>
              
              {/* Leaderboard Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowLeaderboard(true)}
                title="Classement"
              >
                <Crown className="w-5 h-5 text-purple-500" />
              </Button>
              
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <Bell className="w-5 h-5" />
                  {totalUnread > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full text-xs flex items-center justify-center text-destructive-foreground font-medium">
                      {totalUnread > 9 ? '9+' : totalUnread}
                    </span>
                  )}
                </Button>
                
                {/* Notifications dropdown */}
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 top-12 w-80 glass rounded-xl border border-border/50 shadow-xl z-50"
                    >
                      <div className="p-3 border-b border-border/50">
                        <h4 className="font-medium text-foreground">Notifications</h4>
                        <p className="text-xs text-muted-foreground">
                          {recentEvents.length} événements récents
                        </p>
                      </div>
                      <ScrollArea className="h-64">
                        <div className="p-2 space-y-1">
                          {recentEvents.length > 0 ? (
                            recentEvents.map((event) => (
                              <div
                                key={event.event_id}
                                className="p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-lg bg-icom/20 flex items-center justify-center">
                                    <MessageCircle className="w-4 h-4 text-icom" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">
                                      {event.type.replace('.', ' ')}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {new Date(event.timestamp).toLocaleTimeString('fr-FR')}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-4 text-center text-muted-foreground text-sm">
                              Aucune notification récente
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Notification Settings Button */}
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setShowNotificationSettings(true)}
                title="Paramètres notifications"
              >
                <Bell className={cn(
                  "w-5 h-5",
                  notifications.permission === 'granted' ? "text-success" : "text-muted-foreground"
                )} />
              </Button>
              
              <UserMenu />
            </div>
          </div>
        </div>
      </header>
      
      <main className="px-6 py-8">
        {/* Welcome */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {t('dashboard.delegated.welcome')}, {payload?.actor_id || t('modes.delegated')}
          </h2>
          <p className="text-muted-foreground">
            {isGovAgent 
              ? 'Accédez à vos outils de communication et correspondance officielle'
              : t('dashboard.delegated.accessComms')
            }
          </p>
        </motion.div>
        
        {/* Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-6 mb-8"
        >
          <h3 className="font-medium text-foreground mb-4">{t('dashboard.delegated.quickActions')}</h3>
          <div className="flex flex-wrap gap-3">
            {hasChat && (
              <Button variant="neural" onClick={openCommsCenter}>
                <MessageCircle className="w-4 h-4 mr-2" />
                {t('dashboard.delegated.newConversation')}
              </Button>
            )}
            {hasContact && (
              <Button variant="outline" onClick={openCommsCenter}>
                <Users className="w-4 h-4 mr-2" />
                Mes contacts
              </Button>
            )}
            {hasCall && (
              <Button variant="outline" onClick={openCommsCenter} className="border-orange-500/30 hover:bg-orange-500/10">
                <Phone className="w-4 h-4 mr-2 text-orange-500" />
                Passer un appel
              </Button>
            )}
            {hasMeeting && (
              <Button variant="outline" onClick={openCommsCenter} className="border-purple-500/30 hover:bg-purple-500/10">
                <Video className="w-4 h-4 mr-2 text-purple-500" />
                Planifier réunion
              </Button>
            )}
            {hasCorrespondance && (
              <Button variant="outline" onClick={openCommsCenter}>
                <FileText className="w-4 h-4 mr-2" />
                Nouveau courrier
              </Button>
            )}
          </div>
        </motion.div>
        
        <div className={cn(
          "grid gap-6",
          isGovAgent ? "lg:grid-cols-3" : "lg:grid-cols-3"
        )}>
          {/* Recent Conversations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className={cn(
              "glass rounded-2xl p-6",
              isGovAgent ? "" : "lg:col-span-2"
            )}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-foreground flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-blue-500" />
                Conversations récentes
              </h3>
              <Button variant="ghost" size="sm" onClick={openCommsCenter}>
                Voir tout <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            
            <div className="space-y-3">
              {recentConversations.map((conv) => (
                <motion.button
                  key={conv.id}
                  whileHover={{ scale: 1.01 }}
                  className="w-full p-4 rounded-xl bg-background/50 hover:bg-background/80 transition-colors text-left flex items-center gap-4"
                  onClick={openCommsCenter}
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-6 h-6 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-foreground truncate">{conv.title}</h4>
                      <span className="text-xs text-muted-foreground">{conv.timestamp}</span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">{conv.participants.join(', ')}</span>
                    </div>
                  </div>
                  {conv.unread > 0 && (
                    <Badge variant="destructive" className="flex-shrink-0">
                      {conv.unread}
                    </Badge>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
          
          {/* Upcoming Meetings - Gov Agent only */}
          {isGovAgent && hasMeeting && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-foreground flex items-center gap-2">
                  <Video className="w-4 h-4 text-purple-500" />
                  Réunions à venir
                </h3>
              </div>
              
              <div className="space-y-3">
                {upcomingMeetings.map((meeting, index) => (
                  <div 
                    key={meeting.id}
                    className={cn(
                      "p-3 rounded-xl transition-colors cursor-pointer",
                      index === 0 
                        ? "bg-purple-500/10 border border-purple-500/30" 
                        : "bg-background/50 hover:bg-background/80"
                    )}
                    onClick={openCommsCenter}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-foreground text-sm">{meeting.title}</span>
                      {index === 0 && (
                        <Badge variant="outline" className="border-purple-500/30 text-purple-500 text-xs">
                          Bientôt
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {meeting.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {meeting.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {meeting.participants}
                      </span>
                    </div>
                    {index === 0 && (
                      <Button size="sm" className="w-full mt-3 bg-purple-500 hover:bg-purple-600">
                        <Video className="w-4 h-4 mr-2" />
                        Rejoindre
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
          
          {/* Frequent Contacts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-foreground flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-500" />
                Contacts fréquents
              </h3>
              <Button variant="ghost" size="sm" onClick={openCommsCenter}>
                <Users className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-3">
              {frequentContacts.slice(0, isGovAgent ? 5 : 4).map((contact) => (
                <motion.button
                  key={contact.id}
                  whileHover={{ scale: 1.02 }}
                  className="w-full p-3 rounded-xl bg-background/50 hover:bg-background/80 transition-colors flex items-center gap-3"
                  onClick={openCommsCenter}
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <User className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <span className={cn(
                      "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card",
                      contact.online ? "bg-green-500" : "bg-muted"
                    )} />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="text-sm font-medium text-foreground">{contact.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {contact.role || contact.lastSeen}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {hasChat && (
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                    )}
                    {hasCall && (
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Phone className="w-4 h-4 text-orange-500" />
                      </Button>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
        
        {/* Official Documents - Gov Agent only */}
        {isGovAgent && hasCorrespondance && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-6 glass rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Correspondance officielle
              </h3>
              <Button variant="ghost" size="sm" onClick={openCommsCenter}>
                Voir tout <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            
            <div className="grid gap-4 md:grid-cols-3">
              {officialDocuments.map((doc) => (
                <motion.button
                  key={doc.id}
                  whileHover={{ scale: 1.02 }}
                  className="p-4 rounded-xl bg-background/50 hover:bg-background/80 transition-colors text-left"
                  onClick={openCommsCenter}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <Badge className={cn("text-xs", getStatusColor(doc.status))}>
                      {getStatusLabel(doc.status)}
                    </Badge>
                  </div>
                  <h4 className="font-medium text-foreground text-sm mb-1">{doc.title}</h4>
                  <p className="text-xs text-muted-foreground">
                    De: {doc.from} · {doc.date}
                  </p>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
        
        {/* Modules Grid */}
        <h3 className="font-medium text-foreground mt-8 mb-4">{t('dashboard.delegated.yourServices')}</h3>
        <div className={cn(
          "grid gap-4",
          enabledModules.length <= 4 ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-3 lg:grid-cols-4"
        )}>
          {enabledModules.map((module, index) => (
            <motion.button
              key={module.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              className="glass rounded-xl p-5 text-left hover:border-primary/30 transition-colors"
              onClick={openCommsCenter}
            >
              <div className="flex items-start justify-between">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center",
                  module.color
                )}>
                  <module.icon className="w-6 h-6" />
                </div>
                
                {module.unread > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {module.unread}
                  </Badge>
                )}
              </div>
              
              <h4 className="font-medium text-foreground mt-4 mb-1">{module.name}</h4>
              <p className="text-sm text-muted-foreground">{module.description}</p>
            </motion.button>
          ))}
        </div>
        
        {/* Session Info - Gov Agent */}
        {isGovAgent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6 glass rounded-2xl p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant="default" className={cn(
                  "border",
                  isConnected 
                    ? "bg-success/20 text-success border-success/30" 
                    : "bg-muted/20 text-muted-foreground border-muted/30"
                )}>
                  <Radio className={cn("w-3 h-3 mr-1", isConnected && "animate-pulse")} />
                  {isConnected ? 'Connecté' : 'Hors ligne'}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Réseau: <span className="font-mono">{payload?.network_type}</span>
                </span>
                <span className="text-xs text-muted-foreground">
                  App: <span className="font-mono">{payload?.app_id}</span>
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date().toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          </motion.div>
        )}
        
        {/* Disabled modules notice */}
        {modules.some(m => !m.enabled) && !isGovAgent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 p-4 rounded-xl bg-muted/50 text-sm text-muted-foreground"
          >
            {t('dashboard.delegated.servicesNotAvailable')}
          </motion.div>
        )}
        
        {/* Realtime Status */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground"
        >
          <span className={cn(
            "w-2 h-2 rounded-full",
            isConnected ? "bg-green-500 animate-pulse" : "bg-muted"
          )} />
          {isConnected ? 'Notifications en temps réel actives' : 'Connexion aux notifications...'}
        </motion.div>
      </main>
      
      {/* Badges Panel */}
      <BadgesPanel 
        isOpen={showBadges} 
        onClose={() => setShowBadges(false)}
        badges={badges}
        stats={stats}
        levelProgress={levelProgress}
        unlockedCount={unlockedBadges.length}
      />
      
      {/* Leaderboard */}
      <Leaderboard
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        currentUserId={userId || undefined}
      />
      
      {/* Daily Challenges Panel */}
      <DailyChallengesPanel
        isOpen={showChallenges}
        onClose={() => setShowChallenges(false)}
        challenges={dailyChallenges.challenges}
        completedCount={dailyChallenges.completedCount}
        totalChallenges={dailyChallenges.totalChallenges}
        earnedReward={dailyChallenges.earnedReward}
        totalReward={dailyChallenges.totalReward}
        timeRemaining={dailyChallenges.timeRemaining}
        allCompleted={dailyChallenges.allCompleted}
        onClaimBonus={dailyChallenges.claimBonus}
      />
      
      {/* Badge Celebration */}
      <BadgeCelebration
        badge={celebrationBadge}
        onDismiss={dismissCelebration}
      />
      
      {/* Notification Settings */}
      <NotificationSettings
        isOpen={showNotificationSettings}
        onClose={() => setShowNotificationSettings(false)}
        permission={notifications.permission}
        settings={notifications.settings}
        onRequestPermission={notifications.requestPermission}
        onUpdateSettings={notifications.updateSettings}
      />
      
      {/* Stats Panel */}
      <StatsPanel
        isOpen={showStats}
        onClose={() => setShowStats(false)}
        stats={stats}
      />
      
      {/* Weekly Rewards Panel */}
      <WeeklyRewardsPanel
        isOpen={showWeeklyRewards}
        onClose={() => setShowWeeklyRewards(false)}
        currentStreak={weeklyRewards.challengeStreak}
        completedChallengesThisWeek={weeklyRewards.completedChallengesThisWeek}
        onClaimReward={weeklyRewards.claimReward}
        claimedRewards={weeklyRewards.claimedRewards}
      />
      
      {/* Monthly Quests Panel */}
      <MonthlyQuestsPanel
        isOpen={showMonthlyQuests}
        onClose={() => setShowMonthlyQuests(false)}
        quests={monthlyQuests.quests}
        onClaimReward={monthlyQuests.claimQuestReward}
        timeRemaining={monthlyQuests.timeRemaining}
        completedCount={monthlyQuests.completedCount}
        claimableCount={monthlyQuests.claimableCount}
        totalRewardPoints={monthlyQuests.totalRewardPoints}
        earnedRewardPoints={monthlyQuests.earnedRewardPoints}
      />
      
      {/* Team Performance Panel */}
      <TeamPerformancePanel
        isOpen={showTeamPerformance}
        onClose={() => setShowTeamPerformance(false)}
        currentUserId={userId || undefined}
      />
      
      {/* Global Search Dialog */}
      <GlobalSearchDialog
        isOpen={globalSearch.isOpen}
        onClose={globalSearch.close}
        query={globalSearch.query}
        onQueryChange={globalSearch.setQuery}
        results={globalSearch.searchResults}
        resultsByType={globalSearch.resultsByType}
        activeFilter={globalSearch.activeFilter}
        onFilterChange={globalSearch.setActiveFilter}
      />
    </SidebarInset>
    </div>
    </SidebarProvider>
  );
}
