import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, User, MessageCircle, Inbox, Brain, FileText, Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useComms } from '@/contexts/CommsContext';
import { UserMenu } from '@/components/layout/UserMenu';
import { cn } from '@/lib/utils';

export default function DelegatedDashboard() {
  const { t } = useTranslation();
  const { payload, hasScope } = useAuth();
  const { openCommsCenter } = useComms();
  
  const modules = [
    { 
      id: 'icom', 
      name: t('dashboard.delegated.messages'), 
      icon: MessageCircle, 
      description: t('dashboard.delegated.liveConversations'),
      color: 'text-icom bg-icom/20',
      enabled: hasScope('icom:read'),
      unread: 3,
    },
    { 
      id: 'iboite', 
      name: t('dashboard.delegated.inbox'), 
      icon: Inbox, 
      description: t('dashboard.delegated.internalMail'),
      color: 'text-iboite bg-iboite/20',
      enabled: hasScope('iboite:read'),
      unread: 5,
    },
    { 
      id: 'iasted', 
      name: t('dashboard.delegated.assistant'), 
      icon: Brain, 
      description: t('dashboard.delegated.smartHelp'),
      color: 'text-neural bg-neural/20',
      enabled: hasScope('iasted:chat'),
      unread: 0,
    },
    { 
      id: 'icorrespondance', 
      name: t('dashboard.delegated.officialMail'), 
      icon: FileText, 
      description: t('dashboard.delegated.adminDocs'),
      color: 'text-primary bg-primary/20',
      enabled: hasScope('icorrespondance:read'),
      unread: 1,
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
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">{t('dashboard.delegated.title')}</h1>
                  <p className="text-xs text-muted-foreground">{payload?.actor_id || payload?.sub}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
              </Button>
              
              <UserMenu />
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-6 py-8">
        {/* Welcome */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {t('dashboard.delegated.welcome')}, {payload?.actor_id || t('modes.delegated')}
          </h2>
          <p className="text-muted-foreground">
            {t('dashboard.delegated.accessComms')}
          </p>
        </motion.div>
        
        {/* Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-6 mb-8"
        >
          <h3 className="font-medium text-foreground mb-4">{t('dashboard.delegated.quickActions')}</h3>
          <div className="flex flex-wrap gap-3">
            <Button variant="neural" onClick={openCommsCenter}>
              <MessageCircle className="w-4 h-4 mr-2" />
              {t('dashboard.delegated.newConversation')}
            </Button>
            <Button variant="outline">
              <Inbox className="w-4 h-4 mr-2" />
              {t('dashboard.delegated.viewMessages')}
            </Button>
            <Button variant="outline">
              <Brain className="w-4 h-4 mr-2" />
              {t('dashboard.delegated.askHelp')}
            </Button>
          </div>
        </motion.div>
        
        {/* Modules Grid */}
        <h3 className="font-medium text-foreground mb-4">{t('dashboard.delegated.yourServices')}</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {modules.filter(m => m.enabled).map((module, index) => (
            <motion.button
              key={module.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + index * 0.05 }}
              className="glass rounded-xl p-5 text-left hover:border-primary/30 transition-colors"
              onClick={openCommsCenter}
            >
              <div className="flex items-start justify-between">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center",
                  module.color
                )}>
                  <module.icon className="w-6 h-6" />
                </div>
                
                {module.unread > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {module.unread} {t('dashboard.delegated.new')}{module.unread > 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
              
              <h4 className="font-medium text-foreground mt-4 mb-1">{module.name}</h4>
              <p className="text-sm text-muted-foreground">{module.description}</p>
            </motion.button>
          ))}
        </div>
        
        {/* Disabled modules notice */}
        {modules.some(m => !m.enabled) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 p-4 rounded-xl bg-muted/50 text-sm text-muted-foreground"
          >
            {t('dashboard.delegated.servicesNotAvailable')}
          </motion.div>
        )}
      </main>
    </div>
  );
}
