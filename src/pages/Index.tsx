import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  LogIn
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
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
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, payload } = useAuth();
  
  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated && payload?.mode) {
      const dashboardRoutes: Record<string, string> = {
        platform_admin: '/admin/platform',
        tenant_admin: '/admin/tenant',
        service: '/client',
        delegated: '/delegated',
      };
      const route = dashboardRoutes[payload.mode];
      if (route) {
        navigate(route, { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, payload?.mode, navigate]);
  
  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }
  
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
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <Layers className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">NDJOBI</h1>
                <p className="text-xs text-muted-foreground">Plateforme de Communication</p>
              </div>
            </div>
            
            <nav className="flex items-center gap-3">
              <Link to="/demo-accounts">
                <Button variant="ghost" size="sm">
                  Mode Démo
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="neural" size="sm" className="gap-2">
                  <LogIn className="w-4 h-4" />
                  Connexion
                </Button>
              </Link>
            </nav>
          </div>
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
                App-Centric Mode • Sandbox Demo
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
              <Link to="/demo-accounts">
                <Button variant="neural" size="xl" className="group">
                  Explorer les Comptes Démo
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              
              <Link to="/login">
                <Button variant="glass" size="xl">
                  <LogIn className="w-5 h-5 mr-2" />
                  Se Connecter
                </Button>
              </Link>
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
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass rounded-2xl p-6 hover:scale-[1.02] transition-transform duration-300"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}>
                  <feature.icon className={`w-6 h-6 text-${feature.color}`} />
                </div>
                <h4 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
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
    </div>
  );
}
