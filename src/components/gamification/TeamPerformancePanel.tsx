import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, TrendingUp, TrendingDown, Minus, Crown, Medal, Award, MessageSquare, Phone, Video, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { TeamMember } from '@/types/monthly-quests';
import { useMemo } from 'react';

interface TeamPerformancePanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId?: string;
}

// Mock team data
const MOCK_TEAM_MEMBERS: TeamMember[] = [
  { id: '1', name: 'Sophie Martin', level: 12, points: 4520, messagesSent: 342, callsMade: 45, meetingsJoined: 28, documentsProcessed: 89, badgeCount: 15, rank: 1, trend: 'up' },
  { id: '2', name: 'Thomas Dubois', level: 10, points: 3890, messagesSent: 289, callsMade: 67, meetingsJoined: 19, documentsProcessed: 56, badgeCount: 12, rank: 2, trend: 'stable' },
  { id: '3', name: 'Marie Laurent', level: 9, points: 3240, messagesSent: 198, callsMade: 34, meetingsJoined: 32, documentsProcessed: 78, badgeCount: 10, rank: 3, trend: 'up' },
  { id: '4', name: 'Pierre Bernard', level: 8, points: 2780, messagesSent: 234, callsMade: 23, meetingsJoined: 15, documentsProcessed: 45, badgeCount: 8, rank: 4, trend: 'down' },
  { id: '5', name: 'Julie Petit', level: 7, points: 2340, messagesSent: 156, callsMade: 56, meetingsJoined: 22, documentsProcessed: 34, badgeCount: 7, rank: 5, trend: 'up' },
  { id: '6', name: 'Marc Leroy', level: 6, points: 1890, messagesSent: 123, callsMade: 78, meetingsJoined: 12, documentsProcessed: 23, badgeCount: 5, rank: 6, trend: 'stable' },
];

const chartConfig = {
  messages: { label: 'Messages', color: 'hsl(142 76% 36%)' },
  calls: { label: 'Appels', color: 'hsl(221 83% 53%)' },
  meetings: { label: 'Réunions', color: 'hsl(262 83% 58%)' },
  documents: { label: 'Documents', color: 'hsl(25 95% 53%)' },
};

function getRankIcon(rank: number) {
  switch (rank) {
    case 1: return <Crown className="w-5 h-5 text-amber-500" />;
    case 2: return <Medal className="w-5 h-5 text-slate-400" />;
    case 3: return <Award className="w-5 h-5 text-amber-700" />;
    default: return <span className="text-muted-foreground font-bold">#{rank}</span>;
  }
}

function getTrendIcon(trend: 'up' | 'down' | 'stable') {
  switch (trend) {
    case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
    case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
    default: return <Minus className="w-4 h-4 text-muted-foreground" />;
  }
}

