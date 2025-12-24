import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building, 
  X, 
  AppWindow, 
  Layers,
  Check,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useDemo } from '@/contexts/DemoContext';
import { ModuleName } from '@/types/comms';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface TenantAdminConsoleProps {
  isOpen: boolean;
  onClose: () => void;
}

const moduleLabels: Record<ModuleName, string> = {
  icom: 'iCom (Chat)',
  iboite: 'iBoîte (Inbox)',
  iasted: 'iAsted (AI)',
  icorrespondance: 'iCorrespondance',
};

export function TenantAdminConsole({ isOpen, onClose }: TenantAdminConsoleProps) {
  const { apps, activeProfile, updateAppModules, isTenantAdmin } = useDemo();
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  
  if (!isTenantAdmin || !activeProfile) return null;
  
  // Filter apps by tenant
  const tenantApps = apps.filter(a => a.tenant_id === activeProfile.tenant_id);
  const selectedApp = apps.find(a => a.app_id === selectedAppId);
  
  const handleToggleAppModule = (appId: string, module: ModuleName, enabled: boolean) => {
    updateAppModules(appId, { [module]: enabled });
    toast.success(`${moduleLabels[module]} ${enabled ? 'enabled' : 'disabled'} for app`);
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-16 z-50 glass-strong rounded-2xl shadow-2xl overflow-hidden flex flex-col max-w-4xl mx-auto"
          >
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Building className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Tenant Admin Console</h2>
                  <p className="text-xs text-muted-foreground">
                    Managing: <span className="font-mono">{activeProfile.tenant_id}</span>
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon-sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-hidden flex">
              {/* App List */}
              <div className="w-72 border-r border-border overflow-y-auto p-4 space-y-2">
                <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                  <AppWindow className="w-4 h-4" />
                  Tenant Apps ({tenantApps.length})
                </h3>
                
                {tenantApps.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No apps in this tenant</p>
                ) : (
                  tenantApps.map(app => (
                    <button
                      key={app.app_id}
                      onClick={() => setSelectedAppId(app.app_id)}
                      className={cn(
                        "w-full p-3 rounded-lg text-left transition-colors",
                        selectedAppId === app.app_id
                          ? "bg-primary/20 border border-primary/30"
                          : "bg-secondary/30 hover:bg-secondary/50"
                      )}
                    >
                      <div className="font-medium text-sm text-foreground">{app.name}</div>
                      <div className="text-xs text-muted-foreground font-mono mt-0.5">{app.app_id}</div>
                      <div className="flex gap-1 mt-2">
                        <span className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded",
                          app.status === 'active' ? "bg-success/20 text-success" : "bg-warning/20 text-warning"
                        )}>
                          {app.status}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
              
              {/* App Details */}
              <div className="flex-1 overflow-y-auto p-6">
                {selectedApp ? (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{selectedApp.name}</h3>
                      <p className="text-sm text-muted-foreground font-mono">{selectedApp.app_id}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg bg-secondary/30">
                        <div className="text-xs text-muted-foreground">Network</div>
                        <div className="text-sm font-mono text-foreground">{selectedApp.network_id}</div>
                      </div>
                      <div className="p-3 rounded-lg bg-secondary/30">
                        <div className="text-xs text-muted-foreground">Status</div>
                        <div className={cn(
                          "text-sm font-medium",
                          selectedApp.status === 'active' ? "text-success" : "text-warning"
                        )}>
                          {selectedApp.status}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                        <Layers className="w-4 h-4" />
                        Module Configuration
                      </h4>
                      <div className="space-y-2">
                        {(Object.entries(selectedApp.enabled_modules) as [ModuleName, boolean][]).map(([mod, enabled]) => (
                          <div 
                            key={mod}
                            className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                          >
                            <div>
                              <span className="text-sm text-foreground">{moduleLabels[mod]}</span>
                              {mod === 'icorrespondance' && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  Requires government network & realm
                                </p>
                              )}
                            </div>
                            <Switch
                              checked={enabled}
                              onCheckedChange={(checked) => handleToggleAppModule(selectedApp.app_id, mod, checked)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
                    <Eye className="w-12 h-12 opacity-30" />
                    <p>Select an app to configure modules</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
