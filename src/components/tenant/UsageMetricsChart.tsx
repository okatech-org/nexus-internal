/**
 * Usage Metrics Chart Component
 * Displays usage statistics with interactive charts
 */

import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, Phone, Video, FileText, Bot, TrendingUp } from 'lucide-react';

interface MetricData {
  date: string;
  messages: number;
  calls: number;
  meetings: number;
  threads: number;
  documents: number;
  ai_requests: number;
}

interface UsageMetricsChartProps {
  data?: MetricData[];
  tenantName?: string;
}

// Generate mock data for the last 7 days
const generateMockData = (): MetricData[] => {
  const data: MetricData[] = [];
  const now = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
      messages: Math.floor(Math.random() * 150) + 50,
      calls: Math.floor(Math.random() * 30) + 5,
      meetings: Math.floor(Math.random() * 15) + 2,
      threads: Math.floor(Math.random() * 25) + 10,
      documents: Math.floor(Math.random() * 20) + 5,
      ai_requests: Math.floor(Math.random() * 40) + 10,
    });
  }
  
  return data;
};

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export function UsageMetricsChart({ data, tenantName }: UsageMetricsChartProps) {
  const chartData = useMemo(() => data || generateMockData(), [data]);
  
  // Calculate totals
  const totals = useMemo(() => {
    return chartData.reduce(
      (acc, day) => ({
        messages: acc.messages + day.messages,
        calls: acc.calls + day.calls,
        meetings: acc.meetings + day.meetings,
        threads: acc.threads + day.threads,
        documents: acc.documents + day.documents,
        ai_requests: acc.ai_requests + day.ai_requests,
      }),
      { messages: 0, calls: 0, meetings: 0, threads: 0, documents: 0, ai_requests: 0 }
    );
  }, [chartData]);

  // Pie chart data
  const pieData = [
    { name: 'Messages', value: totals.messages, icon: MessageCircle },
    { name: 'Appels', value: totals.calls, icon: Phone },
    { name: 'Réunions', value: totals.meetings, icon: Video },
    { name: 'Threads', value: totals.threads, icon: FileText },
    { name: 'IA', value: totals.ai_requests, icon: Bot },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        {[
          { label: 'Messages', value: totals.messages, icon: MessageCircle, color: 'text-primary' },
          { label: 'Appels', value: totals.calls, icon: Phone, color: 'text-chart-2' },
          { label: 'Réunions', value: totals.meetings, icon: Video, color: 'text-chart-3' },
          { label: 'Threads', value: totals.threads, icon: FileText, color: 'text-chart-4' },
          { label: 'Documents', value: totals.documents, icon: FileText, color: 'text-chart-5' },
          { label: 'Requêtes IA', value: totals.ai_requests, icon: Bot, color: 'text-primary' },
        ].map((metric) => (
          <Card key={metric.label} className="bg-card/50 border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <metric.icon className={`w-4 h-4 ${metric.color}`} />
                <span className="text-xs text-muted-foreground">7 jours</span>
              </div>
              <div className="mt-2">
                <p className="text-2xl font-bold">{metric.value}</p>
                <p className="text-xs text-muted-foreground">{metric.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activity">Activité</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
        </TabsList>

        <TabsContent value="activity">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Activité globale
              </CardTitle>
              <CardDescription>
                Évolution de l'utilisation sur les 7 derniers jours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorThreads" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <YAxis 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="messages" 
                      stroke="hsl(var(--primary))" 
                      fillOpacity={1}
                      fill="url(#colorMessages)" 
                      name="Messages"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="threads" 
                      stroke="hsl(var(--chart-2))" 
                      fillOpacity={1}
                      fill="url(#colorThreads)" 
                      name="Threads"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communication">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Phone className="w-5 h-5 text-primary" />
                Communication en temps réel
              </CardTitle>
              <CardDescription>
                Appels et réunions sur les 7 derniers jours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <YAxis 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="calls" fill="hsl(var(--chart-2))" name="Appels" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="meetings" fill="hsl(var(--chart-3))" name="Réunions" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Distribution par type</CardTitle>
              <CardDescription>
                Répartition de l'utilisation par catégorie
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {pieData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm text-muted-foreground">{entry.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
