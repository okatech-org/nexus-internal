import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Building, AppWindow, Settings, Activity, 
  Users, Shield, LogOut, ChevronDown, ToggleLeft, ToggleRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useDemo } from '@/contexts/DemoContext';
import { cn } from '@/lib/utils';

export default function TenantAdminDashboard() {
  const navigate = useNavigate();
  const { payload, logout, isTenantAdmin } = useAuth();
  const { apps, networks } = useDemo();
  const [activeTab, setActiveTab] = useState('apps');
  
  // Filter apps for current tenant
  const tenantApps = apps.filter(app => app.tenant_id === payload?.tenant_id);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Building className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Tenant Admin</h1>
                  <p className="text-xs text-muted-foreground">{payload?.tenant_id}</p>
                </div>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Shield className="w-4 h-4" />
                  {payload?.sub}
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-xs text-muted-foreground">
                  Tenant: {payload?.tenant_id}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/demo-accounts')}>
                  <Users className="w-4 h-4 mr-2" />
                  Changer de compte
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="apps" className="gap-2">
              <AppWindow className="w-4 h-4" />
              Mes Applications
            </TabsTrigger>
            <TabsTrigger value="modules" className="gap-2">
              <Settings className="w-4 h-4" />
              Modules
            </TabsTrigger>
            <TabsTrigger value="audit" className="gap-2">
              <Activity className="w-4 h-4" />
              Activité
            </TabsTrigger>
          </TabsList>
          
          {/* Apps */}
          <TabsContent value="apps">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-lg font-semibold mb-6">Applications du tenant</h2>
              
              <div className="grid gap-4">
                {tenantApps.length > 0 ? tenantApps.map((app) => (
                  <div key={app.app_id} className="glass rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                          <AppWindow className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">{app.name}</h3>
                          <p className="text-xs text-muted-foreground font-mono">{app.app_id}</p>
                        </div>
                      </div>
                      
                      <Badge variant={app.status === 'active' ? 'default' : 'secondary'}>
                        {app.status}
                      </Badge>
                    </div>
                    
                    <div className="mt-4 flex gap-2">
                      {Object.entries(app.enabled_modules).map(([module, enabled]) => (
                        <span 
                          key={module}
                          className={cn(
                            "px-2 py-0.5 rounded text-xs",
                            enabled ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"
                          )}
                        >
                          {module}
                        </span>
                      ))}
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-12 text-muted-foreground">
                    Aucune application pour ce tenant
                  </div>
                )}
              </div>
            </motion.div>
          </TabsContent>
          
          {/* Modules */}
          <TabsContent value="modules">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-lg font-semibold mb-6">Configuration des modules</h2>
              
              <div className="glass rounded-xl p-6 space-y-4">
                {['icom', 'iboite', 'iasted', 'icorrespondance'].map((module) => (
                  <div key={module} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div>
                      <h4 className="font-medium text-foreground capitalize">{module}</h4>
                      <p className="text-xs text-muted-foreground">
                        {module === 'icorrespondance' ? 'Courrier administratif' : 'Communication standard'}
                      </p>
                    </div>
                    <Switch defaultChecked={module !== 'icorrespondance'} />
                  </div>
                ))}
              </div>
            </motion.div>
          </TabsContent>
          
          {/* Audit */}
          <TabsContent value="audit">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-lg font-semibold mb-6">Activité récente</h2>
              
              <div className="glass rounded-xl p-4">
                <div className="space-y-3">
                  {[
                    { time: '10:42:15', action: 'Module activé', details: 'iAsted', app: 'gov-app-1' },
                    { time: '10:41:30', action: 'Message envoyé', details: 'iCom', app: 'gov-app-1' },
                    { time: '10:40:12', action: 'Thread créé', details: 'iBoîte', app: 'gov-app-1' },
                  ].map((log, i) => (
                    <div key={i} className="flex items-center gap-4 text-sm py-2 border-b border-border last:border-0">
                      <span className="text-muted-foreground font-mono text-xs w-20">{log.time}</span>
                      <span className="text-foreground flex-1">{log.action}</span>
                      <span className="text-muted-foreground">{log.details}</span>
                      <span className="text-primary text-xs font-mono">{log.app}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
