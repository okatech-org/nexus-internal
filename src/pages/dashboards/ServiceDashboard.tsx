import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Server, MessageCircle, Inbox, Brain, FileText, Radio
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useComms } from '@/contexts/CommsContext';
import { UserMenu } from '@/components/layout/UserMenu';
import { cn } from '@/lib/utils';

export default function ServiceDashboard() {
  const { payload, hasScope } = useAuth();
  const { openCommsCenter } = useComms();
  
  const modules = [
    { 
      id: 'icom', 
      name: 'iCom', 
      icon: MessageCircle, 
      description: 'Chat en temps réel',
      color: 'text-icom bg-icom/20',
      enabled: hasScope('icom:read'),
    },
    { 
      id: 'iboite', 
      name: 'iBoîte', 
      icon: Inbox, 
      description: 'Inbox interne',
      color: 'text-iboite bg-iboite/20',
      enabled: hasScope('iboite:read'),
    },
    { 
      id: 'iasted', 
      name: 'iAsted', 
      icon: Brain, 
      description: 'Assistant IA',
      color: 'text-neural bg-neural/20',
      enabled: hasScope('iasted:chat'),
    },
    { 
      id: 'icorrespondance', 
      name: 'iCorrespondance', 
      icon: FileText, 
      description: 'Courrier administratif',
      color: 'text-primary bg-primary/20',
      enabled: hasScope('icorrespondance:read'),
    },
  ];
  
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
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <Server className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Service Dashboard</h1>
                  <p className="text-xs text-muted-foreground font-mono">{payload?.app_id}</p>
                </div>
              </div>
            </div>
            
            <UserMenu />
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-6 py-8">
        {/* Status Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Session Active</h2>
            <Badge variant="default" className="bg-success/20 text-success border-success/30">
              <Radio className="w-3 h-3 mr-1 animate-pulse" />
              Connected
            </Badge>
          </div>
          
          <div className="grid gap-4 md:grid-cols-4 text-sm">
            <div>
              <span className="text-muted-foreground block mb-1">App ID</span>
              <span className="font-mono text-foreground">{payload?.app_id}</span>
            </div>
            <div>
              <span className="text-muted-foreground block mb-1">Tenant</span>
              <span className="font-mono text-foreground">{payload?.tenant_id}</span>
            </div>
            <div>
              <span className="text-muted-foreground block mb-1">Network</span>
              <Badge variant="outline">{payload?.network_type}</Badge>
            </div>
            <div>
              <span className="text-muted-foreground block mb-1">Realm</span>
              <Badge variant="outline">{payload?.realm}</Badge>
            </div>
          </div>
        </motion.div>
        
        {/* Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Button 
            variant="neural" 
            size="lg" 
            onClick={openCommsCenter}
            className="w-full md:w-auto"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Ouvrir le Centre de Communication
          </Button>
        </motion.div>
        
        {/* Modules */}
        <h2 className="text-lg font-semibold mb-4">Modules Disponibles</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {modules.map((module, index) => (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className={cn(
                "glass rounded-xl p-4",
                !module.enabled && "opacity-50"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center mb-3",
                module.color
              )}>
                <module.icon className="w-5 h-5" />
              </div>
              <h3 className="font-medium text-foreground mb-1">{module.name}</h3>
              <p className="text-xs text-muted-foreground">{module.description}</p>
              <Badge 
                variant="outline" 
                className={cn(
                  "mt-3",
                  module.enabled ? "border-success/30 text-success" : "border-muted"
                )}
              >
                {module.enabled ? 'Activé' : 'Non disponible'}
              </Badge>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
