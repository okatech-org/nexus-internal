import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Network, AppWindow, Server, CheckCircle, XCircle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useComms } from '@/contexts/CommsContext';
import { cn } from '@/lib/utils';

interface NetworkTopologyProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NetworkTopology({ isOpen, onClose }: NetworkTopologyProps) {
  const { apps, networks, currentApp } = useComms();
  
  const networkData = useMemo(() => {
    return networks.map(network => ({
      ...network,
      apps: apps.filter(app => app.network_id === network.network_id),
    }));
  }, [apps, networks]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/90 backdrop-blur-md z-40"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-8 z-50 glass-strong rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl gradient-neural flex items-center justify-center">
                    <Network className="w-6 h-6 text-foreground" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">Network Topology</h2>
                    <p className="text-sm text-muted-foreground">
                      Vue des applications, réseaux et modules
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
            
            {/* Topology View */}
            <div className="flex-1 overflow-auto p-6">
              <div className="min-h-full">
                {/* Central Platform */}
                <div className="flex justify-center mb-8">
                  <div className="flex flex-col items-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1, type: 'spring' }}
                      className="w-24 h-24 rounded-2xl gradient-primary flex items-center justify-center shadow-lg"
                    >
                      <Server className="w-10 h-10 text-foreground" />
                    </motion.div>
                    <p className="mt-3 font-semibold text-foreground">NDJOBI Platform</p>
                    <p className="text-xs text-muted-foreground">okatech-comms v1.0</p>
                  </div>
                </div>
                
                {/* Connection Lines */}
                <div className="flex justify-center mb-4">
                  <div className="w-0.5 h-8 bg-gradient-to-b from-primary to-border" />
                </div>
                
                {/* Networks */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {networkData.map((network, networkIndex) => (
                    <motion.div
                      key={network.network_id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + networkIndex * 0.1 }}
                      className={cn(
                        "p-6 rounded-2xl border-2",
                        network.network_type === 'government'
                          ? "border-primary/30 bg-primary/5"
                          : "border-iboite/30 bg-iboite/5"
                      )}
                    >
                      {/* Network Header */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center",
                          network.network_type === 'government'
                            ? "bg-primary/20"
                            : "bg-iboite/20"
                        )}>
                          <Network className={cn(
                            "w-6 h-6",
                            network.network_type === 'government' ? "text-primary" : "text-iboite"
                          )} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{network.name}</h3>
                          <span className={cn(
                            "text-xs px-2 py-0.5 rounded",
                            network.network_type === 'government'
                              ? "bg-primary/20 text-primary"
                              : "bg-iboite/20 text-iboite"
                          )}>
                            {network.network_type}
                          </span>
                        </div>
                      </div>
                      
                      {/* Module Policy */}
                      <div className="mb-4 p-3 rounded-lg bg-background/50">
                        <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          Module Policy
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(network.modules_policy).map(([module, enabled]) => (
                            <div
                              key={module}
                              className={cn(
                                "flex items-center gap-1.5 text-xs px-2 py-1 rounded",
                                enabled ? "bg-success/10 text-success" : "bg-secondary text-muted-foreground"
                              )}
                            >
                              {enabled ? (
                                <CheckCircle className="w-3 h-3" />
                              ) : (
                                <XCircle className="w-3 h-3" />
                              )}
                              {module}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Apps */}
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground mb-2">
                          Applications ({network.apps.length})
                        </p>
                        {network.apps.map((app, appIndex) => (
                          <motion.div
                            key={app.app_id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + networkIndex * 0.1 + appIndex * 0.05 }}
                            className={cn(
                              "p-3 rounded-lg border transition-all",
                              currentApp?.app_id === app.app_id
                                ? "border-primary bg-primary/10"
                                : "border-border bg-background/30 hover:bg-background/50"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center",
                                currentApp?.app_id === app.app_id
                                  ? "bg-primary/20"
                                  : "bg-secondary"
                              )}>
                                <AppWindow className={cn(
                                  "w-4 h-4",
                                  currentApp?.app_id === app.app_id
                                    ? "text-primary"
                                    : "text-muted-foreground"
                                )} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">
                                  {app.name}
                                </p>
                                <p className="text-xs text-muted-foreground font-mono">
                                  {app.app_id}
                                </p>
                              </div>
                              {currentApp?.app_id === app.app_id && (
                                <span className="text-xs px-2 py-0.5 rounded bg-primary/20 text-primary">
                                  Current
                                </span>
                              )}
                            </div>
                            
                            {/* App Modules */}
                            <div className="mt-2 flex flex-wrap gap-1">
                              {Object.entries(app.enabled_modules).map(([module, enabled]) => {
                                const policyEnabled = network.modules_policy[module as keyof typeof network.modules_policy];
                                const effectiveEnabled = enabled && policyEnabled;
                                
                                return (
                                  <span
                                    key={module}
                                    className={cn(
                                      "text-xs px-1.5 py-0.5 rounded",
                                      effectiveEnabled
                                        ? "bg-success/10 text-success"
                                        : !enabled
                                        ? "bg-secondary/50 text-muted-foreground line-through"
                                        : "bg-warning/10 text-warning"
                                    )}
                                    title={
                                      !enabled ? 'Disabled by app' :
                                      !policyEnabled ? 'Blocked by network policy' :
                                      'Enabled'
                                    }
                                  >
                                    {module}
                                  </span>
                                );
                              })}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                {/* Legend */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-8 p-4 rounded-xl bg-secondary/30 flex flex-wrap items-center justify-center gap-6"
                >
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-3 h-3 rounded bg-success" />
                    <span className="text-muted-foreground">Module activé</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-3 h-3 rounded bg-warning" />
                    <span className="text-muted-foreground">Bloqué par policy réseau</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-3 h-3 rounded bg-muted" />
                    <span className="text-muted-foreground">Désactivé par l'app</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-3 h-3 rounded bg-primary" />
                    <span className="text-muted-foreground">Application active</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
