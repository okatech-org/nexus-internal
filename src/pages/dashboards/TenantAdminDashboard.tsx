/**
 * Tenant Admin Dashboard
 * Complete tenant administration space with sidebar navigation
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Routes, Route, Navigate, useNavigate, useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  AppWindow, 
  Settings, 
  Activity, 
  Plus, 
  Search, 
  MoreVertical,
  MessageCircle,
  Inbox,
  Bot,
  Users,
  TrendingUp,
  Clock,
  RefreshCw,
  ArrowLeft,
  ExternalLink,
  Layers,
  Trash2,
  AlertTriangle,
  RotateCcw,
  Archive,
  Eye,
  EyeOff,
  LayoutGrid,
  LayoutList,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useDemo } from '@/contexts/DemoContext';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { CreateApplicationDialog } from '@/components/tenant/CreateApplicationDialog';
import { InviteUserDialog } from '@/components/tenant/InviteUserDialog';
import { UsageMetricsChart } from '@/components/tenant/UsageMetricsChart';
import { ModuleSettingsPanel } from '@/components/tenant/ModuleSettingsPanel';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// ============= Types =============

interface Application {
  id: string;
  name: string;
  description: string | null;
  app_id: string;
  status: string;
  network_type: string;
  created_at: string;
  module_settings?: ModuleSetting[];
}

interface ModuleSetting {
  id: string;
  module_name: string;
  enabled: boolean;
  settings: unknown;
}

interface TenantMember {
  id: string;
  user_id: string;
  role: string;
  status: string;
  invited_at: string;
  joined_at: string | null;
}

// ============= Sub-Pages =============

interface UsageMetric {
  id: string;
  application_id: string | null;
  tenant_id: string;
  metric_type: string;
  count: number;
  recorded_at: string;
}

interface AppMetrics {
  users: number;
  messages: number;
  activity: number;
}

function DashboardOverview() {
  const { t } = useTranslation();
  const { payload } = useAuth();
  const { apps } = useDemo();
  const [showCreateApp, setShowCreateApp] = useState(false);
  const [showInviteUser, setShowInviteUser] = useState(false);
  const [dbApps, setDbApps] = useState<Application[]>([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [usageMetrics, setUsageMetrics] = useState<UsageMetric[]>([]);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  
  const tenantApps = apps.filter(app => app.tenant_id === payload?.tenant_id);

  // Fetch apps and metrics from database
  useEffect(() => {
    const fetchApps = async () => {
      try {
        const { data, error } = await supabase
          .from('applications')
          .select(`
            *,
            module_settings (*)
          `)
          .neq('status', 'deleted')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setDbApps(data || []);
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setLoadingApps(false);
      }
    };

    const fetchMetrics = async () => {
      try {
        // Fetch metrics from the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const { data, error } = await supabase
          .from('usage_metrics')
          .select('*')
          .gte('recorded_at', thirtyDaysAgo.toISOString().split('T')[0])
          .order('recorded_at', { ascending: false });

        if (error) throw error;
        setUsageMetrics(data || []);
      } catch (error) {
        console.error('Error fetching usage metrics:', error);
      } finally {
        setLoadingMetrics(false);
      }
    };

    fetchApps();
    fetchMetrics();
  }, []);

  // Aggregate metrics per application
  const getAppMetrics = useCallback((appId: string): AppMetrics => {
    const appMetrics = usageMetrics.filter(m => m.application_id === appId);
    
    if (appMetrics.length === 0) {
      // Return mock data if no real metrics exist
      const hash = appId.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0);
      return {
        users: Math.abs(hash % 50) + 5,
        messages: Math.abs((hash * 7) % 500) + 20,
        activity: Math.abs((hash * 13) % 40) + 60
      };
    }

    // Aggregate by metric type
    const users = appMetrics
      .filter(m => m.metric_type === 'active_users')
      .reduce((sum, m) => sum + m.count, 0);
    
    const messages = appMetrics
      .filter(m => m.metric_type === 'messages_sent')
      .reduce((sum, m) => sum + m.count, 0);
    
    const sessions = appMetrics
      .filter(m => m.metric_type === 'sessions')
      .reduce((sum, m) => sum + m.count, 0);
    
    // Calculate activity as a percentage based on sessions
    const maxSessions = 100; // Expected max sessions per period
    const activity = Math.min(100, Math.round((sessions / maxSessions) * 100)) || 75;

    return { users, messages, activity };
  }, [usageMetrics]);

  // Calculate global stats from real metrics
  const totalMetrics = useMemo(() => {
    const totalUsers = usageMetrics
      .filter(m => m.metric_type === 'active_users')
      .reduce((sum, m) => sum + m.count, 0);
    
    const totalMessages = usageMetrics
      .filter(m => m.metric_type === 'messages_sent')
      .reduce((sum, m) => sum + m.count, 0);
    
    return { totalUsers, totalMessages };
  }, [usageMetrics]);
  
  const stats = [
    { 
      label: 'Applications', 
      value: dbApps.length || tenantApps.length, 
      icon: AppWindow, 
      change: `${dbApps.filter(a => new Date(a.created_at) > new Date(Date.now() - 30*24*60*60*1000)).length} ce mois` 
    },
    { 
      label: 'Utilisateurs actifs', 
      value: totalMetrics.totalUsers || 24, 
      icon: Users, 
      change: '+5 cette semaine' 
    },
    { 
      label: 'Messages envoyés', 
      value: totalMetrics.totalMessages || 156, 
      icon: MessageCircle, 
      change: '+23 aujourd\'hui' 
    },
    { label: 'Taux d\'activité', value: '92%', icon: TrendingUp, change: '+3%' },
  ];

  const recentActivity = [
    { time: '10:42:15', action: 'Module activé', details: 'iAsted', user: 'admin@ministry.gov' },
    { time: '10:41:30', action: 'Message envoyé', details: 'iCom', user: 'user@ministry.gov' },
    { time: '10:40:12', action: 'Thread créé', details: 'iBoîte', user: 'agent@ministry.gov' },
    { time: '10:38:45', action: 'Utilisateur ajouté', details: 'Jean Dupont', user: 'admin@ministry.gov' },
  ];

  // Mock tenant ID - in real app, would come from auth context
  const tenantId = payload?.tenant_id || 'demo-tenant';

  // Combine DB apps with demo apps for display
  const displayApps = dbApps.length > 0 ? dbApps : tenantApps.map(app => ({
    id: app.app_id,
    name: app.name,
    description: null,
    app_id: app.app_id,
    status: app.status,
    network_type: 'intranet',
    created_at: new Date().toISOString(),
    module_settings: Object.entries(app.enabled_modules).map(([name, enabled]) => ({
      id: name,
      module_name: name,
      enabled: enabled as boolean,
      settings: {}
    }))
  }));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-card/50 border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Usage Metrics Chart */}
      <UsageMetricsChart tenantName={payload?.tenant_id} />

      {/* Applications Stats */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Statistiques par application
          </CardTitle>
          <CardDescription>
            Aperçu de l'utilisation de chaque application
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingApps ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : displayApps.length > 0 ? (
            <div className="space-y-4">
              {displayApps.slice(0, 5).map((app) => {
                const appStats = getAppMetrics(app.id);
                const enabledModules = app.module_settings?.filter(m => m.enabled).length || 0;
                
                return (
                  <div 
                    key={app.id} 
                    className="flex items-center gap-4 p-4 rounded-lg border border-border/50 hover:border-primary/30 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                      <AppWindow className="w-5 h-5 text-primary" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Link 
                          to={`/admin/tenant/apps/${app.id}`}
                          className="font-medium text-foreground hover:text-primary transition-colors truncate"
                        >
                          {app.name}
                        </Link>
                        <Badge variant={app.status === 'active' ? 'default' : 'secondary'} className="shrink-0">
                          {app.status === 'active' ? 'Actif' : 'Inactif'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {enabledModules} module{enabledModules > 1 ? 's' : ''} actif{enabledModules > 1 ? 's' : ''}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-6 text-center">
                      <div>
                        <div className="text-lg font-semibold text-foreground">{appStats.users}</div>
                        <div className="text-xs text-muted-foreground">Utilisateurs</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-foreground">{appStats.messages}</div>
                        <div className="text-xs text-muted-foreground">Messages</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-foreground">{appStats.activity}%</div>
                        <div className="text-xs text-muted-foreground">Activité</div>
                      </div>
                    </div>
                    
                    <Link to={`/admin/tenant/apps/${app.id}`}>
                      <Button variant="ghost" size="icon">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                );
              })}
              
              {displayApps.length > 5 && (
                <div className="text-center pt-2">
                  <Link to="/admin/tenant/apps">
                    <Button variant="outline" size="sm">
                      Voir toutes les applications ({displayApps.length})
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <AppWindow className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Aucune application</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3"
                onClick={() => setShowCreateApp(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Créer une application
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Actions rapides</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button variant="outline" className="justify-start gap-2" onClick={() => setShowCreateApp(true)}>
              <Plus className="w-4 h-4" />
              Nouvelle application
            </Button>
            <Button variant="outline" className="justify-start gap-2" onClick={() => setShowInviteUser(true)}>
              <Users className="w-4 h-4" />
              Inviter un utilisateur
            </Button>
            <Button variant="outline" className="justify-start gap-2">
              <Settings className="w-4 h-4" />
              Configurer les modules
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Activité récente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((log, i) => (
                <div key={i} className="flex items-center gap-3 text-sm py-2 border-b border-border/50 last:border-0">
                  <Clock className="w-3 h-3 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground font-mono text-xs">{log.time}</span>
                  <span className="text-foreground flex-1">{log.action}</span>
                  <Badge variant="secondary" className="text-xs">{log.details}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <CreateApplicationDialog 
        open={showCreateApp} 
        onOpenChange={setShowCreateApp}
        tenantId={tenantId}
      />
      <InviteUserDialog 
        open={showInviteUser} 
        onOpenChange={setShowInviteUser}
        tenantId={tenantId}
      />
    </motion.div>
  );
}

function AppsList() {
  const { t } = useTranslation();
  const { payload } = useAuth();
  const { apps } = useDemo();
  const [search, setSearch] = useState('');
  const [showCreateApp, setShowCreateApp] = useState(false);
  const [dbApps, setDbApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleted, setShowDeleted] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [restoring, setRestoring] = useState<string | null>(null);
  const [hardDeleting, setHardDeleting] = useState<string | null>(null);
  const [appToDelete, setAppToDelete] = useState<Application | null>(null);
  
  // View mode: 'cards' or 'table'
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  
  // Sorting
  const [sortField, setSortField] = useState<'name' | 'status' | 'created_at' | 'network_type'>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const tenantId = payload?.tenant_id || 'demo-tenant';

  const fetchApps = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          module_settings (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDbApps(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApps();
  }, [fetchApps]);

  const handleRestore = async (appId: string) => {
    setRestoring(appId);
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status: 'active' })
        .eq('id', appId);

      if (error) throw error;
      toast.success('Application restaurée avec succès');
      fetchApps();
    } catch (error) {
      console.error('Error restoring application:', error);
      toast.error('Erreur lors de la restauration');
    } finally {
      setRestoring(null);
    }
  };

  const handleHardDelete = async (app: Application) => {
    setHardDeleting(app.id);
    try {
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', app.id);

      if (error) throw error;
      toast.success('Application supprimée définitivement');
      setAppToDelete(null);
      fetchApps();
    } catch (error) {
      console.error('Error deleting application:', error);
      toast.error('Erreur lors de la suppression');
    } finally {
      setHardDeleting(null);
    }
  };

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  // Combine mock apps with DB apps for demo
  const tenantApps = apps.filter(app => 
    app.tenant_id === payload?.tenant_id &&
    app.name.toLowerCase().includes(search.toLowerCase())
  );

  // Filter DB apps based on search, status filter, and deleted status
  const filteredDbApps = dbApps.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(search.toLowerCase());
    const matchesDeletedFilter = showDeleted || app.status !== 'deleted';
    const matchesStatusFilter = statusFilter === 'all' || 
      (statusFilter === 'deleted' ? app.status === 'deleted' : app.status === statusFilter);
    return matchesSearch && matchesDeletedFilter && matchesStatusFilter;
  });

  // Count apps by status for badges
  const deletedCount = dbApps.filter(app => app.status === 'deleted').length;
  const statusCounts = {
    all: dbApps.filter(app => showDeleted || app.status !== 'deleted').length,
    active: dbApps.filter(app => app.status === 'active').length,
    inactive: dbApps.filter(app => app.status === 'inactive').length,
    suspended: dbApps.filter(app => app.status === 'suspended').length,
    deleted: deletedCount
  };

  const allApps = [...filteredDbApps, ...tenantApps.map(app => ({
    id: app.app_id,
    name: app.name,
    description: null,
    app_id: app.app_id,
    status: app.status,
    network_type: 'intranet',
    created_at: new Date().toISOString(),
    module_settings: Object.entries(app.enabled_modules).map(([name, enabled]) => ({
      id: name,
      module_name: name,
      enabled: enabled as boolean,
      settings: {}
    }))
  }))];

  // Sort apps
  const sortedApps = [...allApps].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
      case 'created_at':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
      case 'network_type':
        comparison = a.network_type.localeCompare(b.network_type);
        break;
    }
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // Pagination
  const totalPages = Math.ceil(sortedApps.length / itemsPerPage);
  const paginatedApps = sortedApps.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const statusOptions = [
    { value: 'all', label: 'Tous', count: statusCounts.all },
    { value: 'active', label: 'Actif', count: statusCounts.active },
    { value: 'inactive', label: 'Inactif', count: statusCounts.inactive },
    { value: 'suspended', label: 'Suspendu', count: statusCounts.suspended },
  ];

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'active': return 'Actif';
      case 'inactive': return 'Inactif';
      case 'suspended': return 'Suspendu';
      case 'deleted': return 'Archivé';
      default: return status;
    }
  };

  const getStatusVariant = (status: string) => {
    switch(status) {
      case 'active': return 'default' as const;
      case 'deleted': return 'destructive' as const;
      case 'suspended': return 'outline' as const;
      default: return 'secondary' as const;
    }
  };

  const getNetworkTypeLabel = (type: string) => {
    switch(type) {
      case 'intranet': return 'Intranet';
      case 'extranet': return 'Extranet';
      case 'internet': return 'Internet';
      default: return type;
    }
  };

  const SortIcon = ({ field }: { field: typeof sortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4 ml-1" />;
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-4 h-4 ml-1" /> 
      : <ArrowDown className="w-4 h-4 ml-1" />;
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Filters Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Rechercher une application..." 
              className="pl-9"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            />
          </div>
          
          {/* Status Filter */}
          <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg">
            {statusOptions.map((option) => (
              <Button
                key={option.value}
                variant={statusFilter === option.value ? "secondary" : "ghost"}
                size="sm"
                onClick={() => { setStatusFilter(option.value); setCurrentPage(1); }}
                className="gap-1.5 h-8"
              >
                {option.label}
                {option.count > 0 && (
                  <span className={cn(
                    "text-xs px-1.5 py-0.5 rounded-full",
                    statusFilter === option.value 
                      ? "bg-background text-foreground" 
                      : "bg-muted-foreground/20 text-muted-foreground"
                  )}>
                    {option.count}
                  </span>
                )}
              </Button>
            ))}
          </div>
          
          {/* Toggle to show deleted apps */}
          {deletedCount > 0 && (
            <Button 
              variant={showDeleted ? "secondary" : "outline"} 
              size="sm"
              onClick={() => {
                setShowDeleted(!showDeleted);
                if (!showDeleted) setStatusFilter('all');
                setCurrentPage(1);
              }}
              className="gap-2"
            >
              {showDeleted ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <Archive className="w-4 h-4" />
              {showDeleted ? 'Masquer archivées' : 'Voir archivées'}
              <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                {deletedCount}
              </Badge>
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center border border-border rounded-lg p-1">
            <Button 
              variant={viewMode === 'cards' ? 'secondary' : 'ghost'} 
              size="icon" 
              className="h-8 w-8"
              onClick={() => setViewMode('cards')}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button 
              variant={viewMode === 'table' ? 'secondary' : 'ghost'} 
              size="icon" 
              className="h-8 w-8"
              onClick={() => setViewMode('table')}
            >
              <LayoutList className="w-4 h-4" />
            </Button>
          </div>
          <Button variant="outline" size="icon" onClick={fetchApps}>
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </Button>
          <Button className="gap-2" onClick={() => setShowCreateApp(true)}>
            <Plus className="w-4 h-4" />
            Nouvelle application
          </Button>
        </div>
      </div>

      {/* Table View */}
      {viewMode === 'table' ? (
        <Card className="bg-card/50 border-border/50">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer select-none hover:bg-muted/50"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    Nom <SortIcon field="name" />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer select-none hover:bg-muted/50"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center">
                    Statut <SortIcon field="status" />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer select-none hover:bg-muted/50"
                  onClick={() => handleSort('network_type')}
                >
                  <div className="flex items-center">
                    Réseau <SortIcon field="network_type" />
                  </div>
                </TableHead>
                <TableHead>Modules</TableHead>
                <TableHead 
                  className="cursor-pointer select-none hover:bg-muted/50"
                  onClick={() => handleSort('created_at')}
                >
                  <div className="flex items-center">
                    Créé le <SortIcon field="created_at" />
                  </div>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedApps.length > 0 ? paginatedApps.map((app) => {
                const isDeleted = app.status === 'deleted';
                return (
                  <TableRow key={app.app_id} className={cn(isDeleted && "opacity-60")}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center",
                          isDeleted ? "bg-muted" : "bg-primary/20"
                        )}>
                          {isDeleted 
                            ? <Archive className="w-4 h-4 text-muted-foreground" />
                            : <AppWindow className="w-4 h-4 text-primary" />
                          }
                        </div>
                        <div>
                          {isDeleted ? (
                            <span className="font-medium text-muted-foreground line-through">{app.name}</span>
                          ) : (
                            <Link 
                              to={`/admin/tenant/apps/${app.id}`}
                              className="font-medium text-foreground hover:text-primary transition-colors"
                            >
                              {app.name}
                            </Link>
                          )}
                          <p className="text-xs text-muted-foreground font-mono">{app.app_id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(app.status)}>
                        {getStatusLabel(app.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {getNetworkTypeLabel(app.network_type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {app.module_settings?.slice(0, 3).map((mod) => (
                          <span 
                            key={mod.module_name}
                            className={cn(
                              "px-1.5 py-0.5 rounded text-xs",
                              mod.enabled ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"
                            )}
                          >
                            {mod.module_name}
                          </span>
                        ))}
                        {app.module_settings && app.module_settings.length > 3 && (
                          <span className="text-xs text-muted-foreground">
                            +{app.module_settings.length - 3}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(app.created_at).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell className="text-right">
                      {isDeleted ? (
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleRestore(app.id)}
                            disabled={restoring === app.id}
                          >
                            {restoring === app.id ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <RotateCcw className="w-3 h-3" />
                            )}
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => setAppToDelete(app as Application)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/admin/tenant/apps/${app.id}`}>
                                <Settings className="w-4 h-4 mr-2" />
                                Configurer
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to={`/admin/tenant/apps/${app.id}#modules`}>
                                <Layers className="w-4 h-4 mr-2" />
                                Modules
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                );
              }) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    {loading ? 'Chargement...' : 
                     statusFilter !== 'all' ? `Aucune application ${getStatusLabel(statusFilter).toLowerCase()} trouvée` :
                     showDeleted ? 'Aucune application trouvée' : 
                     'Aucune application active trouvée'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      ) : (
        /* Card View */
        <div className="grid gap-4">
          {paginatedApps.length > 0 ? paginatedApps.map((app) => {
            const isDeleted = app.status === 'deleted';
            
            return (
              <Card 
                key={app.app_id} 
                className={cn(
                  "bg-card/50 border-border/50 transition-colors",
                  isDeleted 
                    ? "opacity-60 border-destructive/20" 
                    : "hover:border-primary/30"
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    {isDeleted ? (
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                          <Archive className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="font-medium text-muted-foreground line-through">
                            {app.name}
                          </h3>
                          <p className="text-xs text-muted-foreground font-mono">{app.app_id}</p>
                        </div>
                      </div>
                    ) : (
                      <Link 
                        to={`/admin/tenant/apps/${app.id}`}
                        className="flex items-center gap-3 flex-1 group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                          <AppWindow className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                            {app.name}
                          </h3>
                          <p className="text-xs text-muted-foreground font-mono">{app.app_id}</p>
                        </div>
                      </Link>
                    )}
                    
                    <div className="flex items-center gap-3">
                      <Badge variant={getStatusVariant(app.status)}>
                        {getStatusLabel(app.status)}
                      </Badge>
                      
                      {isDeleted ? (
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleRestore(app.id)}
                            disabled={restoring === app.id}
                            className="gap-2"
                          >
                            {restoring === app.id ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <RotateCcw className="w-4 h-4" />
                            )}
                            Restaurer
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => setAppToDelete(app as Application)}
                            className="gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Supprimer
                          </Button>
                        </div>
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/admin/tenant/apps/${app.id}`}>
                                <Settings className="w-4 h-4 mr-2" />
                                Configurer
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to={`/admin/tenant/apps/${app.id}#modules`}>
                                <Layers className="w-4 h-4 mr-2" />
                                Modules
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                  
                  {!isDeleted && (
                    <div className="mt-4 flex gap-2">
                      {app.module_settings?.map((mod) => (
                        <span 
                          key={mod.module_name}
                          className={cn(
                            "px-2 py-0.5 rounded text-xs",
                            mod.enabled ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"
                          )}
                        >
                          {mod.module_name}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          }) : (
            <Card className="bg-card/50 border-border/50">
              <CardContent className="py-12 text-center text-muted-foreground">
                {loading ? 'Chargement...' : 
                 statusFilter !== 'all' ? `Aucune application ${getStatusLabel(statusFilter).toLowerCase()} trouvée` :
                 showDeleted ? 'Aucune application trouvée' : 
                 'Aucune application active trouvée'}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Affichage de {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, sortedApps.length)} sur {sortedApps.length} applications
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Précédent
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => 
                  page === 1 || 
                  page === totalPages || 
                  Math.abs(page - currentPage) <= 1
                )
                .map((page, index, arr) => (
                  <div key={page} className="flex items-center">
                    {index > 0 && arr[index - 1] !== page - 1 && (
                      <span className="px-2 text-muted-foreground">...</span>
                    )}
                    <Button
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      className="w-8 h-8 p-0"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  </div>
                ))
              }
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Suivant
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      <CreateApplicationDialog 
        open={showCreateApp} 
        onOpenChange={setShowCreateApp}
        tenantId={tenantId}
        onSuccess={fetchApps}
      />

      {/* Hard Delete Confirmation Dialog */}
      <AlertDialog open={!!appToDelete} onOpenChange={() => setAppToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Suppression définitive
            </AlertDialogTitle>
            <AlertDialogDescription>
              Vous êtes sur le point de supprimer définitivement l'application <strong>{appToDelete?.name}</strong>.
              <br /><br />
              Cette action est <strong>irréversible</strong>. Toutes les données associées seront perdues.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!hardDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => appToDelete && handleHardDelete(appToDelete)}
              disabled={!!hardDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {hardDeleting && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
              Supprimer définitivement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}

// Application Detail Page with Module Settings
function ApplicationDetail() {
  const { appId } = useParams<{ appId: string }>();
  const navigate = useNavigate();
  const [app, setApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteType, setDeleteType] = useState<'soft' | 'hard'>('soft');
  const [deleting, setDeleting] = useState(false);
  
  // Editable form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active' as string,
    network_type: 'intranet' as string
  });
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const fetchApp = async () => {
      if (!appId) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('applications')
          .select('*')
          .eq('id', appId)
          .maybeSingle();

        if (error) throw error;
        setApp(data);
        
        if (data) {
          setFormData({
            name: data.name,
            description: data.description || '',
            status: data.status,
            network_type: data.network_type
          });
        }
      } catch (error) {
        console.error('Error fetching application:', error);
        toast.error('Application non trouvée');
      } finally {
        setLoading(false);
      }
    };

    fetchApp();
  }, [appId]);

  // Track changes
  useEffect(() => {
    if (app) {
      const changed = 
        formData.name !== app.name ||
        formData.description !== (app.description || '') ||
        formData.status !== app.status ||
        formData.network_type !== app.network_type;
      setHasChanges(changed);
    }
  }, [formData, app]);

  const handleSave = async () => {
    if (!app || !hasChanges) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('applications')
        .update({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          status: formData.status,
          network_type: formData.network_type
        })
        .eq('id', app.id);

      if (error) throw error;

      // Update local state
      setApp(prev => prev ? {
        ...prev,
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        status: formData.status,
        network_type: formData.network_type
      } : null);

      setHasChanges(false);
      toast.success('Application mise à jour avec succès');
    } catch (error) {
      console.error('Error updating application:', error);
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (app) {
      setFormData({
        name: app.name,
        description: app.description || '',
        status: app.status,
        network_type: app.network_type
      });
    }
  };

  const handleDelete = async () => {
    if (!app) return;

    setDeleting(true);
    try {
      if (deleteType === 'soft') {
        // Soft delete - just change status to 'deleted'
        const { error } = await supabase
          .from('applications')
          .update({ status: 'deleted' })
          .eq('id', app.id);

        if (error) throw error;
        toast.success('Application archivée avec succès');
      } else {
        // Hard delete - actually remove from database
        const { error } = await supabase
          .from('applications')
          .delete()
          .eq('id', app.id);

        if (error) throw error;
        toast.success('Application supprimée définitivement');
      }

      setShowDeleteDialog(false);
      navigate('/admin/tenant/apps');
    } catch (error) {
      console.error('Error deleting application:', error);
      toast.error('Erreur lors de la suppression');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!app) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">Application non trouvée</p>
            <Button variant="outline" onClick={() => navigate('/admin/tenant/apps')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux applications
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/tenant/apps')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <AppWindow className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{app.name}</h2>
              <p className="text-sm text-muted-foreground font-mono">{app.app_id}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={formData.status === 'active' ? 'default' : formData.status === 'suspended' ? 'destructive' : 'secondary'}>
            {formData.status === 'active' ? 'Actif' : formData.status === 'suspended' ? 'Suspendu' : 'Inactif'}
          </Badge>
          <Badge variant="outline" className="capitalize">{formData.network_type}</Badge>
        </div>
      </div>

      {/* Application Info Form */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Informations
            </CardTitle>
            {hasChanges && (
              <Badge variant="outline" className="text-warning border-warning">
                Modifications non enregistrées
              </Badge>
            )}
          </div>
          <CardDescription>
            Modifiez les informations de l'application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Nom de l'application</label>
              <Input 
                value={formData.name} 
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1" 
                placeholder="Nom de l'application"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Identifiant (non modifiable)</label>
              <Input value={app.app_id} className="mt-1 font-mono bg-muted/50" readOnly />
            </div>
            <div>
              <label className="text-sm font-medium">Statut</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
                <option value="suspended">Suspendu</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Type de réseau</label>
              <select
                value={formData.network_type}
                onChange={(e) => setFormData(prev => ({ ...prev, network_type: e.target.value }))}
                className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="intranet">Intranet (interne)</option>
                <option value="extranet">Extranet (partenaires)</option>
                <option value="internet">Internet (public)</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Créé le</label>
              <Input 
                value={new Date(app.created_at).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })} 
                className="mt-1 bg-muted/50" 
                readOnly 
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium">Description</label>
              <Input 
                value={formData.description} 
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="mt-1" 
                placeholder="Description de l'application (optionnel)"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/50">
            <Button 
              variant="outline" 
              onClick={handleReset}
              disabled={!hasChanges || saving}
            >
              Annuler
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!hasChanges || saving || !formData.name.trim()}
            >
              {saving && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
              Enregistrer
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Module Settings */}
      <div id="modules">
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Layers className="w-5 h-5" />
              Configuration des modules
            </CardTitle>
            <CardDescription>
              Activez ou désactivez les modules disponibles pour cette application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ModuleSettingsPanel applicationId={app.id} />
          </CardContent>
        </Card>
      </div>

      {/* Danger Zone */}
      <Card className="bg-card/50 border-destructive/30">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Zone de danger
          </CardTitle>
          <CardDescription>
            Actions irréversibles - procédez avec prudence
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Supprimer l'application</p>
              <p className="text-sm text-muted-foreground">
                Cette action archivera ou supprimera définitivement l'application
              </p>
            </div>
            <Button 
              variant="destructive" 
              onClick={() => setShowDeleteDialog(true)}
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Supprimer
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Supprimer l'application
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p>
                  Vous êtes sur le point de supprimer l'application <strong>{app.name}</strong>.
                </p>
                
                <RadioGroup 
                  value={deleteType} 
                  onValueChange={(value) => setDeleteType(value as 'soft' | 'hard')}
                  className="space-y-3"
                >
                  <div className="flex items-start space-x-3 p-3 rounded-lg border border-border/50 hover:border-border transition-colors">
                    <RadioGroupItem value="soft" id="soft-delete" className="mt-1" />
                    <Label htmlFor="soft-delete" className="cursor-pointer flex-1">
                      <span className="font-medium">Archiver (soft delete)</span>
                      <p className="text-sm text-muted-foreground mt-1">
                        L'application sera marquée comme supprimée mais les données seront conservées. 
                        Vous pourrez la restaurer ultérieurement.
                      </p>
                    </Label>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-3 rounded-lg border border-destructive/30 hover:border-destructive/50 transition-colors">
                    <RadioGroupItem value="hard" id="hard-delete" className="mt-1" />
                    <Label htmlFor="hard-delete" className="cursor-pointer flex-1">
                      <span className="font-medium text-destructive">Supprimer définitivement (hard delete)</span>
                      <p className="text-sm text-muted-foreground mt-1">
                        L'application et toutes ses données seront supprimées de façon permanente. 
                        Cette action est irréversible.
                      </p>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
              {deleteType === 'soft' ? 'Archiver' : 'Supprimer définitivement'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}

function ModulesConfig() {
  const { t } = useTranslation();
  
  const modules = [
    { 
      id: 'icom', 
      name: 'iCom', 
      description: 'Communication instantanée', 
      icon: MessageCircle,
      features: ['Chat', 'Appels vocaux', 'Visioconférence'],
      enabled: true 
    },
    { 
      id: 'iboite', 
      name: 'iBoîte', 
      description: 'Messagerie asynchrone', 
      icon: Inbox,
      features: ['Threads', 'Pièces jointes', 'Archivage'],
      enabled: true 
    },
    { 
      id: 'iasted', 
      name: 'iAsted', 
      description: 'Assistant IA', 
      icon: Bot,
      features: ['Chatbot', 'Analyse de documents', 'Résumés automatiques'],
      enabled: false 
    },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="grid gap-4">
        {modules.map((module) => (
          <Card key={module.id} className="bg-card/50 border-border/50">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    module.enabled ? "bg-primary/20" : "bg-muted"
                  )}>
                    <module.icon className={cn(
                      "w-6 h-6",
                      module.enabled ? "text-primary" : "text-muted-foreground"
                    )} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{module.name}</h3>
                    <p className="text-sm text-muted-foreground">{module.description}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {module.features.map((feature) => (
                        <Badge key={feature} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                <Switch defaultChecked={module.enabled} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}

function IComConfig() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            Configuration iCom
          </CardTitle>
          <CardDescription>
            Paramètres de communication instantanée pour votre tenant
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between py-3 border-b border-border/50">
            <div>
              <h4 className="font-medium">Chat</h4>
              <p className="text-sm text-muted-foreground">Messages instantanés entre utilisateurs</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between py-3 border-b border-border/50">
            <div>
              <h4 className="font-medium">Appels vocaux</h4>
              <p className="text-sm text-muted-foreground">Appels audio entre utilisateurs</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between py-3 border-b border-border/50">
            <div>
              <h4 className="font-medium">Visioconférence</h4>
              <p className="text-sm text-muted-foreground">Appels vidéo et réunions</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <h4 className="font-medium">Appels cross-realm</h4>
              <p className="text-sm text-muted-foreground">Autoriser les appels entre différents realms</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function IBoiteConfig() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Inbox className="w-5 h-5 text-primary" />
            Configuration iBoîte
          </CardTitle>
          <CardDescription>
            Paramètres de messagerie asynchrone
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between py-3 border-b border-border/50">
            <div>
              <h4 className="font-medium">Threads</h4>
              <p className="text-sm text-muted-foreground">Conversations organisées en fils</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between py-3 border-b border-border/50">
            <div>
              <h4 className="font-medium">Pièces jointes</h4>
              <p className="text-sm text-muted-foreground">Autoriser l'envoi de fichiers</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <h4 className="font-medium">Archivage automatique</h4>
              <p className="text-sm text-muted-foreground">Archiver les threads après 30 jours</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function IAstedConfig() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            Configuration iAsted
          </CardTitle>
          <CardDescription>
            Paramètres de l'assistant IA
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between py-3 border-b border-border/50">
            <div>
              <h4 className="font-medium">Chatbot</h4>
              <p className="text-sm text-muted-foreground">Assistant conversationnel IA</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between py-3 border-b border-border/50">
            <div>
              <h4 className="font-medium">Analyse de documents</h4>
              <p className="text-sm text-muted-foreground">Extraction d'informations automatique</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <h4 className="font-medium">Résumés automatiques</h4>
              <p className="text-sm text-muted-foreground">Génération de résumés de conversations</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function UsersList() {
  const { payload } = useAuth();
  const [showInviteUser, setShowInviteUser] = useState(false);
  const [members, setMembers] = useState<TenantMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const tenantId = payload?.tenant_id || 'demo-tenant';

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tenant_members')
        .select('*')
        .order('invited_at', { ascending: false });

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // Mock users for demo
  const mockUsers = [
    { id: '1', name: 'Jean Dupont', email: 'jean.dupont@ministry.gov', role: 'admin', status: 'active' },
    { id: '2', name: 'Marie Martin', email: 'marie.martin@ministry.gov', role: 'member', status: 'active' },
    { id: '3', name: 'Pierre Durand', email: 'pierre.durand@ministry.gov', role: 'viewer', status: 'inactive' },
  ];

  const allUsers = [
    ...members.map(m => ({
      id: m.id,
      name: 'Utilisateur',
      email: m.user_id,
      role: m.role,
      status: m.status
    })),
    ...mockUsers
  ].filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Rechercher un utilisateur..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button className="gap-2" onClick={() => setShowInviteUser(true)}>
          <Plus className="w-4 h-4" />
          Inviter un utilisateur
        </Button>
      </div>

      <Card className="bg-card/50 border-border/50">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Chargement...
                </TableCell>
              </TableRow>
            ) : allUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Aucun utilisateur trouvé
                </TableCell>
              </TableRow>
            ) : (
              allUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">{user.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                      {user.status === 'active' ? 'Actif' : user.status === 'pending' ? 'En attente' : 'Inactif'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Modifier</DropdownMenuItem>
                        <DropdownMenuItem>Permissions</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Désactiver</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <InviteUserDialog 
        open={showInviteUser} 
        onOpenChange={setShowInviteUser}
        tenantId={tenantId}
        onSuccess={fetchMembers}
      />
    </motion.div>
  );
}

function AuditLog() {
  const logs = [
    { id: '1', timestamp: '2024-01-15 10:42:15', action: 'MODULE_ENABLED', details: 'iAsted activé', user: 'admin@ministry.gov', ip: '192.168.1.1' },
    { id: '2', timestamp: '2024-01-15 10:41:30', action: 'MESSAGE_SENT', details: 'Message iCom envoyé', user: 'user@ministry.gov', ip: '192.168.1.2' },
    { id: '3', timestamp: '2024-01-15 10:40:12', action: 'THREAD_CREATED', details: 'Thread iBoîte créé', user: 'agent@ministry.gov', ip: '192.168.1.3' },
    { id: '4', timestamp: '2024-01-15 10:38:45', action: 'USER_ADDED', details: 'Utilisateur ajouté', user: 'admin@ministry.gov', ip: '192.168.1.1' },
    { id: '5', timestamp: '2024-01-15 10:35:20', action: 'CONFIG_CHANGED', details: 'Configuration modifiée', user: 'admin@ministry.gov', ip: '192.168.1.1' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Rechercher dans les logs..." className="pl-9" />
        </div>
      </div>

      <Card className="bg-card/50 border-border/50">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Horodatage</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Détails</TableHead>
              <TableHead>Utilisateur</TableHead>
              <TableHead>IP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {log.timestamp}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-mono text-xs">
                    {log.action}
                  </Badge>
                </TableCell>
                <TableCell>{log.details}</TableCell>
                <TableCell className="text-muted-foreground">{log.user}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{log.ip}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </motion.div>
  );
}

function TenantSettings() {
  const { payload } = useAuth();
  
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle>Paramètres du Tenant</CardTitle>
          <CardDescription>Configuration générale de votre organisation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">ID du Tenant</label>
              <Input value={payload?.tenant_id || ''} disabled className="mt-1.5 font-mono" />
            </div>
            <div>
              <label className="text-sm font-medium">Nom de l'organisation</label>
              <Input defaultValue="Ministry Admin" className="mt-1.5" />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium">Description</label>
            <Input defaultValue="Administration du ministère" className="mt-1.5" />
          </div>
          
          <Button>Sauvegarder</Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ============= Main Dashboard Component =============

export default function TenantAdminDashboard() {
  const { t } = useTranslation();
  const { payload } = useAuth();
  const navigate = useNavigate();

  // Redirect if not a tenant admin
  if (!payload?.scopes?.includes('tenant:*')) {
    return <Navigate to="/forbidden" replace />;
  }

  return (
    <AdminLayout 
      adminType="tenant" 
      title="Tenant Administration"
      subtitle={payload?.tenant_id}
    >
      <Routes>
        <Route index element={<DashboardOverview />} />
        <Route path="apps" element={<AppsList />} />
        <Route path="apps/:appId" element={<ApplicationDetail />} />
        <Route path="modules" element={<ModulesConfig />} />
        <Route path="icom" element={<IComConfig />} />
        <Route path="iboite" element={<IBoiteConfig />} />
        <Route path="iasted" element={<IAstedConfig />} />
        <Route path="users" element={<UsersList />} />
        <Route path="audit" element={<AuditLog />} />
        <Route path="settings" element={<TenantSettings />} />
      </Routes>
    </AdminLayout>
  );
}
