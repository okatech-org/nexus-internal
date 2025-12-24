import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Server, 
  MessageCircle, 
  Inbox, 
  Brain, 
  FileText, 
  Radio,
  Phone,
  Video,
  Users,
  Clock,
  Calendar,
  Send,
  PhoneCall,
  PhoneIncoming,
  PhoneMissed,
  Mail,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Activity,
  Search,
  Plus,
  MoreVertical,
  Bell,
  Building2,
  Briefcase,
  Trophy,
  Command,
  Crown,
  Target,
  BarChart3,
  Gift,
  Sparkles,
  UsersRound
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { useComms } from '@/contexts/CommsContext';
import { useRealtime } from '@/hooks/useRealtime';
import { useGamification } from '@/hooks/useGamification';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';
import { UserMenu } from '@/components/layout/UserMenu';
import { BadgesPanel } from '@/components/gamification/BadgesPanel';
import { BadgeCelebration } from '@/components/gamification/BadgeCelebration';
import { Leaderboard } from '@/components/gamification/Leaderboard';
import { DailyChallengesPanel } from '@/components/gamification/DailyChallengesPanel';
import { NotificationSettings } from '@/components/gamification/NotificationSettings';
import { StatsPanel } from '@/components/gamification/StatsPanel';
import { WeeklyRewardsPanel } from '@/components/gamification/WeeklyRewardsPanel';
import { MonthlyQuestsPanel } from '@/components/gamification/MonthlyQuestsPanel';
import { TeamPerformancePanel } from '@/components/gamification/TeamPerformancePanel';
import { GlobalSearchDialog } from '@/components/search/GlobalSearchDialog';
import { useDailyChallenges } from '@/hooks/useDailyChallenges';
import { useNotifications } from '@/hooks/useNotifications';
import { useWeeklyRewards } from '@/hooks/useWeeklyRewards';
import { useMonthlyQuests } from '@/hooks/useMonthlyQuests';
import { useActionTracker } from '@/contexts/ActionTrackerContext';
import { cn } from '@/lib/utils';

// Mock data for the dashboard
const mockConversations = [
  { id: '1', name: 'Jean Dupont', lastMessage: 'D\'accord, je regarde ça', time: '10:42', unread: 2, avatar: 'JD' },
  { id: '2', name: 'Marie Martin', lastMessage: 'Le dossier a été validé', time: '09:15', unread: 0, avatar: 'MM' },
  { id: '3', name: 'Support Technique', lastMessage: 'Ticket #4521 résolu', time: 'Hier', unread: 1, avatar: 'ST' },
];

const mockRecentCalls = [
  { id: '1', name: 'Pierre Laurent', type: 'outgoing', duration: '12:34', time: '14:30', company: 'TechCorp' },
  { id: '2', name: 'Sophie Dubois', type: 'incoming', duration: '05:22', time: '11:15', company: 'Alpha Solutions' },
  { id: '3', name: 'Marc Petit', type: 'missed', duration: null, time: '09:45', company: 'BizPartner' },
  { id: '4', name: 'Julie Bernard', type: 'outgoing', duration: '18:45', time: 'Hier', company: 'Consultants Pro' },
  { id: '5', name: 'Thomas Leroy', type: 'incoming', duration: '03:12', time: 'Hier', company: 'StartupXYZ' },
];

const mockUpcomingMeetings = [
  { id: '1', title: 'Réunion d\'équipe', participants: 5, time: '15:00', date: 'Aujourd\'hui' },
  { id: '2', title: 'Point projet Alpha', participants: 3, time: '10:00', date: 'Demain' },
  { id: '3', title: 'Formation nouveaux outils', participants: 12, time: '14:00', date: 'Ven 27' },
];

const mockContacts = [
  { id: '1', name: 'Jean Dupont', role: 'Chef de projet', status: 'online', company: 'TechCorp', phone: '+33 6 12 34 56 78' },
  { id: '2', name: 'Marie Martin', role: 'Directrice RH', status: 'away', company: 'Alpha Solutions', phone: '+33 6 23 45 67 89' },
  { id: '3', name: 'Pierre Laurent', role: 'Développeur', status: 'offline', company: 'BizPartner', phone: '+33 6 34 56 78 90' },
  { id: '4', name: 'Sophie Dubois', role: 'Designer', status: 'online', company: 'Consultants Pro', phone: '+33 6 45 67 89 01' },
  { id: '5', name: 'Marc Petit', role: 'Commercial', status: 'online', company: 'StartupXYZ', phone: '+33 6 56 78 90 12' },
  { id: '6', name: 'Julie Bernard', role: 'CEO', status: 'away', company: 'InnovateNow', phone: '+33 6 67 89 01 23' },
];

