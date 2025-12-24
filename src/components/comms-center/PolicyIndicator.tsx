/**
 * Policy Indicator Component
 * Displays cross-realm communication restrictions in real-time
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Phone, 
  Video, 
  Users, 
  Check, 
  X, 
  AlertCircle,
  Info,
  Shield,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Realm, IcomFeatureName, NetworkType } from '@/types/comms';
import { 
  canCommunicate, 
  CommunicationChannel, 
  PolicyResult,
  getCrossRealmPolicy,
  formatPolicyReason,
  getAvailableChannels
} from '@/lib/policyEngine';

// Feature configuration
const FEATURE_CONFIG: Record<IcomFeatureName, { 
  icon: typeof MessageCircle; 
  label: string; 
  channel: CommunicationChannel;
  color: string;
  bgColor: string;
}> = {
  chat: { 
    icon: MessageCircle, 
    label: 'iChat', 
    channel: 'icom.chat',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10'
  },
  call: { 
    icon: Phone, 
    label: 'iAppel', 
    channel: 'icom.call',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10'
  },
  meeting: { 
    icon: Video, 
    label: 'iRéunion', 
    channel: 'icom.meeting',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10'
  },
  contact: { 
    icon: Users, 
    label: 'iContact', 
    channel: 'icom.contact',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10'
  },
};

const REALM_LABELS: Record<Realm, { label: string; color: string }> = {
  citizen: { label: 'Citoyen', color: 'text-blue-400' },
  government: { label: 'Gouvernement', color: 'text-primary' },
  business: { label: 'Entreprise', color: 'text-emerald-400' },
};

interface PolicyIndicatorProps {
  senderRealm: Realm;
  receiverRealm: Realm;
  networkType: NetworkType;
  userScopes: string[];
  compact?: boolean;
  showLabels?: boolean;
}

/**
 * Displays allowed/blocked communication channels for a specific realm combination
 */
