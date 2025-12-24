/**
 * Module Settings Panel Component
 * Displays module configuration with real-time switches
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Inbox, Bot, FileText, Loader2, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useModuleSettings } from '@/hooks/useModuleSettings';
import { cn } from '@/lib/utils';

interface ModuleConfig {
  id: string;
  name: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  features: string[];
  defaultEnabled: boolean;
}

const AVAILABLE_MODULES: ModuleConfig[] = [
  {
    id: 'icom',
    name: 'icom',
    label: 'iCom',
    description: 'Communication instantanée',
    icon: MessageCircle,
    features: ['Chat', 'Appels vocaux', 'Visioconférence'],
    defaultEnabled: true
  },
  {
    id: 'iboite',
    name: 'iboite',
    label: 'iBoîte',
    description: 'Messagerie asynchrone',
    icon: Inbox,
    features: ['Threads', 'Pièces jointes', 'Archivage'],
    defaultEnabled: true
  },
  {
    id: 'iasted',
    name: 'iasted',
    label: 'iAsted',
    description: 'Assistant IA',
    icon: Bot,
    features: ['Chatbot', 'Analyse de documents', 'Résumés automatiques'],
    defaultEnabled: false
  },
  {
    id: 'icorrespondance',
    name: 'icorrespondance',
    label: 'iCorrespondance',
    description: 'Courrier administratif',
    icon: FileText,
    features: ['Modèles', 'Signatures', 'Archivage légal'],
    defaultEnabled: false
  }
];

interface ModuleSettingsPanelProps {
  applicationId: string;
  readOnly?: boolean;
}

export function ModuleSettingsPanel({ applicationId, readOnly = false }: ModuleSettingsPanelProps) {
  const { settings, loading, toggleModule, refetch } = useModuleSettings({ applicationId });
  const [pendingToggles, setPendingToggles] = useState<Set<string>>(new Set());

  const handleToggle = async (moduleId: string, moduleName: string, currentEnabled: boolean) => {
    if (readOnly) return;

    setPendingToggles(prev => new Set(prev).add(moduleId));
    await toggleModule(moduleId, !currentEnabled);
    setPendingToggles(prev => {
      const next = new Set(prev);
      next.delete(moduleId);
      return next;
    });
  };

  // Get setting for a module, with fallback to default
  const getModuleState = (moduleName: string) => {
    const setting = settings.find(s => s.module_name === moduleName);
    const config = AVAILABLE_MODULES.find(m => m.name === moduleName);
    return {
      id: setting?.id || '',
      enabled: setting?.enabled ?? config?.defaultEnabled ?? false,
      hasDbSetting: !!setting
    };
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {AVAILABLE_MODULES.map((module) => (
          <Card key={module.id} className="bg-card/50 border-border/50">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <Skeleton className="w-12 h-12 rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-4 w-40" />
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                  </div>
                </div>
                <Skeleton className="h-6 w-10" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          {settings.length} module(s) configuré(s)
        </p>
        <Button variant="ghost" size="sm" onClick={refetch} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Actualiser
        </Button>
      </div>

      {AVAILABLE_MODULES.map((module, index) => {
        const state = getModuleState(module.name);
        const isPending = pendingToggles.has(state.id);

        return (
          <motion.div
            key={module.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className={cn(
              "bg-card/50 border-border/50 transition-all",
              state.enabled && "border-primary/30"
            )}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                      state.enabled ? "bg-primary/20" : "bg-muted"
                    )}>
                      <module.icon className={cn(
                        "w-6 h-6 transition-colors",
                        state.enabled ? "text-primary" : "text-muted-foreground"
                      )} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{module.label}</h3>
                        {!state.hasDbSetting && (
                          <Badge variant="outline" className="text-[10px]">Par défaut</Badge>
                        )}
                        {state.enabled && (
                          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{module.description}</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {module.features.map((feature) => (
                          <Badge 
                            key={feature} 
                            variant="outline" 
                            className={cn(
                              "text-xs transition-colors",
                              state.enabled ? "border-primary/30" : ""
                            )}
                          >
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {isPending && (
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    )}
                    <Switch 
                      checked={state.enabled}
                      onCheckedChange={() => handleToggle(state.id, module.name, state.enabled)}
                      disabled={readOnly || isPending || !state.hasDbSetting}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