const mockThreads = [
  { id: '1', subject: 'Demande de congés', from: 'RH', unread: true, priority: 'normal', time: '10:30' },
  { id: '2', subject: '[URGENT] Validation budget Q4', from: 'Direction', unread: true, priority: 'high', time: '09:15' },
  { id: '3', subject: 'Compte-rendu réunion', from: 'Jean Dupont', unread: false, priority: 'normal', time: 'Hier' },
];

// Determine app profile based on scopes
type AppProfile = 'gov-full' | 'biz-call-contact' | 'citizen-chat-contact' | 'startup-chat' | 'custom';

interface AppProfileConfig {
  name: string;
  description: string;
  icon: typeof Server;
  color: string;
  bgColor: string;
}

const appProfiles: Record<AppProfile, AppProfileConfig> = {
  'gov-full': {
    name: 'Gov Service',
    description: 'Full iCom Suite',
    icon: Server,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20',
  },
  'biz-call-contact': {
    name: 'Biz Service',
    description: 'iAppel + iContact',
    icon: Briefcase,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
  },
  'citizen-chat-contact': {
    name: 'Citizen Portal',
    description: 'iChat + iContact',
    icon: Users,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
  },
  'startup-chat': {
    name: 'Startup App',
    description: 'iChat + iContact',
    icon: Building2,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
  },
  'custom': {
    name: 'Service',
    description: 'Custom Configuration',
    icon: Building2,
    color: 'text-gray-400',
    bgColor: 'bg-gray-500/20',
  },
};

