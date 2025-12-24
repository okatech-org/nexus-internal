import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
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
  MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useComms } from '@/contexts/CommsContext';
import { UserMenu } from '@/components/layout/UserMenu';
import { cn } from '@/lib/utils';

// Mock data for the dashboard
const mockConversations = [
  { id: '1', name: 'Jean Dupont', lastMessage: 'D\'accord, je regarde ça', time: '10:42', unread: 2, avatar: 'JD' },
  { id: '2', name: 'Marie Martin', lastMessage: 'Le dossier a été validé', time: '09:15', unread: 0, avatar: 'MM' },
  { id: '3', name: 'Support Technique', lastMessage: 'Ticket #4521 résolu', time: 'Hier', unread: 1, avatar: 'ST' },
];

const mockRecentCalls = [
  { id: '1', name: 'Pierre Laurent', type: 'outgoing', duration: '12:34', time: '14:30' },
  { id: '2', name: 'Sophie Dubois', type: 'incoming', duration: '05:22', time: '11:15' },
  { id: '3', name: 'Marc Petit', type: 'missed', duration: null, time: '09:45' },
];

const mockUpcomingMeetings = [
  { id: '1', title: 'Réunion d\'équipe', participants: 5, time: '15:00', date: 'Aujourd\'hui' },
  { id: '2', title: 'Point projet Alpha', participants: 3, time: '10:00', date: 'Demain' },
  { id: '3', title: 'Formation nouveaux outils', participants: 12, time: '14:00', date: 'Ven 27' },
];

const mockContacts = [
  { id: '1', name: 'Jean Dupont', role: 'Chef de projet', status: 'online' },
  { id: '2', name: 'Marie Martin', role: 'Directrice RH', status: 'away' },
  { id: '3', name: 'Pierre Laurent', role: 'Développeur', status: 'offline' },
  { id: '4', name: 'Sophie Dubois', role: 'Designer', status: 'online' },
];

const mockThreads = [
  { id: '1', subject: 'Demande de congés', from: 'RH', unread: true, priority: 'normal', time: '10:30' },
  { id: '2', subject: '[URGENT] Validation budget Q4', from: 'Direction', unread: true, priority: 'high', time: '09:15' },
  { id: '3', subject: 'Compte-rendu réunion', from: 'Jean Dupont', unread: false, priority: 'normal', time: 'Hier' },
];

export default function ServiceDashboard() {
  const { t } = useTranslation();
  const { payload, hasScope } = useAuth();
  const { openCommsCenter } = useComms();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Check which modules are enabled
  const hasIcom = hasScope('icom:read') || hasScope('icom:chat:*');
  const hasChat = hasScope('icom:chat:*');
  const hasCall = hasScope('icom:call:use');
  const hasMeeting = hasScope('icom:meeting:use');
  const hasContact = hasScope('icom:contact:read');
  const hasIboite = hasScope('iboite:read');
  const hasIasted = hasScope('iasted:chat');
  const hasCorrespondance = hasScope('icorrespondance:read');
  
  // Calculate stats
  const stats = {
    unreadMessages: 3,
    missedCalls: 1,
    upcomingMeetings: 3,
    pendingThreads: 2,
  };

  const getCallIcon = (type: string) => {
    switch(type) {
      case 'outgoing': return PhoneCall;
      case 'incoming': return PhoneIncoming;
      case 'missed': return PhoneMissed;
      default: return Phone;
    }
  };
  
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
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <Server className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Gov Service</h1>
                  <p className="text-xs text-muted-foreground font-mono">{payload?.app_id || 'gov-app-1'}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Rechercher..." 
                  className="pl-9 w-64 bg-secondary/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <UserMenu />
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-6 py-8">
        {/* Status & Quick Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8"
        >
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Messages non lus</CardTitle>
              <MessageCircle className="w-4 h-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.unreadMessages}</div>
              <p className="text-xs text-muted-foreground mt-1">+2 aujourd'hui</p>
            </CardContent>
          </Card>
          
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Appels manqués</CardTitle>
              <PhoneMissed className="w-4 h-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.missedCalls}</div>
              <p className="text-xs text-muted-foreground mt-1">Ce matin</p>
            </CardContent>
          </Card>
          
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Réunions prévues</CardTitle>
              <Video className="w-4 h-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.upcomingMeetings}</div>
              <p className="text-xs text-muted-foreground mt-1">Cette semaine</p>
            </CardContent>
          </Card>
          
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Threads en attente</CardTitle>
              <Inbox className="w-4 h-4 text-iboite" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingThreads}</div>
              <p className="text-xs text-muted-foreground mt-1">Dont 1 urgent</p>
            </CardContent>
          </Card>
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
            <MessageCircle className="w-4 h-4" />
            Centre de Communication
          </Button>
          {hasChat && (
            <Button variant="outline" className="gap-2">
              <Plus className="w-4 h-4" />
              Nouvelle conversation
            </Button>
          )}
          {hasMeeting && (
            <Button variant="outline" className="gap-2">
              <Video className="w-4 h-4" />
              Planifier une réunion
            </Button>
          )}
          {hasCall && (
            <Button variant="outline" className="gap-2">
              <Phone className="w-4 h-4" />
              Passer un appel
            </Button>
          )}
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Conversations & Calls */}
          <div className="space-y-6 lg:col-span-2">
            {/* Recent Conversations */}
            {hasChat && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
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

            {/* Recent Calls */}
            {hasCall && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="bg-card/50 border-border/50">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Phone className="w-5 h-5 text-orange-500" />
                        iAppel - Historique des appels
                      </CardTitle>
                      <CardDescription>Vos appels récents</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm">Voir tout</Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockRecentCalls.map((call) => {
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
                                {call.type === 'outgoing' ? 'Appel sortant' : 
                                 call.type === 'incoming' ? 'Appel entrant' : 
                                 'Appel manqué'}
                                {call.duration && ` · ${call.duration}`}
                              </p>
                            </div>
                            <Button variant="ghost" size="icon">
                              <Phone className="w-4 h-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* iBoîte Threads */}
            {hasIboite && (
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

          {/* Right Column - Meetings & Contacts */}
          <div className="space-y-6">
            {/* Upcoming Meetings */}
            {hasMeeting && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
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

            {/* Contacts */}
            {hasContact && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <Card className="bg-card/50 border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-emerald-500" />
                      iContact
                    </CardTitle>
                    <CardDescription>Contacts fréquents</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockContacts.map((contact) => (
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
                            <span className="text-xs text-muted-foreground">{contact.role}</span>
                          </div>
                          <div className="flex gap-1">
                            {hasChat && (
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MessageCircle className="w-4 h-4" />
                              </Button>
                            )}
                            {hasCall && (
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Phone className="w-4 h-4" />
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
                    <Badge variant="default" className="bg-success/20 text-success border-success/30">
                      <Radio className="w-3 h-3 mr-1 animate-pulse" />
                      Connecté
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
                      { id: 'icom', name: 'iCom', icon: MessageCircle, enabled: hasIcom, color: 'text-icom bg-icom/20' },
                      { id: 'iboite', name: 'iBoîte', icon: Inbox, enabled: hasIboite, color: 'text-iboite bg-iboite/20' },
                      { id: 'iasted', name: 'iAsted', icon: Brain, enabled: hasIasted, color: 'text-neural bg-neural/20' },
                      { id: 'icorr', name: 'iCorr.', icon: FileText, enabled: hasCorrespondance, color: 'text-primary bg-primary/20' },
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
      </main>
    </div>
  );
}
