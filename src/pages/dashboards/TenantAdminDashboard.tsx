/**
 * Tenant Admin Dashboard
 * Complete tenant administration space with sidebar navigation
 */

import { useState, useEffect, useCallback } from 'react';
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
  Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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

function DashboardOverview() {
  const { t } = useTranslation();
  const { payload } = useAuth();
  const { apps } = useDemo();
  const [showCreateApp, setShowCreateApp] = useState(false);
  const [showInviteUser, setShowInviteUser] = useState(false);
  
  const tenantApps = apps.filter(app => app.tenant_id === payload?.tenant_id);
  
  const stats = [
    { label: 'Applications', value: tenantApps.length, icon: AppWindow, change: '+2 ce mois' },
    { label: 'Utilisateurs actifs', value: 24, icon: Users, change: '+5 cette semaine' },
    { label: 'Messages envoyés', value: 156, icon: MessageCircle, change: '+23 aujourd\'hui' },
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

  // Combine mock apps with DB apps for demo
  const tenantApps = apps.filter(app => 
    app.tenant_id === payload?.tenant_id &&
    app.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredDbApps = dbApps.filter(app =>
    app.name.toLowerCase().includes(search.toLowerCase())
  );

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

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Rechercher une application..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchApps}>
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </Button>
          <Button className="gap-2" onClick={() => setShowCreateApp(true)}>
            <Plus className="w-4 h-4" />
            Nouvelle application
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {allApps.length > 0 ? allApps.map((app) => (
          <Card key={app.app_id} className="bg-card/50 border-border/50 hover:border-primary/30 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
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
                
                <div className="flex items-center gap-3">
                  <Badge variant={app.status === 'active' ? 'default' : 'secondary'}>
                    {app.status === 'active' ? 'Actif' : 'Désactivé'}
                  </Badge>
                  
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
                      <DropdownMenuItem className="text-destructive">Désactiver</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
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
            </CardContent>
          </Card>
        )) : (
          <Card className="bg-card/50 border-border/50">
            <CardContent className="py-12 text-center text-muted-foreground">
              {loading ? 'Chargement...' : 'Aucune application trouvée'}
            </CardContent>
          </Card>
        )}
      </div>

      <CreateApplicationDialog 
        open={showCreateApp} 
        onOpenChange={setShowCreateApp}
        tenantId={tenantId}
        onSuccess={fetchApps}
      />
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
