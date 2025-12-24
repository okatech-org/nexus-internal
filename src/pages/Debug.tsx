import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Server, 
  Shield, 
  Layers, 
  RefreshCw,
  Network,
  AppWindow,
  User,
  Bot,
  AlertTriangle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useComms } from '@/contexts/CommsContext';
import { cn } from '@/lib/utils';

export default function Debug() {
  const { 
    capabilities, 
    appContext, 
    apps, 
    networks,
    currentApp,
    currentNetwork,
    setCurrentApp,
    setIdentityMode,
    setDelegatedActor,
    bootstrap, 
    isLoading 
  } = useComms();
  
  const [delegatedActorInput, setDelegatedActorInput] = useState(appContext.delegated_actor_id || '');
  const [delegatedRealmInput, setDelegatedRealmInput] = useState<'citizen' | 'government' | 'business'>(
    appContext.delegated_realm || 'citizen'
  );
  
  useEffect(() => {
    if (!capabilities) {
      bootstrap();
    }
  }, [capabilities, bootstrap]);
  
  useEffect(() => {
    setDelegatedActorInput(appContext.delegated_actor_id || '');
    setDelegatedRealmInput(appContext.delegated_realm || 'citizen');
  }, [appContext]);
  
  const modules = capabilities?.modules;
  
  const handleApplyDelegated = () => {
    if (delegatedActorInput.trim()) {
      setDelegatedActor(delegatedActorInput.trim(), delegatedRealmInput);
    }
  };
  
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Debug Console</h1>
              <p className="text-sm text-muted-foreground">
                App Simulation & Capabilities Viewer
              </p>
            </div>
          </div>
          
          <Button
            variant="outline"
            onClick={bootstrap}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        
        {/* App-Centric Notice */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl bg-primary/10 border border-primary/20"
        >
          <div className="flex items-start gap-3">
            <AppWindow className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-medium text-foreground">Architecture App-Centric</h3>
              <p className="text-sm text-muted-foreground mt-1">
                NDJOBI est une plateforme pour <strong>applications</strong>, pas pour des utilisateurs finaux. 
                Les particuliers accèdent via des apps clientes (ex: idn.ga). 
                Aucun compte utilisateur n'est créé directement dans la plateforme.
              </p>
            </div>
          </div>
        </motion.div>
        
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Client App Simulation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <AppWindow className="w-5 h-5 text-foreground" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Client App Simulation</h2>
            </div>
            
            <div className="space-y-4">
              {/* App Selector */}
              <div>
                <label className="text-sm text-muted-foreground block mb-2">Application (X-App-Id)</label>
                <select
                  value={appContext.app_id}
                  onChange={(e) => setCurrentApp(e.target.value)}
                  className="w-full bg-secondary/50 rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  {apps.map(app => (
                    <option key={app.app_id} value={app.app_id}>
                      {app.name} ({app.app_id})
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Current App Info */}
              {currentApp && (
                <div className="p-3 rounded-lg bg-secondary/30 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Tenant</span>
                    <span className="text-xs font-mono text-foreground">{currentApp.tenant_id}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Status</span>
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded",
                      currentApp.status === 'active' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'
                    )}>
                      {currentApp.status}
                    </span>
                  </div>
                </div>
              )}
              
              {/* Network Info */}
              {currentNetwork && (
                <div className="p-3 rounded-lg bg-secondary/30 border-l-4 border-l-primary">
                  <div className="flex items-center gap-2 mb-2">
                    <Network className="w-4 h-4 text-primary" />
                    <span className="font-medium text-foreground text-sm">{currentNetwork.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Network Type</span>
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded font-medium",
                      currentNetwork.network_type === 'government' 
                        ? 'bg-primary/20 text-primary' 
                        : 'bg-iboite/20 text-iboite'
                    )}>
                      {currentNetwork.network_type}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
          
          {/* Identity Mode */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-icom/20 flex items-center justify-center">
                {appContext.mode === 'service' ? (
                  <Bot className="w-5 h-5 text-icom" />
                ) : (
                  <User className="w-5 h-5 text-icom" />
                )}
              </div>
              <h2 className="text-lg font-semibold text-foreground">Identity Mode</h2>
            </div>
            
            <div className="space-y-4">
              {/* Mode Toggle */}
              <div className="flex gap-2">
                <button
                  onClick={() => setIdentityMode('service')}
                  className={cn(
                    "flex-1 py-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2",
                    appContext.mode === 'service'
                      ? "bg-icom/20 text-icom border border-icom/30"
                      : "bg-secondary/50 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Bot className="w-4 h-4" />
                  Service Account
                </button>
                <button
                  onClick={() => setIdentityMode('delegated')}
                  className={cn(
                    "flex-1 py-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2",
                    appContext.mode === 'delegated'
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "bg-secondary/50 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <User className="w-4 h-4" />
                  Delegated Actor
                </button>
              </div>
              
              {/* Service Account Info */}
              {appContext.mode === 'service' && (
                <div className="p-3 rounded-lg bg-secondary/30">
                  <p className="text-sm text-muted-foreground">
                    Mode par défaut. L'application agit en son propre nom (service-to-service).
                  </p>
                </div>
              )}
              
              {/* Delegated Actor Form */}
              {appContext.mode === 'delegated' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-muted-foreground block mb-2">Actor ID</label>
                    <input
                      type="text"
                      value={delegatedActorInput}
                      onChange={(e) => setDelegatedActorInput(e.target.value)}
                      placeholder="ex: user-12345"
                      className="w-full bg-secondary/50 rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground block mb-2">Actor Realm</label>
                    <select
                      value={delegatedRealmInput}
                      onChange={(e) => setDelegatedRealmInput(e.target.value as 'citizen' | 'government' | 'business')}
                      className="w-full bg-secondary/50 rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="citizen">Citizen</option>
                      <option value="government">Government</option>
                      <option value="business">Business</option>
                    </select>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleApplyDelegated}
                    className="w-full"
                  >
                    Apply Delegated Identity
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
          
          {/* Platform Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                <Server className="w-5 h-5 text-muted-foreground" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Platform</h2>
            </div>
            
            {capabilities ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Name</span>
                  <span className="text-sm font-mono text-foreground">{capabilities.platform}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Version</span>
                  <span className="text-sm font-mono text-foreground">{capabilities.version}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Tenant ID</span>
                  <span className="text-sm font-mono text-foreground">{capabilities.tenant_id}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">App ID</span>
                  <span className="text-sm font-mono text-foreground">{capabilities.app_id}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-muted-foreground">Network</span>
                  <span className="text-sm font-mono text-foreground">{capabilities.network_id}</span>
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">Loading...</div>
            )}
          </motion.div>
          
          {/* API Headers Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-neural/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-neural" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">API Headers</h2>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-xs font-mono text-muted-foreground">X-App-Id</span>
                <span className="text-xs font-mono text-foreground">{appContext.app_id}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-xs font-mono text-muted-foreground">X-Dev-Tenant</span>
                <span className="text-xs font-mono text-foreground">{appContext.tenant_id}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-xs font-mono text-muted-foreground">X-Dev-Network</span>
                <span className="text-xs font-mono text-foreground">{appContext.network_id}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-xs font-mono text-muted-foreground">X-Dev-Network-Type</span>
                <span className="text-xs font-mono text-foreground">{appContext.network_type}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-xs font-mono text-muted-foreground">X-Dev-Mode</span>
                <span className={cn(
                  "text-xs font-mono px-2 py-0.5 rounded",
                  appContext.mode === 'service' ? 'bg-icom/20 text-icom' : 'bg-primary/20 text-primary'
                )}>
                  {appContext.mode}
                </span>
              </div>
              {appContext.mode === 'delegated' && appContext.delegated_actor_id && (
                <div className="flex justify-between items-center py-2">
                  <span className="text-xs font-mono text-muted-foreground">X-Dev-Actor</span>
                  <span className="text-xs font-mono text-foreground">{appContext.delegated_actor_id}</span>
                </div>
              )}
            </div>
          </motion.div>
          
          {/* Modules - Full Width */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass rounded-2xl p-6 lg:col-span-2"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl gradient-neural flex items-center justify-center">
                <Layers className="w-5 h-5 text-foreground" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Effective Modules</h2>
            </div>
            
            {modules ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* iCom */}
                <div className={cn(
                  "p-4 rounded-xl border",
                  modules.icom.enabled 
                    ? 'border-icom/30 bg-icom/10' 
                    : 'border-border bg-secondary/30'
                )}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-foreground">iCom</span>
                    {modules.icom.enabled ? (
                      <CheckCircle className="w-5 h-5 text-success" />
                    ) : (
                      <XCircle className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Chat & Messaging</p>
                  {modules.icom.disabled_reason && (
                    <div className="mt-2 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-warning" />
                      <span className="text-xs text-warning">{modules.icom.disabled_reason}</span>
                    </div>
                  )}
                </div>
                
                {/* iBoîte */}
                <div className={cn(
                  "p-4 rounded-xl border",
                  modules.iboite.enabled 
                    ? 'border-iboite/30 bg-iboite/10' 
                    : 'border-border bg-secondary/30'
                )}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-foreground">iBoîte</span>
                    {modules.iboite.enabled ? (
                      <CheckCircle className="w-5 h-5 text-success" />
                    ) : (
                      <XCircle className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Internal Inbox</p>
                  {modules.iboite.disabled_reason && (
                    <div className="mt-2 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-warning" />
                      <span className="text-xs text-warning">{modules.iboite.disabled_reason}</span>
                    </div>
                  )}
                </div>
                
                {/* iAsted */}
                <div className={cn(
                  "p-4 rounded-xl border",
                  modules.iasted.enabled 
                    ? 'border-neural/30 bg-neural/10' 
                    : 'border-border bg-secondary/30'
                )}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-foreground">iAsted</span>
                    {modules.iasted.enabled ? (
                      <CheckCircle className="w-5 h-5 text-success" />
                    ) : (
                      <XCircle className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">AI Assistant</p>
                  {modules.iasted.disabled_reason && (
                    <div className="mt-2 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-warning" />
                      <span className="text-xs text-warning">{modules.iasted.disabled_reason}</span>
                    </div>
                  )}
                </div>
                
                {/* iCorrespondance */}
                <div className={cn(
                  "p-4 rounded-xl border",
                  modules.icorrespondance.enabled 
                    ? 'border-primary/30 bg-primary/10' 
                    : 'border-border bg-secondary/30'
                )}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-foreground">iCorrespondance</span>
                    {modules.icorrespondance.enabled ? (
                      <CheckCircle className="w-5 h-5 text-success" />
                    ) : (
                      <XCircle className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Admin Workflow</p>
                  {modules.icorrespondance.realm_required && (
                    <div className="mt-2 flex items-center gap-1">
                      <Shield className="w-3 h-3 text-warning" />
                      <span className="text-xs text-warning">
                        Requires: {modules.icorrespondance.realm_required}
                      </span>
                    </div>
                  )}
                  {modules.icorrespondance.disabled_reason && (
                    <div className="mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-destructive" />
                      <span className="text-xs text-destructive">{modules.icorrespondance.disabled_reason}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">Loading modules...</div>
            )}
            
            {/* iCorrespondance Government Notice */}
            {modules && !modules.icorrespondance.enabled && (
              <div className="mt-4 p-3 rounded-lg bg-warning/10 border border-warning/20">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-warning mt-0.5" />
                  <p className="text-sm text-warning">
                    <strong>iCorrespondance</strong> requires both a <strong>government network</strong> and 
                    {appContext.mode === 'delegated' ? ' a <strong>government realm</strong> actor' : ' government realm when in delegated mode'}.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
          
          {/* Raw JSON */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass rounded-2xl p-6 lg:col-span-2"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">Raw Capabilities JSON</h2>
            <pre className="bg-background/50 rounded-xl p-4 overflow-x-auto text-xs font-mono text-muted-foreground">
              {JSON.stringify(capabilities, null, 2)}
            </pre>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
