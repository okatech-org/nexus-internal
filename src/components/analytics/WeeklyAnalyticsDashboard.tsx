import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  X, Phone, MessageCircle, Video, Users, TrendingUp, TrendingDown,
  BarChart3, Activity, Calendar, Clock, ArrowUpRight, ArrowDownRight, Minus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface WeeklyAnalyticsDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  onExport?: () => void;
}

// Generate mock weekly data
const generateWeeklyData = () => {
  const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const today = new Date();
  const dayOfWeek = today.getDay();
  
  return days.map((day, index) => {
    const isWeekend = index >= 5;
    const isPast = index <= (dayOfWeek === 0 ? 6 : dayOfWeek - 1);
    
    return {
      day,
      date: `${today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1) + index} déc`,
      calls: isPast ? Math.floor(Math.random() * (isWeekend ? 5 : 25)) + (isWeekend ? 0 : 8) : 0,
      messages: isPast ? Math.floor(Math.random() * (isWeekend ? 10 : 50)) + (isWeekend ? 2 : 15) : 0,
      meetings: isPast ? Math.floor(Math.random() * (isWeekend ? 1 : 5)) + (isWeekend ? 0 : 1) : 0,
      contacts: isPast ? Math.floor(Math.random() * 5) + 1 : 0,
      callDuration: isPast ? Math.floor(Math.random() * 120) + 30 : 0,
      isPast,
    };
  });
};

// Generate hourly distribution
const generateHourlyData = () => {
  return Array.from({ length: 24 }, (_, hour) => {
    const isWorkHour = hour >= 9 && hour <= 18;
    const isPeakHour = (hour >= 10 && hour <= 12) || (hour >= 14 && hour <= 16);
    
    return {
      hour: `${hour.toString().padStart(2, '0')}h`,
      calls: isWorkHour ? Math.floor(Math.random() * (isPeakHour ? 8 : 4)) + (isPeakHour ? 2 : 1) : 0,
      messages: Math.floor(Math.random() * (isWorkHour ? (isPeakHour ? 15 : 8) : 3)) + 1,
    };
  });
};