export function PolicyIndicator({ 
  senderRealm, 
  receiverRealm, 
  networkType, 
  userScopes,
  compact = false,
  showLabels = true 
}: PolicyIndicatorProps) {
  const features: IcomFeatureName[] = ['chat', 'call', 'meeting', 'contact'];
  
  const results = features.map(feature => {
    const config = FEATURE_CONFIG[feature];
    const result = canCommunicate({
      senderRealm,
      receiverRealm,
      networkType,
      userScopes,
      channel: config.channel,
    });
    return { feature, config, result };
  });

  const allowedCount = results.filter(r => r.result.allowed).length;

  if (compact) {
    return (
      <TooltipProvider>
        <div className="flex items-center gap-1">
          {results.map(({ feature, config, result }) => {
            const Icon = config.icon;
            return (
              <Tooltip key={feature}>
                <TooltipTrigger asChild>
                  <span className={cn(
                    "w-5 h-5 rounded flex items-center justify-center",
                    result.allowed 
                      ? config.bgColor
                      : "bg-muted"
                  )}>
                    <Icon className={cn(
                      "w-3 h-3",
                      result.allowed ? config.color : "text-muted-foreground/50"
                    )} />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <div className="text-xs">
                    <span className="font-medium">{config.label}</span>
                    <span className="text-muted-foreground ml-1">
                      {result.allowed ? '✓ Autorisé' : '✗ Bloqué'}
                    </span>
                    {!result.allowed && result.reason && (
                      <p className="text-muted-foreground mt-1 max-w-[200px]">
                        {result.reason}
                      </p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          <span className={REALM_LABELS[senderRealm].color}>{REALM_LABELS[senderRealm].label}</span>
          {' → '}
          <span className={REALM_LABELS[receiverRealm].color}>{REALM_LABELS[receiverRealm].label}</span>
        </span>
        <span className={cn(
          "font-medium",
          allowedCount === 4 ? "text-success" : 
          allowedCount > 0 ? "text-warning" : 
          "text-destructive"
        )}>
          {allowedCount}/4
        </span>
      </div>
      
      <div className="flex gap-1.5">
        {results.map(({ feature, config, result }) => {
          const Icon = config.icon;
          return (
            <TooltipProvider key={feature}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={cn(
                    "flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium transition-colors",
                    result.allowed 
                      ? `${config.bgColor} ${config.color}`
                      : "bg-muted/50 text-muted-foreground/50"
                  )}>
                    <Icon className="w-3.5 h-3.5" />
                    {showLabels && <span>{config.label}</span>}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  {result.allowed ? (
                    <span className="text-success">Autorisé</span>
                  ) : (
                    <div className="max-w-[250px]">
                      <span className="text-destructive">Bloqué</span>
                      {result.reason && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {result.reason}
                        </p>
                      )}
                      {result.suggestedAlternative && (
                        <p className="text-xs text-primary mt-1">
                          Alternative: {result.suggestedAlternative}
                        </p>
                      )}
                    </div>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
    </div>
  );
}

interface ContactActionsIndicatorProps {
  contactRealm: Realm;
  currentRealm: Realm;
  networkType: NetworkType;
  userScopes: string[];
  onAction?: (channel: CommunicationChannel) => void;
}

/**
 * Action buttons with policy-based enablement for a specific contact
 */
export function ContactActionsIndicator({
  contactRealm,
  currentRealm,
  networkType,
  userScopes,
  onAction,
}: ContactActionsIndicatorProps) {
  const actions: { feature: IcomFeatureName; action: CommunicationChannel }[] = [
    { feature: 'chat', action: 'icom.chat' },
    { feature: 'call', action: 'icom.call' },
    { feature: 'meeting', action: 'icom.meeting' },
  ];

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1">
        {actions.map(({ feature, action }) => {
          const config = FEATURE_CONFIG[feature];
          const Icon = config.icon;
          const result = canCommunicate({
            senderRealm: currentRealm,
            receiverRealm: contactRealm,
            networkType,
            userScopes,
            channel: action,
          });

          return (
            <Tooltip key={feature}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={!result.allowed}
                  onClick={() => result.allowed && onAction?.(action)}
                  className={cn(
                    result.allowed 
                      ? `${config.color} hover:${config.bgColor}`
                      : "text-muted-foreground/30 cursor-not-allowed"
                  )}
                >
                  <Icon className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {result.allowed ? (
                  <span>{config.label}</span>
                ) : (
                  <div className="max-w-[200px]">
                    <span className="text-destructive">{config.label} bloqué</span>
                    {result.reason && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {result.reason}
                      </p>
                    )}
                  </div>
                )}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}

interface PolicyMatrixPanelProps {
  currentRealm: Realm;
  networkType: NetworkType;
  userScopes: string[];
}

/**
 * Full policy matrix panel showing all realm combinations
 */
export function PolicyMatrixPanel({
  currentRealm,
  networkType,
  userScopes,
}: PolicyMatrixPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const realms: Realm[] = ['citizen', 'government', 'business'];
  
  const availableChannels = getAvailableChannels(
    currentRealm,
    currentRealm, // Same realm always has most permissions
    networkType,
    userScopes
  );

  return (
    <div className="rounded-xl border border-border bg-card/50 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-secondary/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Policy Matrix</span>
          <Badge variant="outline" className="text-xs">
            {REALM_LABELS[currentRealm].label}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {availableChannels.length} canaux disponibles
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Info className="w-3 h-3" />
                <span>Canaux disponibles depuis votre realm vers les autres</span>
              </div>

              {realms.map(targetRealm => (
                <div key={targetRealm} className="p-3 rounded-lg bg-secondary/30">
                  <PolicyIndicator
                    senderRealm={currentRealm}
                    receiverRealm={targetRealm}
                    networkType={networkType}
                    userScopes={userScopes}
                    showLabels={true}
                  />
                </div>
              ))}

              <div className="flex items-start gap-2 p-2 rounded-lg bg-primary/5 border border-primary/10">
                <AlertCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div className="text-xs text-muted-foreground">
                  <p>Les restrictions cross-realm protègent les communications sensibles.</p>
                  <p className="mt-1">
                    Réseau: <span className="text-foreground font-medium">{networkType}</span>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface PolicyStatusBadgeProps {
  channel: CommunicationChannel;
  senderRealm: Realm;
  receiverRealm: Realm;
  networkType: NetworkType;
  userScopes: string[];
}

/**
 * Simple status badge for a specific channel
 */
export function PolicyStatusBadge({
  channel,
  senderRealm,
  receiverRealm,
  networkType,
  userScopes,
}: PolicyStatusBadgeProps) {
  const result = canCommunicate({
    senderRealm,
    receiverRealm,
    networkType,
    userScopes,
    channel,
  });

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className={cn(
              "text-xs gap-1",
              result.allowed
                ? "border-success/30 text-success bg-success/10"
                : "border-destructive/30 text-destructive bg-destructive/10"
            )}
          >
            {result.allowed ? (
              <Check className="w-3 h-3" />
            ) : (
              <X className="w-3 h-3" />
            )}
            {channel.replace('icom.', '').replace('i', 'i')}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          {formatPolicyReason(result)}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