export default function ServiceDashboard() {
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
  
  // Connect to realtime on mount
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
    
    // Initial check
    notifications.checkExpiringChallenges(dailyChallenges.challenges);
    
    return () => clearInterval(interval);
  }, []);
  
  // Check leaderboard position periodically
  useEffect(() => {
    if (userId) {
      notifications.checkLeaderboardPosition(userId);
      
      const interval = setInterval(() => {
        notifications.checkLeaderboardPosition(userId);
      }, 300000); // Every 5 minutes
      
      return () => clearInterval(interval);
    }
  }, [userId, notifications]);
  
  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        globalSearch.toggle();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [globalSearch]);
  
  // Check which modules are enabled
  const hasIcom = hasScope('icom:read') || hasScope('icom:chat:*') || hasScope('icom:call:use');
  const hasChat = hasScope('icom:chat:*');
  const hasCall = hasScope('icom:call:use');
  const hasMeeting = hasScope('icom:meeting:use');
  const hasContact = hasScope('icom:contact:read');
  const hasIboite = hasScope('iboite:read');
  const hasIasted = hasScope('iasted:chat');
  const hasCorrespondance = hasScope('icorrespondance:read');
  
  // Determine app profile
  const getAppProfile = (): AppProfile => {
    const networkType = payload?.network_type;
    const realm = payload?.realm;
    
    // Gov Service - Full iCom
    if (networkType === 'government' && hasChat && hasCall && hasMeeting && hasContact) {
      return 'gov-full';
    }
    // Biz Service - Call + Contact only
    if (networkType === 'commercial' && hasCall && hasContact && !hasChat && !hasMeeting) {
      return 'biz-call-contact';
    }
    // Startup - Chat + Contact, no iBoîte
    if (realm === 'business' && hasChat && hasContact && !hasCall && !hasMeeting && !hasIboite) {
      return 'startup-chat';
    }
    // Citizen - Chat + Contact
    if (hasChat && hasContact && !hasCall && !hasMeeting) {
      return 'citizen-chat-contact';
    }
    return 'custom';
  };
  
  const appProfile = getAppProfile();
  const profileConfig = appProfiles[appProfile];
  const ProfileIcon = profileConfig.icon;
  
  // Calculate dashboard stats based on enabled features
  const dashboardStats = {
    unreadMessages: hasChat ? 3 : 0,
    missedCalls: hasCall ? 2 : 0,
    upcomingMeetings: hasMeeting ? 3 : 0,
    totalContacts: hasContact ? mockContacts.length : 0,
    pendingThreads: hasIboite ? 2 : 0,
  };
  
  const totalNotifications = dashboardStats.unreadMessages + dashboardStats.missedCalls + dashboardStats.pendingThreads;
  const recentEvents = events.slice(-5).reverse();

  const getCallIcon = (type: string) => {
    switch(type) {
      case 'outgoing': return PhoneCall;
      case 'incoming': return PhoneIncoming;
      case 'missed': return PhoneMissed;
      default: return Phone;
    }
  };
  
  // Profile-specific layout flags
  const isBizProfile = appProfile === 'biz-call-contact';
  const isStartupProfile = appProfile === 'startup-chat';
  const isChatFocused = isStartupProfile || appProfile === 'citizen-chat-contact';
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/demo-accounts">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", profileConfig.bgColor)}>
                  <ProfileIcon className={cn("w-5 h-5", profileConfig.color)} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">{profileConfig.name}</h1>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground font-mono">{payload?.app_id || 'client-portal'}</p>
                    <span className={cn(
                      "w-2 h-2 rounded-full",
                      isConnected ? "bg-green-500" : "bg-muted"
                    )} />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                className="hidden md:flex w-64 justify-start text-muted-foreground gap-2"
                onClick={globalSearch.open}
              >
                <Search className="w-4 h-4" />
                <span>Rechercher...</span>
                <Badge variant="outline" className="ml-auto text-xs gap-1">
                  <Command className="w-3 h-3" />K
                </Badge>
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
              
              {/* Stats Button */}
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setShowStats(true)}
                title="Statistiques"
              >
                <BarChart3 className="w-5 h-5 text-cyan-500" />
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
                variant="ghost" 
                size="icon"
                onClick={() => setShowBadges(true)}
                className="relative"
                title="Badges"
              >
                <Trophy className="w-5 h-5 text-amber-500" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full text-xs flex items-center justify-center text-white font-medium">
                  {stats.level}
                </span>
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
              
              {/* Notifications */}
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative"
                >
                  <Bell className="w-5 h-5" />
                  {totalNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full text-xs flex items-center justify-center text-destructive-foreground font-medium">
                      {totalNotifications > 9 ? '9+' : totalNotifications}
                    </span>
                  )}
                </Button>
                
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 top-12 w-80 glass rounded-xl border border-border/50 shadow-xl z-50"
                    >
                      <div className="p-3 border-b border-border/50">
                        <h4 className="font-medium text-foreground">Notifications temps réel</h4>
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
                                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                                    {event.type.includes('call') ? (
                                      <Phone className="w-4 h-4 text-orange-500" />
                                    ) : (
                                      <MessageCircle className="w-4 h-4 text-icom" />
                                    )}
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
                              En attente d'événements...
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Notification Settings */}
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
      
      <main className="container mx-auto px-6 py-8">
        {/* Status & Quick Stats - Adapted for Biz profile */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "grid gap-4 mb-8",
            isBizProfile ? "md:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-4"
          )}
        >
          {hasCall && (
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Appels manqués</CardTitle>
                <PhoneMissed className="w-4 h-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.missedCalls}</div>
                <p className="text-xs text-muted-foreground mt-1">Aujourd'hui</p>
              </CardContent>
            </Card>
          )}
          
          {hasContact && (
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Contacts</CardTitle>
                <Users className="w-4 h-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.totalContacts}</div>
                <p className="text-xs text-muted-foreground mt-1">{mockContacts.filter(c => c.status === 'online').length} en ligne</p>
              </CardContent>
            </Card>
          )}
          
          {hasChat && (
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Messages non lus</CardTitle>
                <MessageCircle className="w-4 h-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.unreadMessages}</div>
                <p className="text-xs text-muted-foreground mt-1">+2 aujourd'hui</p>
              </CardContent>
            </Card>
          )}
          
          {hasMeeting && (
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Réunions prévues</CardTitle>
                <Video className="w-4 h-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.upcomingMeetings}</div>
                <p className="text-xs text-muted-foreground mt-1">Cette semaine</p>
              </CardContent>
            </Card>
          )}
          
          {hasIboite && !isBizProfile && (
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Threads en attente</CardTitle>
                <Inbox className="w-4 h-4 text-iboite" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.pendingThreads}</div>
                <p className="text-xs text-muted-foreground mt-1">Dont 1 urgent</p>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-3 mb-8"
        >
          <Button 
            variant="default" 
            onClick={openCommsCenter}
            className="gap-2"
          >
            {isBizProfile ? <Phone className="w-4 h-4" /> : <MessageCircle className="w-4 h-4" />}
            Centre de Communication
          </Button>
          {hasCall && (
            <Button variant="outline" className="gap-2 border-orange-500/30 hover:bg-orange-500/10">
              <Phone className="w-4 h-4 text-orange-500" />
              Passer un appel
            </Button>
          )}
          {hasContact && (
            <Button variant="outline" className="gap-2">
              <Plus className="w-4 h-4" />
              Nouveau contact
            </Button>
          )}
          {hasChat && (
            <Button variant="outline" className="gap-2">
              <Send className="w-4 h-4" />
              Nouvelle conversation
            </Button>
          )}
          {hasMeeting && (
            <Button variant="outline" className="gap-2">
              <Video className="w-4 h-4" />
              Planifier une réunion
            </Button>
          )}
        </motion.div>

        <div className={cn(
          "grid gap-6",
          isBizProfile ? "lg:grid-cols-2" : "lg:grid-cols-3"
        )}>
          {/* Main Content Area */}
          <div className={cn(
            "space-y-6",
            isBizProfile ? "" : "lg:col-span-2"
          )}>
            {/* Recent Calls - Primary for Biz profile */}
            {hasCall && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <Card className="bg-card/50 border-border/50">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Phone className="w-5 h-5 text-orange-500" />
                        iAppel - Historique des appels
                      </CardTitle>
                      <CardDescription>
                        {isBizProfile ? 'Gérez vos appels commerciaux' : 'Vos appels récents'}
                      </CardDescription>
                    </div>
                    <Button variant="ghost" size="sm">Voir tout</Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockRecentCalls.slice(0, isBizProfile ? 5 : 3).map((call) => {
                        const CallIcon = getCallIcon(call.type);
                        return (
                          <div 
                            key={call.id}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer"
                          >
                            <div className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center",
                              call.type === 'missed' ? "bg-destructive/20" : "bg-orange-500/20"
                            )}>
                              <CallIcon className={cn(
                                "w-5 h-5",
                                call.type === 'missed' ? "text-destructive" : "text-orange-500"
                              )} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-foreground">{call.name}</span>
                                <span className="text-xs text-muted-foreground">{call.time}</span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {call.company && <span className="text-primary">{call.company}</span>}
                                {call.company && ' · '}
                                {call.type === 'outgoing' ? 'Sortant' : 
                                 call.type === 'incoming' ? 'Entrant' : 
                                 'Manqué'}
                                {call.duration && ` · ${call.duration}`}
                              </p>
                            </div>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Phone className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Recent Conversations - Only for non-Biz profiles */}
            {hasChat && !isBizProfile && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="bg-card/50 border-border/50">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-blue-500" />
                        iChat - Conversations récentes
                      </CardTitle>
                      <CardDescription>Vos derniers échanges</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm">Voir tout</Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockConversations.map((conv) => (
                        <div 
                          key={conv.id}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer"
                        >
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium">
                            {conv.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-foreground">{conv.name}</span>
                              <span className="text-xs text-muted-foreground">{conv.time}</span>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                          </div>
                          {conv.unread > 0 && (
                            <Badge className="bg-blue-500 text-white">{conv.unread}</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* iBoîte Threads - Only for non-Biz profiles */}
            {hasIboite && !isBizProfile && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <Card className="bg-card/50 border-border/50">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Inbox className="w-5 h-5 text-iboite" />
                        iBoîte - Messages internes
                      </CardTitle>
                      <CardDescription>Votre inbox asynchrone</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm">Voir tout</Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockThreads.map((thread) => (
                        <div 
                          key={thread.id}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer",
                            thread.unread && "bg-iboite/5"
                          )}
                        >
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center",
                            thread.priority === 'high' ? "bg-destructive/20" : "bg-iboite/20"
                          )}>
                            <Mail className={cn(
                              "w-5 h-5",
                              thread.priority === 'high' ? "text-destructive" : "text-iboite"
                            )} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                "font-medium text-foreground",
                                thread.unread && "font-semibold"
                              )}>
                                {thread.subject}
                              </span>
                              {thread.priority === 'high' && (
                                <Badge variant="destructive" className="text-xs">Urgent</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              De: {thread.from} · {thread.time}
                            </p>
                          </div>
                          {thread.unread && (
                            <div className="w-2 h-2 rounded-full bg-iboite" />
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Contacts - Primary for Biz profile */}
            {hasContact && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="bg-card/50 border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-emerald-500" />
                      iContact
                    </CardTitle>
                    <CardDescription>
                      {isBizProfile ? 'Vos contacts commerciaux' : 'Contacts fréquents'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockContacts.slice(0, isBizProfile ? 6 : 4).map((contact) => (
                        <div 
                          key={contact.id}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer"
                        >
                          <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium">
                              {contact.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span className={cn(
                              "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background",
                              contact.status === 'online' ? "bg-success" :
                              contact.status === 'away' ? "bg-warning" : "bg-muted"
                            )} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="font-medium text-foreground block">{contact.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {isBizProfile ? contact.company : contact.role}
                            </span>
                            {isBizProfile && (
                              <span className="text-xs text-primary block">{contact.phone}</span>
                            )}
                          </div>
                          <div className="flex gap-1">
                            {hasCall && (
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Phone className="w-4 h-4 text-orange-500" />
                              </Button>
                            )}
                            {hasChat && (
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MessageCircle className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Upcoming Meetings - Only for profiles with meeting */}
            {hasMeeting && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <Card className="bg-card/50 border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Video className="w-5 h-5 text-purple-500" />
                      iRéunion
                    </CardTitle>
                    <CardDescription>Prochaines réunions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockUpcomingMeetings.map((meeting, index) => (
                        <div 
                          key={meeting.id}
                          className={cn(
                            "p-3 rounded-lg border transition-colors cursor-pointer",
                            index === 0 
                              ? "border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10" 
                              : "border-border/50 hover:bg-secondary/50"
                          )}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-foreground">{meeting.title}</span>
                            {index === 0 && (
                              <Badge variant="outline" className="border-purple-500/30 text-purple-500">
                                Bientôt
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
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
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Session Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-card/50 border-border/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Session active</CardTitle>
                    <Badge variant="default" className={cn(
                      "border",
                      isConnected 
                        ? "bg-success/20 text-success border-success/30" 
                        : "bg-muted/20 text-muted-foreground border-muted/30"
                    )}>
                      <Radio className={cn("w-3 h-3 mr-1", isConnected && "animate-pulse")} />
                      {isConnected ? 'Connecté' : 'Hors ligne'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">App ID</span>
                    <span className="font-mono text-foreground">{payload?.app_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tenant</span>
                    <span className="font-mono text-foreground">{payload?.tenant_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Réseau</span>
                    <Badge variant="outline">{t(`networkTypes.${payload?.network_type}`)}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Realm</span>
                    <Badge variant="outline">{t(`realms.${payload?.realm}`)}</Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Modules Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <Card className="bg-card/50 border-border/50">
                <CardHeader>
                  <CardTitle className="text-sm">Modules actifs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'call', name: 'iAppel', icon: Phone, enabled: hasCall, color: 'text-orange-500 bg-orange-500/20' },
                      { id: 'contact', name: 'iContact', icon: Users, enabled: hasContact, color: 'text-emerald-500 bg-emerald-500/20' },
                      { id: 'chat', name: 'iChat', icon: MessageCircle, enabled: hasChat, color: 'text-blue-500 bg-blue-500/20' },
                      { id: 'meeting', name: 'iRéunion', icon: Video, enabled: hasMeeting, color: 'text-purple-500 bg-purple-500/20' },
                      { id: 'iboite', name: 'iBoîte', icon: Inbox, enabled: hasIboite, color: 'text-iboite bg-iboite/20' },
                      { id: 'iasted', name: 'iAsted', icon: Brain, enabled: hasIasted, color: 'text-neural bg-neural/20' },
                    ].map((mod) => (
                      <div 
                        key={mod.id}
                        className={cn(
                          "flex items-center gap-2 p-2 rounded-lg",
                          mod.enabled ? mod.color : "bg-muted/50 text-muted-foreground opacity-50"
                        )}
                      >
                        <mod.icon className="w-4 h-4" />
                        <span className="text-xs font-medium">{mod.name}</span>
                        {mod.enabled && <CheckCircle2 className="w-3 h-3 ml-auto" />}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
        
        {/* Realtime Status Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground"
        >
          <span className={cn(
            "w-2 h-2 rounded-full",
            isConnected ? "bg-green-500 animate-pulse" : "bg-muted"
          )} />
          {isConnected ? 'Notifications temps réel actives' : 'Connexion en cours...'}
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
        onResultClick={() => {
          globalSearch.close();
          openCommsCenter();
        }}
      />
    </div>
  );
}
