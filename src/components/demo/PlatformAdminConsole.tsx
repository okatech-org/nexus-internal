import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Crown, 
  X, 
  AppWindow, 
  Network, 
  Layers,
  Check,
  Plus,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useDemo } from '@/contexts/DemoContext';
import { ModuleName } from '@/types/comms';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface PlatformAdminConsoleProps {
  isOpen: boolean;
  onClose: () => void;
}

const moduleLabels: Record<ModuleName, string> = {
  icom: 'iCom (Chat)',
  iboite: 'iBoîte (Inbox)',
  iasted: 'iAsted (AI)',
  icorrespondance: 'iCorrespondance',
};

export function PlatformAdminConsole({ isOpen, onClose }: PlatformAdminConsoleProps) {
  const { apps, networks, updateAppModules, updateNetworkPolicy, addAppToNetwork, isPlatformAdmin } = useDemo();
  const [activeTab, setActiveTab] = useState<'apps' | 'networks'>('apps');
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [selectedNetworkId, setSelectedNetworkId] = useState<string | null>(null);
  
  if (!isPlatformAdmin) return null;
  
  const selectedApp = apps.find(a => a.app_id === selectedAppId);
  const selectedNetwork = networks.find(n => n.network_id === selectedNetworkId);
  
  const handleToggleAppModule = (appId: string, module: ModuleName, enabled: boolean) => {
    updateAppModules(appId, { [module]: enabled });
    toast.success(`${moduleLabels[module]} ${enabled ? 'enabled' : 'disabled'} for app`);
  };
  
  const handleToggleNetworkPolicy = (networkId: string, module: ModuleName, enabled: boolean) => {
    updateNetworkPolicy(networkId, { [module]: enabled });
    toast.success(`${moduleLabels[module]} ${enabled ? 'allowed' : 'blocked'} in network policy`);
  };
  
  const handleAddAppToNetwork = (appId: string, networkId: string) => {
    addAppToNetwork(appId, networkId);
    toast.success('App added to network');
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
            className="fixed inset-12 z-50 glass-strong rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Platform Admin Console</h2>
                  <p className="text-xs text-muted-foreground">Okatech - Full Platform Access</p>
                </div>
              </div>
              <Button variant="ghost" size="icon-sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Tabs */}
            <div className="flex gap-1 p-4 border-b border-border">
              <button
                onClick={() => setActiveTab('apps')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  activeTab === 'apps' 
                    ? "bg-primary/20 text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <AppWindow className="w-4 h-4" />
                Apps Management
              </button>
              <button
                onClick={() => setActiveTab('networks')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  activeTab === 'networks' 
                    ? "bg-primary/20 text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Network className="w-4 h-4" />
                Networks Management
              </button>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-hidden flex">
              {activeTab === 'apps' && (
                <>
                  {/* App List */}
                  <div className="w-80 border-r border-border overflow-y-auto p-4 space-y-2">
                    <h3 className="text-sm font-medium text-foreground mb-3">Registered Apps</h3>
                    {apps.map(app => (
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
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                            {app.tenant_id}
                          </span>
                          <span className={cn(
                            "text-[10px] px-1.5 py-0.5 rounded",
                            app.status === 'active' ? "bg-success/20 text-success" : "bg-warning/20 text-warning"
                          )}>
                            {app.status}
                          </span>
                        </div>
                      </button>
                    ))}
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
                            <div className="text-xs text-muted-foreground">Tenant</div>
                            <div className="text-sm font-mono text-foreground">{selectedApp.tenant_id}</div>
                          </div>
                          <div className="p-3 rounded-lg bg-secondary/30">
                            <div className="text-xs text-muted-foreground">Network</div>
                            <div className="text-sm font-mono text-foreground">{selectedApp.network_id}</div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                            <Layers className="w-4 h-4" />
                            Enabled Modules
                          </h4>
                          <div className="space-y-2">
                            {(Object.entries(selectedApp.enabled_modules) as [ModuleName, boolean][]).map(([mod, enabled]) => (
                              <div 
                                key={mod}
                                className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                              >
                                <span className="text-sm text-foreground">{moduleLabels[mod]}</span>
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
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        Select an app to manage
                      </div>
                    )}
                  </div>
                </>
              )}
              
              {activeTab === 'networks' && (
                <>
                  {/* Network List */}
                  <div className="w-80 border-r border-border overflow-y-auto p-4 space-y-2">
                    <h3 className="text-sm font-medium text-foreground mb-3">Networks</h3>
                    {networks.map(network => (
                      <button
                        key={network.network_id}
                        onClick={() => setSelectedNetworkId(network.network_id)}
                        className={cn(
                          "w-full p-3 rounded-lg text-left transition-colors",
                          selectedNetworkId === network.network_id
                            ? "bg-primary/20 border border-primary/30"
                            : "bg-secondary/30 hover:bg-secondary/50"
                        )}
                      >
                        <div className="font-medium text-sm text-foreground">{network.name}</div>
                        <div className="text-xs text-muted-foreground font-mono mt-0.5">{network.network_id}</div>
                        <div className="flex gap-1 mt-2">
                          <span className={cn(
                            "text-[10px] px-1.5 py-0.5 rounded",
                            network.network_type === 'government' 
                              ? "bg-blue-500/20 text-blue-400" 
                              : "bg-amber-500/20 text-amber-400"
                          )}>
                            {network.network_type}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                            {network.member_apps.length} apps
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  {/* Network Details */}
                  <div className="flex-1 overflow-y-auto p-6">
                    {selectedNetwork ? (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">{selectedNetwork.name}</h3>
                          <p className="text-sm text-muted-foreground font-mono">{selectedNetwork.network_id}</p>
                        </div>
                        
                        <div className="p-3 rounded-lg bg-secondary/30">
                          <div className="text-xs text-muted-foreground">Network Type</div>
                          <div className={cn(
                            "text-sm font-medium mt-1",
                            selectedNetwork.network_type === 'government' ? "text-blue-400" : "text-amber-400"
                          )}>
                            {selectedNetwork.network_type}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                            <Settings className="w-4 h-4" />
                            Modules Policy
                          </h4>
                          <div className="space-y-2">
                            {(Object.entries(selectedNetwork.modules_policy) as [ModuleName, boolean][]).map(([mod, allowed]) => (
                              <div 
                                key={mod}
                                className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                              >
                                <span className="text-sm text-foreground">{moduleLabels[mod]}</span>
                                <Switch
                                  checked={allowed}
                                  onCheckedChange={(checked) => handleToggleNetworkPolicy(selectedNetwork.network_id, mod, checked)}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                            <AppWindow className="w-4 h-4" />
                            Member Apps
                          </h4>
                          <div className="space-y-2">
                            {selectedNetwork.member_apps.map(appId => {
                              const app = apps.find(a => a.app_id === appId);
                              return (
                                <div key={appId} className="p-2 rounded-lg bg-secondary/30 flex items-center justify-between">
                                  <span className="text-sm font-mono text-foreground">{appId}</span>
                                  {app && (
                                    <span className="text-xs text-muted-foreground">{app.name}</span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          
                          {/* Add App to Network */}
                          <div className="mt-4">
                            <select
                              className="w-full bg-secondary/50 rounded-lg px-3 py-2 text-sm text-foreground"
                              onChange={(e) => {
                                if (e.target.value) {
                                  handleAddAppToNetwork(e.target.value, selectedNetwork.network_id);
                                  e.target.value = '';
                                }
                              }}
                              defaultValue=""
                            >
                              <option value="" disabled>Add app to network...</option>
                              {apps
                                .filter(a => !selectedNetwork.member_apps.includes(a.app_id))
                                .map(app => (
                                  <option key={app.app_id} value={app.app_id}>
                                    {app.name} ({app.app_id})
                                  </option>
                                ))
                              }
                            </select>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        Select a network to manage
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
