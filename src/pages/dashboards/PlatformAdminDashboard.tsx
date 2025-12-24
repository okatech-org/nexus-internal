import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Crown, AppWindow, Network, Layers, 
  Activity, Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useDemo } from '@/contexts/DemoContext';
import { UserMenu } from '@/components/layout/UserMenu';
import { cn } from '@/lib/utils';

export default function PlatformAdminDashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isPlatformAdmin } = useAuth();
  const { apps, networks } = useDemo();
  const [activeTab, setActiveTab] = useState('apps');
  
  // Redirect if not platform admin
  if (!isPlatformAdmin) {
    navigate('/forbidden');
    return null;
  }
  
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
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">{t('dashboard.platformAdmin.title')}</h1>
                  <p className="text-xs text-muted-foreground">{t('dashboard.platformAdmin.subtitle')}</p>
                </div>
              </div>
            </div>
            
            <UserMenu />
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="apps" className="gap-2">
              <AppWindow className="w-4 h-4" />
              {t('dashboard.platformAdmin.appsRegistry')}
            </TabsTrigger>
            <TabsTrigger value="networks" className="gap-2">
              <Network className="w-4 h-4" />
              {t('dashboard.platformAdmin.networks')}
            </TabsTrigger>
            <TabsTrigger value="modules" className="gap-2">
              <Layers className="w-4 h-4" />
              {t('dashboard.platformAdmin.modules')}
            </TabsTrigger>
            <TabsTrigger value="audit" className="gap-2">
              <Activity className="w-4 h-4" />
              {t('dashboard.platformAdmin.audit')}
            </TabsTrigger>
          </TabsList>
          
          {/* Apps Registry */}
          <TabsContent value="apps">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">{t('dashboard.platformAdmin.registeredApps')}</h2>
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  {t('dashboard.platformAdmin.newApp')}
                </Button>
              </div>
              
              <div className="grid gap-4">
                {apps.map((app) => (
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
                      
                      <div className="flex items-center gap-4">
                        <Badge variant={app.status === 'active' ? 'default' : 'secondary'}>
                          {app.status === 'active' ? t('common.active') : t('common.disabled')}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{app.tenant_id}</span>
                      </div>
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
                ))}
              </div>
            </motion.div>
          </TabsContent>
          
          {/* Networks */}
          <TabsContent value="networks">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">{t('dashboard.platformAdmin.networks')}</h2>
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  {t('dashboard.platformAdmin.newNetwork')}
                </Button>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                {networks.map((network) => (
                  <div key={network.network_id} className="glass rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        network.network_type === 'government' ? "bg-blue-500/20" : "bg-amber-500/20"
                      )}>
                        <Network className={cn(
                          "w-5 h-5",
                          network.network_type === 'government' ? "text-blue-400" : "text-amber-400"
                        )} />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">{network.name}</h3>
                        <p className="text-xs text-muted-foreground font-mono">{network.network_id}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm mb-3">
                      <span className="text-muted-foreground">Type</span>
                      <Badge variant="outline">{t(`networkTypes.${network.network_type}`)}</Badge>
                    </div>
                    
                    <div className="text-sm mb-2">
                      <span className="text-muted-foreground">{t('dashboard.platformAdmin.memberApps')}:</span>
                      <span className="ml-2 text-foreground">{network.member_apps.length}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {network.member_apps.map((appId) => (
                        <span key={appId} className="px-2 py-0.5 rounded bg-secondary text-xs font-mono">
                          {appId}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </TabsContent>
          
          {/* Modules */}
          <TabsContent value="modules">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-lg font-semibold mb-6">{t('dashboard.platformAdmin.modulesConfig')}</h2>
              
              <div className="grid gap-4 md:grid-cols-2">
                {['icom', 'iboite', 'iasted', 'icorrespondance'].map((module) => (
                  <div key={module} className="glass rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-foreground capitalize">{module}</h3>
                      <Badge variant="default">{t('common.active')}</Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-4">
                      {module === 'icorrespondance' 
                        ? t('dashboard.platformAdmin.govOnly')
                        : t('dashboard.platformAdmin.availableForAll')}
                    </p>
                    
                    {module === 'icorrespondance' && (
                      <div className="p-2 rounded bg-warning/10 text-warning text-xs">
                        ⚠️ {t('dashboard.platformAdmin.restrictedToGov')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </TabsContent>
          
          {/* Audit */}
          <TabsContent value="audit">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-lg font-semibold mb-6">{t('dashboard.platformAdmin.auditLog')}</h2>
              
              <div className="glass rounded-xl p-4">
                <div className="space-y-3">
                  {[
                    { time: '10:42:15', action: t('audit.appRegistered'), details: 'gov-app-1', user: 'platform-admin' },
                    { time: '10:41:30', action: t('audit.networkCreated'), details: 'gov-net-1', user: 'platform-admin' },
                    { time: '10:40:12', action: t('audit.moduleEnabled'), details: 'icom for gov-app-1', user: 'platform-admin' },
                    { time: '10:38:45', action: t('audit.sessionStarted'), details: 'Platform Admin', user: 'platform-admin' },
                  ].map((log, i) => (
                    <div key={i} className="flex items-center gap-4 text-sm py-2 border-b border-border last:border-0">
                      <span className="text-muted-foreground font-mono text-xs w-20">{log.time}</span>
                      <span className="text-foreground flex-1">{log.action}</span>
                      <span className="text-muted-foreground font-mono text-xs">{log.details}</span>
                      <span className="text-primary text-xs">{log.user}</span>
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
