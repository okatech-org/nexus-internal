import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, Calendar, Target, Zap, MessageSquare, Phone, Users, FileText, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts';
import { UserStats } from '@/types/gamification';
import { useMemo } from 'react';

interface StatsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  stats: UserStats;
}

// Generate mock 7-day data based on current stats
function generate7DayData(stats: UserStats) {
  const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const today = new Date().getDay();
  
  return days.map((day, index) => {
    const multiplier = Math.random() * 0.3 + 0.7;
    const isToday = index === (today === 0 ? 6 : today - 1);
    
    return {
      day,
      points: Math.floor((stats.totalPoints / 7) * multiplier * (isToday ? 1.2 : 1)),
      messages: Math.floor((stats.messagesSent / 7) * multiplier),
      calls: Math.floor((stats.callsMade / 7) * multiplier),
      meetings: Math.floor((stats.meetingsJoined / 7) * multiplier),
      documents: Math.floor((stats.documentsProcessed / 7) * multiplier),
      contacts: Math.floor((stats.contactsAdded / 7) * multiplier),
    };
  });
}

const chartConfig = {
  points: { label: 'Points', color: 'hsl(var(--primary))' },
  messages: { label: 'Messages', color: 'hsl(142 76% 36%)' },
  calls: { label: 'Appels', color: 'hsl(221 83% 53%)' },
  meetings: { label: 'Réunions', color: 'hsl(262 83% 58%)' },
  documents: { label: 'Documents', color: 'hsl(25 95% 53%)' },
  contacts: { label: 'Contacts', color: 'hsl(339 90% 51%)' },
};

const statIcons = {
  messages: MessageSquare,
  calls: Phone,
  meetings: Video,
  documents: FileText,
  contacts: Users,
};

export function StatsPanel({ isOpen, onClose, stats }: StatsPanelProps) {
  const weekData = useMemo(() => generate7DayData(stats), [stats]);
  
  const totalWeekPoints = weekData.reduce((sum, d) => sum + d.points, 0);
  const avgDailyPoints = Math.floor(totalWeekPoints / 7);
  const bestDay = weekData.reduce((best, d) => d.points > best.points ? d : best, weekData[0]);
  
  const activityBreakdown = [
    { name: 'Messages', value: stats.messagesSent, icon: MessageSquare, color: 'hsl(142 76% 36%)' },
    { name: 'Appels', value: stats.callsMade, icon: Phone, color: 'hsl(221 83% 53%)' },
    { name: 'Réunions', value: stats.meetingsJoined, icon: Video, color: 'hsl(262 83% 58%)' },
    { name: 'Documents', value: stats.documentsProcessed, icon: FileText, color: 'hsl(25 95% 53%)' },
    { name: 'Contacts', value: stats.contactsAdded, icon: Users, color: 'hsl(339 90% 51%)' },
  ];

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
                  <div className="p-2 rounded-xl bg-primary/10">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Statistiques détaillées</h2>
                    <p className="text-sm text-muted-foreground">Évolution sur 7 jours</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                  <div className="flex items-center gap-2 text-primary mb-1">
                    <Zap className="w-4 h-4" />
                    <span className="text-xs font-medium">Total semaine</span>
                  </div>
                  <p className="text-2xl font-bold">{totalWeekPoints.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">points gagnés</p>
                </Card>
                
                <Card className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
                  <div className="flex items-center gap-2 text-green-500 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs font-medium">Moyenne/jour</span>
                  </div>
                  <p className="text-2xl font-bold">{avgDailyPoints}</p>
                  <p className="text-xs text-muted-foreground">points</p>
                </Card>
                
                <Card className="p-4 bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
                  <div className="flex items-center gap-2 text-amber-500 mb-1">
                    <Target className="w-4 h-4" />
                    <span className="text-xs font-medium">Meilleur jour</span>
                  </div>
                  <p className="text-2xl font-bold">{bestDay.day}</p>
                  <p className="text-xs text-muted-foreground">{bestDay.points} pts</p>
                </Card>
              </div>

              {/* Points Evolution Chart */}
              <Card className="p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Évolution des points
                </h3>
                <ChartContainer config={chartConfig} className="h-[200px] w-full">
                  <AreaChart data={weekData}>
                    <defs>
                      <linearGradient id="pointsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="points"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fill="url(#pointsGradient)"
                    />
                  </AreaChart>
                </ChartContainer>
              </Card>

              {/* Activity Breakdown Chart */}
              <Card className="p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  Activité par jour
                </h3>
                <ChartContainer config={chartConfig} className="h-[200px] w-full">
                  <BarChart data={weekData}>
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="messages" fill="hsl(142 76% 36%)" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="calls" fill="hsl(221 83% 53%)" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="meetings" fill="hsl(262 83% 58%)" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </Card>

              {/* Activity Breakdown List */}
              <Card className="p-4">
                <h3 className="font-semibold mb-4">Répartition de l'activité</h3>
                <div className="space-y-3">
                  {activityBreakdown.map((activity) => {
                    const Icon = activity.icon;
                    const maxValue = Math.max(...activityBreakdown.map(a => a.value));
                    const percentage = maxValue > 0 ? (activity.value / maxValue) * 100 : 0;
                    
                    return (
                      <div key={activity.name} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" style={{ color: activity.color }} />
                            <span className="text-sm">{activity.name}</span>
                          </div>
                          <span className="font-medium">{activity.value}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: activity.color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Streak Info */}
              <Card className="p-4 bg-gradient-to-r from-orange-500/10 via-red-500/10 to-pink-500/10 border-orange-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold flex items-center gap-2">
                      🔥 Série actuelle
                    </h3>
                    <p className="text-3xl font-bold mt-2">{stats.currentStreak} jours</p>
                    <p className="text-sm text-muted-foreground">Record: {stats.longestStreak} jours</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Jours actifs</p>
                    <p className="text-2xl font-bold">{stats.daysActive}</p>
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
