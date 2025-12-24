import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, XCircle, Server, User, Shield, Layers, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useComms } from '@/contexts/CommsContext';

export default function Debug() {
  const { capabilities, devContext, isDevMode, bootstrap, isLoading } = useComms();
  
  useEffect(() => {
    if (!capabilities) {
      bootstrap();
    }
  }, [capabilities, bootstrap]);
  
  const modules = capabilities?.modules;
  
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
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
                Capabilities & Context Viewer
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
        
        <div className="grid gap-6 md:grid-cols-2">
          {/* Platform Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <Server className="w-5 h-5 text-foreground" />
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
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-muted-foreground">App ID</span>
                  <span className="text-sm font-mono text-foreground">{capabilities.app_id}</span>
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">Loading...</div>
            )}
          </motion.div>
          
          {/* Actor Context */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-icom/20 flex items-center justify-center">
                <User className="w-5 h-5 text-icom" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Actor Context</h2>
                {isDevMode && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-warning/20 text-warning">
                    DEV MODE
                  </span>
                )}
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Actor ID</span>
                <span className="text-sm font-mono text-foreground">{devContext.actor_id}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Tenant ID</span>
                <span className="text-sm font-mono text-foreground">{devContext.tenant_id}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Realm</span>
                <span className={`text-sm font-mono px-2 py-0.5 rounded ${
                  devContext.realm === 'government' 
                    ? 'bg-primary/20 text-primary' 
                    : 'bg-secondary text-secondary-foreground'
                }`}>
                  {devContext.realm}
                </span>
              </div>
              <div className="py-2">
                <span className="text-sm text-muted-foreground block mb-2">Scopes</span>
                <div className="flex flex-wrap gap-1">
                  {devContext.scopes.map((scope) => (
                    <span
                      key={scope}
                      className="text-xs font-mono px-2 py-1 rounded-lg bg-secondary text-secondary-foreground"
                    >
                      {scope}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Modules */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-6 md:col-span-2"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl gradient-neural flex items-center justify-center">
                <Layers className="w-5 h-5 text-foreground" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Modules</h2>
            </div>
            
            {modules ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* iCom */}
                <div className={`p-4 rounded-xl border ${
                  modules.icom.enabled 
                    ? 'border-icom/30 bg-icom/10' 
                    : 'border-border bg-secondary/30'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-foreground">iCom</span>
                    {modules.icom.enabled ? (
                      <CheckCircle className="w-5 h-5 text-success" />
                    ) : (
                      <XCircle className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Chat & Messaging</p>
                  {modules.icom.realtime && (
                    <div className="mt-2 text-xs font-mono text-muted-foreground">
                      SSE: {modules.icom.realtime.sse_url}
                    </div>
                  )}
                </div>
                
                {/* iBoîte */}
                <div className={`p-4 rounded-xl border ${
                  modules.iboite.enabled 
                    ? 'border-iboite/30 bg-iboite/10' 
                    : 'border-border bg-secondary/30'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-foreground">iBoîte</span>
                    {modules.iboite.enabled ? (
                      <CheckCircle className="w-5 h-5 text-success" />
                    ) : (
                      <XCircle className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Internal Inbox</p>
                </div>
                
                {/* iAsted */}
                <div className={`p-4 rounded-xl border ${
                  modules.iasted.enabled 
                    ? 'border-neural/30 bg-neural/10' 
                    : 'border-border bg-secondary/30'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-foreground">iAsted</span>
                    {modules.iasted.enabled ? (
                      <CheckCircle className="w-5 h-5 text-success" />
                    ) : (
                      <XCircle className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">AI Assistant</p>
                </div>
                
                {/* iCorrespondance */}
                <div className={`p-4 rounded-xl border ${
                  modules.icorrespondance.enabled 
                    ? 'border-primary/30 bg-primary/10' 
                    : 'border-border bg-secondary/30'
                }`}>
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
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">Loading modules...</div>
            )}
          </motion.div>
          
          {/* Raw JSON */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-2xl p-6 md:col-span-2"
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
