import { useState } from 'react';
import { useNavigate, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  Crown, AppWindow, Network, Layers, 
  Activity, Plus, Search, MoreHorizontal,
  Building, Users, Shield, FileText, Settings,
  CheckCircle, XCircle, AlertTriangle,
  Eye, Edit, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useDemo } from '@/contexts/DemoContext';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { cn } from '@/lib/utils';

// Dashboard Overview Component
function DashboardOverview() {
  const { t } = useTranslation();
  const { apps, networks } = useDemo();
  
  const stats = [
    { label: 'Applications', value: apps.length, icon: AppWindow, color: 'text-primary' },
    { label: 'Réseaux', value: networks.length, icon: Network, color: 'text-blue-500' },
    { label: 'Tenants', value: 4, icon: Building, color: 'text-emerald-500' },
    { label: 'Utilisateurs', value: 12, icon: Users, color: 'text-amber-500' },
  ];

  const recentActivity = [
    { time: '10:42:15', action: 'Application enregistrée', details: 'gov-app-1', user: 'platform-admin', type: 'success' },
    { time: '10:41:30', action: 'Réseau créé', details: 'gov-net-1', user: 'platform-admin', type: 'success' },
    { time: '10:40:12', action: 'Module activé', details: 'icom for gov-app-1', user: 'platform-admin', type: 'info' },
    { time: '10:38:45', action: 'Session démarrée', details: 'Platform Admin', user: 'platform-admin', type: 'info' },
    { time: '10:35:00', action: 'Alerte sécurité', details: 'Tentative de connexion suspecte', user: 'system', type: 'warning' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="glass">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className={cn("w-4 h-4", stat.color)} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass hover:border-primary/50 transition-colors cursor-pointer">
          <CardHeader>
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center mb-2">
              <AppWindow className="w-5 h-5 text-primary" />
            </div>
            <CardTitle className="text-base">Nouvelle Application</CardTitle>
            <CardDescription>Enregistrer une nouvelle app cliente</CardDescription>
          </CardHeader>
        </Card>
        
        <Card className="glass hover:border-blue-500/50 transition-colors cursor-pointer">
          <CardHeader>
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center mb-2">
              <Network className="w-5 h-5 text-blue-500" />
            </div>
            <CardTitle className="text-base">Nouveau Réseau</CardTitle>
            <CardDescription>Créer un réseau gouvernemental ou commercial</CardDescription>
          </CardHeader>
        </Card>
        
        <Card className="glass hover:border-emerald-500/50 transition-colors cursor-pointer">
          <CardHeader>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-2">
              <Building className="w-5 h-5 text-emerald-500" />
            </div>
            <CardTitle className="text-base">Nouveau Tenant</CardTitle>
            <CardDescription>Ajouter une organisation partenaire</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Activité Récente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.map((log, i) => (
              <div key={i} className="flex items-center gap-4 text-sm py-2 border-b border-border last:border-0">
                <span className="text-muted-foreground font-mono text-xs w-16">{log.time}</span>
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  log.type === 'success' && "bg-success",
                  log.type === 'warning' && "bg-warning",
                  log.type === 'info' && "bg-primary"
                )} />
                <span className="text-foreground flex-1">{log.action}</span>
                <span className="text-muted-foreground font-mono text-xs hidden md:block">{log.details}</span>
                <span className="text-primary text-xs">{log.user}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Apps List Component
function AppsList() {
  const { t } = useTranslation();
  const { apps } = useDemo();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredApps = apps.filter(app => 
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.app_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une application..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Nouvelle Application
        </Button>
      </div>

      <div className="grid gap-4">
        {filteredApps.map((app) => (
          <Card key={app.app_id} className="glass">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                    <AppWindow className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{app.name}</h3>
                    <p className="text-sm text-muted-foreground font-mono">{app.app_id}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right hidden md:block">
                    <p className="text-sm text-muted-foreground">Tenant</p>
                    <p className="text-sm font-mono">{app.tenant_id}</p>
                  </div>
                  
                  <Badge variant={app.status === 'active' ? 'default' : 'secondary'}>
                    {app.status === 'active' ? (
                      <><CheckCircle className="w-3 h-3 mr-1" /> Actif</>
                    ) : (
                      <><XCircle className="w-3 h-3 mr-1" /> Inactif</>
                    )}
                  </Badge>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem><Eye className="w-4 h-4 mr-2" /> Voir détails</DropdownMenuItem>
                      <DropdownMenuItem><Edit className="w-4 h-4 mr-2" /> Modifier</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive"><Trash2 className="w-4 h-4 mr-2" /> Supprimer</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              <div className="mt-4 flex flex-wrap gap-2">
                {Object.entries(app.enabled_modules).map(([module, enabled]) => (
                  <Badge 
                    key={module}
                    variant="outline"
                    className={cn(
                      enabled ? "border-success/30 text-success" : "border-muted text-muted-foreground"
                    )}
                  >
                    {enabled ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                    {module}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Networks List Component
function NetworksList() {
  const { t } = useTranslation();
  const { networks } = useDemo();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Réseaux Configurés</h2>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Nouveau Réseau
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {networks.map((network) => (
          <Card key={network.network_id} className="glass">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  network.network_type === 'government' ? "bg-primary/20" : "bg-amber-500/20"
                )}>
                  <Network className={cn(
                    "w-5 h-5",
                    network.network_type === 'government' ? "text-primary" : "text-amber-400"
                  )} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{network.name}</h3>
                  <p className="text-xs text-muted-foreground font-mono">{network.network_id}</p>
                </div>
                <Badge variant={network.network_type === 'government' ? 'default' : 'secondary'}>
                  {network.network_type === 'government' ? 'Gouvernement' : 'Commercial'}
                </Badge>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Applications membres</span>
                  <span className="font-medium">{network.member_apps.length}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {network.member_apps.slice(0, 3).map((appId) => (
                    <Badge key={appId} variant="outline" className="text-xs font-mono">
                      {appId}
                    </Badge>
                  ))}
                  {network.member_apps.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{network.member_apps.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Modules Config Component
function ModulesConfig() {
  const modules = [
    { 
      name: 'iCom', 
      description: 'Communication en temps réel (Chat, Appels, Réunions, Contacts)',
      status: 'active',
      features: ['iChat', 'iAppel', 'iRéunion', 'iContact'],
      restrictions: null
    },
    { 
      name: 'iBoîte', 
      description: 'Messagerie interne asynchrone',
      status: 'active',
      features: ['Threads', 'Pièces jointes', 'Archives'],
      restrictions: null
    },
    { 
      name: 'iAsted', 
      description: 'Assistant IA contextuel',
      status: 'active',
      features: ['Chat IA', 'Résumés', 'Suggestions'],
      restrictions: null
    },
    { 
      name: 'iCorrespondance', 
      description: 'Gestion documentaire officielle',
      status: 'active',
      features: ['Dossiers', 'Signatures', 'Annotations'],
      restrictions: 'Réseau gouvernemental uniquement'
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Configuration des Modules</h2>

      <div className="grid gap-4">
        {modules.map((module) => (
          <Card key={module.name} className="glass">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Layers className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{module.name}</h3>
                    <p className="text-sm text-muted-foreground">{module.description}</p>
                    
                    <div className="flex flex-wrap gap-1 mt-2">
                      {module.features.map((feature) => (
                        <Badge key={feature} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                <Badge variant="default" className="bg-success">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Actif
                </Badge>
              </div>
              
              {module.restrictions && (
                <div className="mt-4 p-3 rounded-lg bg-warning/10 border border-warning/20">
                  <div className="flex items-center gap-2 text-sm text-warning">
                    <AlertTriangle className="w-4 h-4" />
                    {module.restrictions}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Audit Log Component
function AuditLog() {
  const logs = [
    { time: '2024-01-24 10:42:15', action: 'Application enregistrée', details: 'gov-app-1', user: 'platform-admin', ip: '192.168.1.1' },
    { time: '2024-01-24 10:41:30', action: 'Réseau créé', details: 'gov-net-1', user: 'platform-admin', ip: '192.168.1.1' },
    { time: '2024-01-24 10:40:12', action: 'Module activé', details: 'icom for gov-app-1', user: 'platform-admin', ip: '192.168.1.1' },
    { time: '2024-01-24 10:38:45', action: 'Session démarrée', details: 'Platform Admin Login', user: 'platform-admin', ip: '192.168.1.1' },
    { time: '2024-01-24 09:15:00', action: 'Configuration modifiée', details: 'Network policy updated', user: 'platform-admin', ip: '192.168.1.1' },
    { time: '2024-01-23 18:30:22', action: 'Tenant créé', details: 'ministry-1', user: 'platform-admin', ip: '192.168.1.1' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Journal d'Audit</h2>
        <Button variant="outline" className="gap-2">
          <FileText className="w-4 h-4" />
          Exporter
        </Button>
      </div>

      <Card className="glass">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Horodatage</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Action</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Détails</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Utilisateur</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">IP</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, i) => (
                  <tr key={i} className="border-b border-border/50 last:border-0">
                    <td className="py-3 px-4 text-sm font-mono text-muted-foreground">{log.time}</td>
                    <td className="py-3 px-4 text-sm text-foreground">{log.action}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground font-mono">{log.details}</td>
                    <td className="py-3 px-4 text-sm text-primary">{log.user}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground font-mono">{log.ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Placeholder Components for other routes
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center h-[400px]">
      <div className="text-center">
        <Settings className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground mt-2">Cette section est en cours de développement</p>
      </div>
    </div>
  );
}

// Main Dashboard Component with Routing
export default function PlatformAdminDashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isPlatformAdmin } = useAuth();
  
  // Redirect if not platform admin
  if (!isPlatformAdmin) {
    navigate('/forbidden');
    return null;
  }
  
  return (
    <AdminLayout 
      adminType="platform" 
      title={t('dashboard.platformAdmin.title')}
      subtitle={t('dashboard.platformAdmin.subtitle')}
    >
      <Routes>
        <Route index element={<DashboardOverview />} />
        <Route path="apps" element={<AppsList />} />
        <Route path="networks" element={<NetworksList />} />
        <Route path="modules" element={<ModulesConfig />} />
        <Route path="audit" element={<AuditLog />} />
        <Route path="tenants" element={<PlaceholderPage title="Gestion des Tenants" />} />
        <Route path="users" element={<PlaceholderPage title="Gestion des Utilisateurs" />} />
        <Route path="security" element={<PlaceholderPage title="Sécurité" />} />
        <Route path="logs" element={<PlaceholderPage title="Logs Système" />} />
        <Route path="settings" element={<PlaceholderPage title="Paramètres" />} />
        <Route path="*" element={<Navigate to="/admin/platform" replace />} />
      </Routes>
    </AdminLayout>
  );
}