function MemberCard({ member, isCurrentUser }: { member: TeamMember; isCurrentUser: boolean }) {
  const initials = member.name.split(' ').map(n => n[0]).join('');
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.01 }}
    >
      <Card className={`p-4 ${isCurrentUser ? 'border-primary bg-primary/5' : ''}`}>
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-8">
            {getRankIcon(member.rank)}
          </div>
          
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/20 text-primary font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium truncate">{member.name}</span>
              {isCurrentUser && (
                <Badge variant="outline" className="text-xs">Vous</Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Niv. {member.level}</span>
              <span>•</span>
              <span>{member.badgeCount} badges</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {getTrendIcon(member.trend)}
            <div className="text-right">
              <p className="font-bold text-amber-500">{member.points.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">points</p>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export function TeamPerformancePanel({ isOpen, onClose, currentUserId }: TeamPerformancePanelProps) {
  const teamMembers = MOCK_TEAM_MEMBERS;
  
  const comparisonData = useMemo(() => {
    return teamMembers.slice(0, 5).map(member => ({
      name: member.name.split(' ')[0],
      messages: member.messagesSent,
      calls: member.callsMade,
      meetings: member.meetingsJoined,
      documents: member.documentsProcessed,
    }));
  }, [teamMembers]);

  const radarData = useMemo(() => {
    const top3 = teamMembers.slice(0, 3);
    const maxMessages = Math.max(...top3.map(m => m.messagesSent));
    const maxCalls = Math.max(...top3.map(m => m.callsMade));
    const maxMeetings = Math.max(...top3.map(m => m.meetingsJoined));
    const maxDocs = Math.max(...top3.map(m => m.documentsProcessed));

    return [
      { subject: 'Messages', ...Object.fromEntries(top3.map(m => [m.name.split(' ')[0], (m.messagesSent / maxMessages) * 100])) },
      { subject: 'Appels', ...Object.fromEntries(top3.map(m => [m.name.split(' ')[0], (m.callsMade / maxCalls) * 100])) },
      { subject: 'Réunions', ...Object.fromEntries(top3.map(m => [m.name.split(' ')[0], (m.meetingsJoined / maxMeetings) * 100])) },
      { subject: 'Documents', ...Object.fromEntries(top3.map(m => [m.name.split(' ')[0], (m.documentsProcessed / maxDocs) * 100])) },
    ];
  }, [teamMembers]);

  const teamStats = useMemo(() => {
    return {
      totalPoints: teamMembers.reduce((sum, m) => sum + m.points, 0),
      totalMessages: teamMembers.reduce((sum, m) => sum + m.messagesSent, 0),
      totalCalls: teamMembers.reduce((sum, m) => sum + m.callsMade, 0),
      totalMeetings: teamMembers.reduce((sum, m) => sum + m.meetingsJoined, 0),
      avgLevel: Math.round(teamMembers.reduce((sum, m) => sum + m.level, 0) / teamMembers.length),
    };
  }, [teamMembers]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-2xl bg-background border-l border-border shadow-2xl z-50 overflow-y-auto"
          >
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                    <Users className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Performance Équipe</h2>
                    <p className="text-sm text-muted-foreground">{teamMembers.length} membres</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Team Stats Summary */}
              <div className="grid grid-cols-4 gap-3">
                <Card className="p-3 text-center">
                  <p className="text-2xl font-bold text-amber-500">{teamStats.totalPoints.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Points totaux</p>
                </Card>
                <Card className="p-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <MessageSquare className="w-4 h-4 text-green-500" />
                    <p className="text-xl font-bold">{teamStats.totalMessages}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">Messages</p>
                </Card>
                <Card className="p-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Phone className="w-4 h-4 text-blue-500" />
                    <p className="text-xl font-bold">{teamStats.totalCalls}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">Appels</p>
                </Card>
                <Card className="p-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Video className="w-4 h-4 text-purple-500" />
                    <p className="text-xl font-bold">{teamStats.totalMeetings}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">Réunions</p>
                </Card>
              </div>

              <Tabs defaultValue="ranking" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="ranking">Classement</TabsTrigger>
                  <TabsTrigger value="comparison">Comparaison</TabsTrigger>
                  <TabsTrigger value="radar">Radar</TabsTrigger>
                </TabsList>

                <TabsContent value="ranking" className="space-y-3 mt-4">
                  {teamMembers.map((member) => (
                    <MemberCard
                      key={member.id}
                      member={member}
                      isCurrentUser={member.id === currentUserId}
                    />
                  ))}
                </TabsContent>

                <TabsContent value="comparison" className="mt-4">
                  <Card className="p-4">
                    <h3 className="font-semibold mb-4">Activité par membre</h3>
                    <ChartContainer config={chartConfig} className="h-[300px] w-full">
                      <BarChart data={comparisonData}>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="messages" fill="hsl(142 76% 36%)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="calls" fill="hsl(221 83% 53%)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="meetings" fill="hsl(262 83% 58%)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ChartContainer>
                  </Card>
                </TabsContent>

                <TabsContent value="radar" className="mt-4">
                  <Card className="p-4">
                    <h3 className="font-semibold mb-4">Profil des top 3</h3>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarData}>
                          <PolarGrid stroke="hsl(var(--border))" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                          <PolarRadiusAxis tick={false} axisLine={false} />
                          <Radar name="Sophie" dataKey="Sophie" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                          <Radar name="Thomas" dataKey="Thomas" stroke="hsl(221 83% 53%)" fill="hsl(221 83% 53%)" fillOpacity={0.2} />
                          <Radar name="Marie" dataKey="Marie" stroke="hsl(142 76% 36%)" fill="hsl(142 76% 36%)" fillOpacity={0.2} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-primary" />
                        <span className="text-sm">Sophie</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <span className="text-sm">Thomas</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="text-sm">Marie</span>
                      </div>
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
