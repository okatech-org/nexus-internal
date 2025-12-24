import { useEffect, useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MessageCircle, 
  Inbox, 
  Brain, 
  FileText, 
  Zap, 
  Shield, 
  Code2,
  ArrowRight,
  Layers,
  Network,
  Radio,
  Keyboard,
  Users,
  Crown,
  Building
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useComms } from '@/contexts/CommsContext';
import { useDemo } from '@/contexts/DemoContext';
import { CommsCenterDrawer } from '@/components/comms-center/CommsCenterDrawer';
import { NeuralHeartButton } from '@/components/neural-heart/NeuralHeartButton';
import { AstedPanel } from '@/components/asted/AstedPanel';
import { CorrespondancePanel } from '@/components/correspondance/CorrespondancePanel';
import { RealtimePanel } from '@/components/realtime/RealtimePanel';
import { NetworkTopology } from '@/components/network/NetworkTopology';
import { KeyboardShortcutsDialog } from '@/components/KeyboardShortcutsDialog';
import { DemoAccountsPanel } from '@/components/demo/DemoAccountsPanel';
import { PlatformAdminConsole } from '@/components/demo/PlatformAdminConsole';
import { TenantAdminConsole } from '@/components/demo/TenantAdminConsole';
import { useKeyboardShortcuts, KeyboardShortcut } from '@/hooks/useKeyboardShortcuts';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const features = [
  {
    icon: MessageCircle,
    title: 'iCom',
    description: 'Chat interne en temps réel, conversations DM et groupes',
    color: 'icom',
    gradient: 'from-emerald-500/20 to-teal-500/20',
  },
  {
    icon: Inbox,
    title: 'iBoîte',
    description: 'Inbox interne avec threads et traçabilité complète',
    color: 'iboite',
    gradient: 'from-amber-500/20 to-orange-500/20',
  },
  {
    icon: Brain,
    title: 'iAsted',
    description: 'Assistant IA contextuel pour aide et synthèse',
    color: 'neural',
    gradient: 'from-purple-500/20 to-pink-500/20',
  },
  {
    icon: FileText,
    title: 'iCorrespondance',
    description: 'Workflow courrier administratif (gov only)',
    color: 'primary',
    gradient: 'from-blue-500/20 to-indigo-500/20',
  },
];

const techStack = [
  { icon: Zap, label: 'Realtime SSE' },
  { icon: Shield, label: 'OIDC/JWKS Auth' },
  { icon: Layers, label: 'Multi-tenant' },
  { icon: Code2, label: 'API First' },
];