// Activity distribution for pie chart
const activityDistribution = [
  { name: 'Appels', value: 35, color: 'hsl(25, 95%, 55%)' },
  { name: 'Messages', value: 40, color: 'hsl(217, 91%, 60%)' },
  { name: 'Réunions', value: 15, color: 'hsl(280, 70%, 60%)' },
  { name: 'Contacts', value: 10, color: 'hsl(142, 76%, 36%)' },
];

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card/95 backdrop-blur-md border border-border rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium text-foreground mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium text-foreground">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function WeeklyAnalyticsDashboard({ isOpen, onClose, onExport }: WeeklyAnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  
  const weeklyData = useMemo(() => generateWeeklyData(), []);
  const hourlyData = useMemo(() => generateHourlyData(), []);
  
  // Calculate totals and trends
  const stats = useMemo(() => {
    const totals = weeklyData.reduce(
      (acc, day) => ({
        calls: acc.calls + day.calls,
        messages: acc.messages + day.messages,
        meetings: acc.meetings + day.meetings,
        contacts: acc.contacts + day.contacts,
        callDuration: acc.callDuration + day.callDuration,
      }),
      { calls: 0, messages: 0, meetings: 0, contacts: 0, callDuration: 0 }
    );
    
    // Mock last week data for comparison
    const lastWeekTotals = {
      calls: Math.floor(totals.calls * (0.8 + Math.random() * 0.4)),
      messages: Math.floor(totals.messages * (0.8 + Math.random() * 0.4)),
      meetings: Math.floor(totals.meetings * (0.8 + Math.random() * 0.4)),
      contacts: Math.floor(totals.contacts * (0.8 + Math.random() * 0.4)),
    };
    
    const calculateTrend = (current: number, previous: number) => {
      if (previous === 0) return 0;
      return Math.round(((current - previous) / previous) * 100);
    };
    
    return {
      totals,
      trends: {
        calls: calculateTrend(totals.calls, lastWeekTotals.calls),
        messages: calculateTrend(totals.messages, lastWeekTotals.messages),
        meetings: calculateTrend(totals.meetings, lastWeekTotals.meetings),
        contacts: calculateTrend(totals.contacts, lastWeekTotals.contacts),
      },
    };
  }, [weeklyData]);
  
  const TrendIcon = ({ value }: { value: number }) => {
    if (value > 0) return <ArrowUpRight className="w-3 h-3 text-green-500" />;
    if (value < 0) return <ArrowDownRight className="w-3 h-3 text-red-500" />;
    return <Minus className="w-3 h-3 text-muted-foreground" />;
  };
  
  const TrendBadge = ({ value }: { value: number }) => (
    <Badge
      variant="outline"
      className={cn(
        "text-xs gap-0.5",
        value > 0 && "border-green-500/30 text-green-500",
        value < 0 && "border-red-500/30 text-red-500",
        value === 0 && "border-muted text-muted-foreground"
      )}
    >
      <TrendIcon value={value} />
      {Math.abs(value)}%
    </Badge>
  );

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-2xl lg:max-w-4xl p-0 border-border bg-background">
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          className="h-full flex flex-col"
        >
          {/* Header */}
          <SheetHeader className="px-4 sm:px-6 py-4 border-b border-border shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <SheetTitle className="text-lg font-bold">Tableau de bord analytique</SheetTitle>
                  <p className="text-xs text-muted-foreground">Activité de la semaine</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </SheetHeader>
          
          {/* Content */}
          <ScrollArea className="flex-1">
            <div className="p-4 sm:p-6 space-y-6">
              {/* Summary Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
              >
                <Card className="bg-card/50 border-border/50">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                        <Phone className="w-4 h-4 text-orange-500" />
                      </div>
                      <TrendBadge value={stats.trends.calls} />
                    </div>
                    <p className="text-2xl font-bold">{stats.totals.calls}</p>
                    <p className="text-xs text-muted-foreground">Appels cette semaine</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-card/50 border-border/50">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <MessageCircle className="w-4 h-4 text-blue-500" />
                      </div>
                      <TrendBadge value={stats.trends.messages} />
                    </div>
                    <p className="text-2xl font-bold">{stats.totals.messages}</p>
                    <p className="text-xs text-muted-foreground">Messages envoyés</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-card/50 border-border/50">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <Video className="w-4 h-4 text-purple-500" />
                      </div>
                      <TrendBadge value={stats.trends.meetings} />
                    </div>
                    <p className="text-2xl font-bold">{stats.totals.meetings}</p>
                    <p className="text-xs text-muted-foreground">Réunions</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-card/50 border-border/50">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                        <Users className="w-4 h-4 text-emerald-500" />
                      </div>
                      <TrendBadge value={stats.trends.contacts} />
                    </div>
                    <p className="text-2xl font-bold">{stats.totals.contacts}</p>
                    <p className="text-xs text-muted-foreground">Nouveaux contacts</p>
                  </CardContent>
                </Card>
              </motion.div>
              
              {/* Tabs for different views */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full grid grid-cols-3 mb-4">
                  <TabsTrigger value="overview" className="gap-2">
                    <Activity className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Vue d'ensemble</span>
                    <span className="sm:hidden">Général</span>
                  </TabsTrigger>
                  <TabsTrigger value="calls" className="gap-2">
                    <Phone className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Appels & Messages</span>
                    <span className="sm:hidden">Comm.</span>
                  </TabsTrigger>
                  <TabsTrigger value="distribution" className="gap-2">
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Distribution</span>
                    <span className="sm:hidden">Répart.</span>
                  </TabsTrigger>
                </TabsList>
                
                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="bg-card/50 border-border/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Activité quotidienne</CardTitle>
                        <CardDescription>Évolution sur la semaine</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[280px] sm:h-[320px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={weeklyData}>
                              <defs>
                                <linearGradient id="callsGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="hsl(25, 95%, 55%)" stopOpacity={0.3} />
                                  <stop offset="95%" stopColor="hsl(25, 95%, 55%)" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="messagesGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3} />
                                  <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                              <XAxis 
                                dataKey="day" 
                                stroke="hsl(var(--muted-foreground))" 
                                fontSize={12}
                                tickLine={false}
                              />
                              <YAxis 
                                stroke="hsl(var(--muted-foreground))" 
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                              />
                              <Tooltip content={<CustomTooltip />} />
                              <Legend 
                                wrapperStyle={{ paddingTop: '20px' }}
                                formatter={(value) => <span className="text-sm text-muted-foreground">{value}</span>}
                              />
                              <Area
                                type="monotone"
                                dataKey="calls"
                                name="Appels"
                                stroke="hsl(25, 95%, 55%)"
                                strokeWidth={2}
                                fill="url(#callsGradient)"
                              />
                              <Area
                                type="monotone"
                                dataKey="messages"
                                name="Messages"
                                stroke="hsl(217, 91%, 60%)"
                                strokeWidth={2}
                                fill="url(#messagesGradient)"
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                  
                  {/* Weekly Summary */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Card className="bg-card/50 border-border/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Résumé hebdomadaire</CardTitle>
                        <CardDescription>Comparaison avec la semaine précédente</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[200px] sm:h-[240px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weeklyData} barGap={2}>
                              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                              <XAxis 
                                dataKey="day" 
                                stroke="hsl(var(--muted-foreground))" 
                                fontSize={12}
                                tickLine={false}
                              />
                              <YAxis 
                                stroke="hsl(var(--muted-foreground))" 
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                              />
                              <Tooltip content={<CustomTooltip />} />
                              <Bar dataKey="calls" name="Appels" fill="hsl(25, 95%, 55%)" radius={[4, 4, 0, 0]} />
                              <Bar dataKey="messages" name="Messages" fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} />
                              <Bar dataKey="meetings" name="Réunions" fill="hsl(280, 70%, 60%)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>
                
                {/* Calls & Messages Tab */}
                <TabsContent value="calls" className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="bg-card/50 border-border/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          Distribution horaire
                        </CardTitle>
                        <CardDescription>Activité par heure de la journée</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[280px] sm:h-[320px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={hourlyData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                              <XAxis 
                                dataKey="hour" 
                                stroke="hsl(var(--muted-foreground))" 
                                fontSize={10}
                                tickLine={false}
                                interval={2}
                              />
                              <YAxis 
                                stroke="hsl(var(--muted-foreground))" 
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                              />
                              <Tooltip content={<CustomTooltip />} />
                              <Legend 
                                wrapperStyle={{ paddingTop: '20px' }}
                                formatter={(value) => <span className="text-sm text-muted-foreground">{value}</span>}
                              />
                              <Line
                                type="monotone"
                                dataKey="calls"
                                name="Appels"
                                stroke="hsl(25, 95%, 55%)"
                                strokeWidth={2}
                                dot={{ fill: 'hsl(25, 95%, 55%)', strokeWidth: 0, r: 3 }}
                                activeDot={{ r: 5, stroke: 'hsl(25, 95%, 55%)', strokeWidth: 2 }}
                              />
                              <Line
                                type="monotone"
                                dataKey="messages"
                                name="Messages"
                                stroke="hsl(217, 91%, 60%)"
                                strokeWidth={2}
                                dot={{ fill: 'hsl(217, 91%, 60%)', strokeWidth: 0, r: 3 }}
                                activeDot={{ r: 5, stroke: 'hsl(217, 91%, 60%)', strokeWidth: 2 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                  
                  {/* Peak Hours Info */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 gap-3 sm:gap-4"
                  >
                    <Card className="bg-card/50 border-border/50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                            <Phone className="w-5 h-5 text-orange-500" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Pic d'appels</p>
                            <p className="text-lg font-bold">10h - 12h</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-card/50 border-border/50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                            <MessageCircle className="w-5 h-5 text-blue-500" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Pic de messages</p>
                            <p className="text-lg font-bold">14h - 16h</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                  
                  {/* Average Duration */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Card className="bg-card/50 border-border/50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                              <Clock className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Durée moyenne d'appel</p>
                              <p className="text-lg font-bold">
                                {Math.floor(stats.totals.callDuration / stats.totals.calls)}min
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Total cette semaine</p>
                            <p className="text-lg font-bold">{Math.floor(stats.totals.callDuration / 60)}h {stats.totals.callDuration % 60}min</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>
                
                {/* Distribution Tab */}
                <TabsContent value="distribution" className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-4"
                  >
                    {/* Pie Chart */}
                    <Card className="bg-card/50 border-border/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Répartition des activités</CardTitle>
                        <CardDescription>Par type d'interaction</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[250px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={activityDistribution}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={90}
                                paddingAngle={2}
                                dataKey="value"
                              >
                                {activityDistribution.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip 
                                content={({ payload }) => {
                                  if (payload && payload.length) {
                                    const data = payload[0].payload;
                                    return (
                                      <div className="bg-card/95 backdrop-blur-md border border-border rounded-lg p-3 shadow-lg">
                                        <div className="flex items-center gap-2">
                                          <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: data.color }}
                                          />
                                          <span className="text-sm font-medium">{data.name}</span>
                                          <span className="text-sm text-muted-foreground">{data.value}%</span>
                                        </div>
                                      </div>
                                    );
                                  }
                                  return null;
                                }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        
                        {/* Legend */}
                        <div className="grid grid-cols-2 gap-2 mt-4">
                          {activityDistribution.map((item, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full shrink-0"
                                style={{ backgroundColor: item.color }}
                              />
                              <span className="text-sm text-muted-foreground">{item.name}</span>
                              <span className="text-sm font-medium ml-auto">{item.value}%</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Day Performance */}
                    <Card className="bg-card/50 border-border/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Performance par jour</CardTitle>
                        <CardDescription>Jours les plus actifs</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {weeklyData
                            .filter(d => d.isPast)
                            .sort((a, b) => (b.calls + b.messages) - (a.calls + a.messages))
                            .map((day, index) => {
                              const total = day.calls + day.messages + day.meetings;
                              const maxTotal = Math.max(...weeklyData.map(d => d.calls + d.messages + d.meetings));
                              const percentage = Math.round((total / maxTotal) * 100);
                              
                              return (
                                <motion.div
                                  key={day.day}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.05 }}
                                  className="space-y-1"
                                >
                                  <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">{day.day}</span>
                                      <span className="text-muted-foreground">{day.date}</span>
                                    </div>
                                    <span className="font-medium">{total} activités</span>
                                  </div>
                                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{ width: `${percentage}%` }}
                                      transition={{ delay: index * 0.05 + 0.2, duration: 0.5 }}
                                      className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full"
                                    />
                                  </div>
                                </motion.div>
                              );
                            })}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                  
                  {/* Quick Stats */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Card className="bg-card/50 border-border/50">
                      <CardContent className="p-4">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-orange-500">
                              {Math.round(stats.totals.calls / 5)}
                            </p>
                            <p className="text-xs text-muted-foreground">Appels/jour moy.</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-blue-500">
                              {Math.round(stats.totals.messages / 5)}
                            </p>
                            <p className="text-xs text-muted-foreground">Messages/jour moy.</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-purple-500">
                              {Math.round(stats.totals.meetings / 5)}
                            </p>
                            <p className="text-xs text-muted-foreground">Réunions/jour moy.</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-emerald-500">
                              {weeklyData.filter(d => d.isPast && (d.calls + d.messages) > 20).length}
                            </p>
                            <p className="text-xs text-muted-foreground">Jours productifs</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>
              </Tabs>
            </div>
          </ScrollArea>
        </motion.div>
      </SheetContent>
    </Sheet>
  );
}