export default function Index() {
  const { openCommsCenter, bootstrap, capabilities, isLoading } = useComms();
  const { activeProfile, effectiveModules, isPlatformAdmin, isTenantAdmin } = useDemo();
  
  const [isCorrespondanceOpen, setIsCorrespondanceOpen] = useState(false);
  const [isRealtimeOpen, setIsRealtimeOpen] = useState(false);
  const [isTopologyOpen, setIsTopologyOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isDemoAccountsOpen, setIsDemoAccountsOpen] = useState(false);
  const [isPlatformAdminOpen, setIsPlatformAdminOpen] = useState(false);
  const [isTenantAdminOpen, setIsTenantAdminOpen] = useState(false);
  
  const iCorrespondanceEnabled = effectiveModules.find(m => m.name === 'icorrespondance')?.enabled 
    ?? capabilities?.modules.icorrespondance.enabled;

  // Define keyboard shortcuts
  const shortcuts: KeyboardShortcut[] = useMemo(() => [
    // Navigation shortcuts
    {
      key: 'c',
      description: 'Ouvrir le Centre de Communication',
      action: () => openCommsCenter(),
      category: 'navigation',
    },
    {
      key: 'd',
      description: 'Ouvrir iCorrespondance',
      action: () => setIsCorrespondanceOpen(true),
      category: 'navigation',
    },
    {
      key: 'r',
      description: 'Ouvrir le panneau Realtime',
      action: () => setIsRealtimeOpen(true),
      category: 'navigation',
    },
    {
      key: 't',
      description: 'Ouvrir la Topologie réseau',
      action: () => setIsTopologyOpen(true),
      category: 'navigation',
    },
    {
      key: 'a',
      description: 'Ouvrir les comptes démo',
      action: () => setIsDemoAccountsOpen(true),
      category: 'navigation',
    },
    {
      key: 'Escape',
      description: 'Fermer le panneau actif',
      action: () => {
        setIsCorrespondanceOpen(false);
        setIsRealtimeOpen(false);
        setIsTopologyOpen(false);
        setIsShortcutsOpen(false);
        setIsDemoAccountsOpen(false);
        setIsPlatformAdminOpen(false);
        setIsTenantAdminOpen(false);
      },
      category: 'navigation',
    },
    // View shortcuts
    {
      key: '?',
      shift: true,
      description: 'Afficher les raccourcis clavier',
      action: () => setIsShortcutsOpen(prev => !prev),
      category: 'view',
    },
    {
      key: 'n',
      ctrl: true,
      description: 'Nouveau dossier (iCorrespondance)',
      action: () => {
        setIsCorrespondanceOpen(true);
        toast.info('Nouveau dossier (fonctionnalité à venir)');
      },
      category: 'actions',
    },
    {
      key: 's',
      ctrl: true,
      description: 'Signer le document en attente',
      action: () => {
        toast.info('Signature (ouvrez un dossier avec des signatures en attente)');
      },
      category: 'actions',
    },
    {
      key: 'f',
      ctrl: true,
      description: 'Rechercher',
      action: () => {
        toast.info('Recherche (fonctionnalité à venir)');
      },
      category: 'actions',
    },
  ], [openCommsCenter]);

  useKeyboardShortcuts(shortcuts);
  
  useEffect(() => {
    bootstrap();
  }, [bootstrap]);
  
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-neural/5 rounded-full blur-3xl" />
      </div>
      
      {/* Header */}
      <header className="relative z-10 border-b border-border/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <Layers className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">NDJOBI</h1>
                <p className="text-xs text-muted-foreground">Sandbox Demo</p>
              </div>
            </div>
            
            <nav className="flex items-center gap-2">
              {/* Demo Accounts Button */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsDemoAccountsOpen(true)}
                className={cn(
                  "border-amber-500/50",
                  activeProfile && "bg-amber-500/10"
                )}
              >
                <Users className="w-4 h-4 mr-2" />
                Demo Accounts
                {activeProfile && (
                  <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">
                    {activeProfile.label.split(' ')[0]}
                  </span>
                )}
              </Button>
              
              {/* Platform Admin Button */}
              {isPlatformAdmin && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsPlatformAdminOpen(true)}
                  className="text-amber-400 hover:text-amber-300"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Platform Admin
                </Button>
              )}
              
              {/* Tenant Admin Button */}
              {isTenantAdmin && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsTenantAdminOpen(true)}
                  className="text-blue-400 hover:text-blue-300"
                >
                  <Building className="w-4 h-4 mr-2" />
                  Tenant Admin
                </Button>
              )}
              
              <Button 
                variant="ghost" 
                size="icon-sm" 
                onClick={() => setIsShortcutsOpen(true)}
                title="Raccourcis clavier (?)"
              >
                <Keyboard className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setIsTopologyOpen(true)}>
                <Network className="w-4 h-4 mr-2" />
                Topology
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setIsRealtimeOpen(true)}>
                <Radio className="w-4 h-4 mr-2" />
                Realtime
              </Button>
              <Link to="/debug">
                <Button variant="ghost" size="sm">
                  <Code2 className="w-4 h-4 mr-2" />
                  Debug
                </Button>
              </Link>
              <Button variant="outline" onClick={openCommsCenter}>
                <MessageCircle className="w-4 h-4 mr-2" />
                Comms Center
              </Button>
            </nav>
          </div>
          
          {/* Active Profile Banner */}
          {activeProfile && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 p-2 rounded-lg bg-primary/10 border border-primary/20 flex items-center gap-4 text-xs"
            >
              <span className="text-muted-foreground">Active:</span>
              <span className="font-medium text-foreground">{activeProfile.label}</span>
              <span className="text-muted-foreground">•</span>
              <span className="font-mono text-primary">{activeProfile.app_id}</span>
              <span className="text-muted-foreground">•</span>
              <span className="font-mono">{activeProfile.tenant_id}</span>
              <span className="text-muted-foreground">•</span>
              <span className={cn(
                "px-1.5 py-0.5 rounded",
                activeProfile.network_type === 'government' ? "bg-blue-500/20 text-blue-400" : "bg-amber-500/20 text-amber-400"
              )}>
                {activeProfile.network_type}
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="text-foreground">{activeProfile.realm}</span>
              <span className="text-muted-foreground">•</span>
              <span className={cn(
                "px-1.5 py-0.5 rounded",
                activeProfile.mode === 'delegated' ? "bg-purple-500/20 text-purple-400" : "bg-emerald-500/20 text-emerald-400"
              )}>
                {activeProfile.mode}
              </span>
              {activeProfile.actor_id && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <span className="font-mono text-purple-400">actor: {activeProfile.actor_id}</span>
                </>
              )}
            </motion.div>
          )}
        </div>
      </header>
      
      {/* Hero */}
      <section className="relative z-10 py-20 md:py-32">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-sm text-muted-foreground">
                App-Centric Mode • {activeProfile ? activeProfile.label : (capabilities ? 'Connected' : 'Loading...')}
              </span>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Plateforme de Communication
              <br />
              <span className="text-gradient-primary">100% Interne</span>
            </h2>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              NDJOBI est un réseau de communication modulaire et sécurisé pour applications. 
              Aucun email externe, tout reste interne avec traçabilité complète.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                variant="neural"
                size="xl"
                onClick={openCommsCenter}
                className="group"
              >
                Ouvrir le Centre de Communication
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              {iCorrespondanceEnabled && (
                <Button
                  variant="glass"
                  size="xl"
                  onClick={() => setIsCorrespondanceOpen(true)}
                >
                  <FileText className="w-5 h-5 mr-2" />
                  iCorrespondance
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Modules */}
      <section className="relative z-10 py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Modules Activables
            </h3>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Chaque application peut activer indépendamment les modules dont elle a besoin
            </p>
          </motion.div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => {
              const moduleStatus = effectiveModules.find(m => m.name === feature.title.toLowerCase());
              const isEnabled = moduleStatus?.enabled ?? true;
              
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "glass rounded-2xl p-6 hover:scale-[1.02] transition-transform duration-300",
                    !isEnabled && "opacity-50"
                  )}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}>
                    <feature.icon className={`w-6 h-6 text-${feature.color}`} />
                  </div>
                  <h4 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                    {feature.title}
                    {!isEnabled && moduleStatus?.disabled_reason && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-destructive/20 text-destructive">
                        {moduleStatus.disabled_reason}
                      </span>
                    )}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
      
      {/* Tech Stack */}
      <section className="relative z-10 py-20 border-t border-border/50">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap items-center justify-center gap-8">
            {techStack.map((tech, index) => (
              <motion.div
                key={tech.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-2 text-muted-foreground"
              >
                <tech.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{tech.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="relative z-10 py-8 border-t border-border/50">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm text-muted-foreground">
            NDJOBI Sandbox • Okatech Communications Platform • v1.0
          </p>
        </div>
      </footer>
      
      {/* Comms Center Drawer */}
      <CommsCenterDrawer />
      
      {/* Neural Heart Button */}
      <NeuralHeartButton />
      
      {/* iAsted Panel */}
      <AstedPanel />
      
      {/* iCorrespondance Panel */}
      <CorrespondancePanel 
        isOpen={isCorrespondanceOpen} 
        onClose={() => setIsCorrespondanceOpen(false)} 
      />
      
      {/* Realtime Panel */}
      <RealtimePanel 
        isOpen={isRealtimeOpen} 
        onClose={() => setIsRealtimeOpen(false)} 
      />
      
      {/* Network Topology */}
      <NetworkTopology
        isOpen={isTopologyOpen}
        onClose={() => setIsTopologyOpen(false)}
      />
      
      {/* Keyboard Shortcuts Dialog */}
      <KeyboardShortcutsDialog
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
        shortcuts={shortcuts}
      />
      
      {/* Demo Accounts Panel */}
      <DemoAccountsPanel
        isOpen={isDemoAccountsOpen}
        onClose={() => setIsDemoAccountsOpen(false)}
        onOpenComms={openCommsCenter}
      />
      
      {/* Platform Admin Console */}
      <PlatformAdminConsole
        isOpen={isPlatformAdminOpen}
        onClose={() => setIsPlatformAdminOpen(false)}
      />
      
      {/* Tenant Admin Console */}
      <TenantAdminConsole
        isOpen={isTenantAdminOpen}
        onClose={() => setIsTenantAdminOpen(false)}
      />
    </div>
  );
}
