/**
 * Policy Debug Panel
 * Real-time visualization of active scopes and applied policies
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  MessageCircle, 
  Phone, 
  Video, 
  Users, 
  Check, 
  X, 
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Eye,
  RefreshCw,
  Zap,
  Lock,
  Network as NetworkIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Realm, NetworkType, IcomFeatureName } from '@/types/comms';
import { 
  canCommunicate, 
  CommunicationChannel, 
  getAvailableChannels,
  getCrossRealmPolicy,
  formatPolicyReason
} from '@/lib/policyEngine';
import { hasIcomFeatureScope, ICOM_FEATURE_SCOPES, groupScopes } from '@/lib/auth/scopes';
import { getUserScopes } from '@/lib/capabilities';

interface PolicyDebugPanelProps {
  currentRealm: Realm;
  networkType: NetworkType;
}

const REALM_CONFIG: Record<Realm, { label: string; color: string; bg: string }> = {
  citizen: { label: 'Citoyen', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  government: { label: 'Gouvernement', color: 'text-primary', bg: 'bg-primary/10' },
  business: { label: 'Entreprise', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
};

const CHANNEL_CONFIG: Record<string, { icon: typeof MessageCircle; label: string; color: string }> = {
  'icom.chat': { icon: MessageCircle, label: 'iChat', color: 'text-blue-500' },
  'icom.call': { icon: Phone, label: 'iAppel', color: 'text-orange-500' },
  'icom.meeting': { icon: Video, label: 'iRéunion', color: 'text-purple-500' },
  'icom.contact': { icon: Users, label: 'iContact', color: 'text-emerald-500' },
};

export function PolicyDebugPanel({ currentRealm, networkType }: PolicyDebugPanelProps) {
  const [userScopes, setUserScopes] = useState<string[]>([]);
  const [expandedSection, setExpandedSection] = useState<string | null>('scopes');
  const [selectedTargetRealm, setSelectedTargetRealm] = useState<Realm>('citizen');

  useEffect(() => {
    const scopes = getUserScopes();
    setUserScopes(scopes);
  }, []);

  const refreshScopes = () => {
    const scopes = getUserScopes();
    setUserScopes(scopes);
  };

  // Group scopes for display
  const groupedScopes = groupScopes(userScopes);
  
  // Calculate feature-level scope status
  const featureScopeStatus: Record<IcomFeatureName, boolean> = {
    chat: hasIcomFeatureScope(userScopes, 'chat'),
    call: hasIcomFeatureScope(userScopes, 'call'),
    meeting: hasIcomFeatureScope(userScopes, 'meeting'),
    contact: hasIcomFeatureScope(userScopes, 'contact'),
  };

  // Get all policy results for current realm combination
  const channels: CommunicationChannel[] = ['icom.chat', 'icom.call', 'icom.meeting', 'icom.contact'];
  const policyResults = channels.map(channel => ({
    channel,
    result: canCommunicate({
      senderRealm: currentRealm,
      receiverRealm: selectedTargetRealm,
      networkType,
      userScopes,
      channel,
    }),
  }));

  // Available channels summary
  const availableChannels = getAvailableChannels(currentRealm, selectedTargetRealm, networkType, userScopes);
  const crossRealmPolicy = getCrossRealmPolicy(currentRealm, selectedTargetRealm);

  const realms: Realm[] = ['citizen', 'government', 'business'];

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Policy Debug</h2>
            <p className="text-xs text-muted-foreground">Scopes & Cross-Realm Policies</p>
          </div>
        </div>
        
        <Button variant="outline" size="sm" onClick={refreshScopes}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Current Context */}
      <div className="mb-4 p-3 rounded-xl bg-secondary/50 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Realm:</span>
          <Badge variant="outline" className={cn("font-medium", REALM_CONFIG[currentRealm].color)}>
            {REALM_CONFIG[currentRealm].label}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Network:</span>
          <Badge variant="outline" className={cn(
            networkType === 'government' ? 'text-primary' : 'text-iboite'
          )}>
            <NetworkIcon className="w-3 h-3 mr-1" />
            {networkType}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Scopes:</span>
          <Badge variant="secondary">{userScopes.length}</Badge>
        </div>
      </div>

      {/* Scopes Section */}
      <div className="mb-4 rounded-xl border border-border overflow-hidden">
        <button
          onClick={() => toggleSection('scopes')}
          className="w-full px-4 py-3 flex items-center justify-between bg-card hover:bg-secondary/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium text-foreground">Active Scopes</span>
            <Badge variant="outline" className="text-xs">{userScopes.length}</Badge>
          </div>
          {expandedSection === 'scopes' ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>

        <AnimatePresence>
          {expandedSection === 'scopes' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 pt-2 border-t border-border space-y-4">
                {/* iCom Feature Scopes */}
                <div>
                  <span className="text-xs text-muted-foreground block mb-2">iCom Feature Scopes</span>
                  <div className="grid grid-cols-2 gap-2">
                    {(['chat', 'call', 'meeting', 'contact'] as IcomFeatureName[]).map(feature => {
                      const config = CHANNEL_CONFIG[`icom.${feature}`];
                      const Icon = config.icon;
                      const hasScope = featureScopeStatus[feature];
                      
                      return (
                        <div
                          key={feature}
                          className={cn(
                            "p-2 rounded-lg border flex items-center justify-between",
                            hasScope ? 'border-success/30 bg-success/5' : 'border-border bg-muted/30'
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <Icon className={cn("w-4 h-4", hasScope ? config.color : 'text-muted-foreground/50')} />
                            <span className={cn(
                              "text-sm font-medium",
                              hasScope ? 'text-foreground' : 'text-muted-foreground'
                            )}>
                              {config.label}
                            </span>
                          </div>
                          {hasScope ? (
                            <Check className="w-4 h-4 text-success" />
                          ) : (
                            <X className="w-4 h-4 text-muted-foreground/50" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* All Scopes Grouped */}
                <div>
                  <span className="text-xs text-muted-foreground block mb-2">All Scopes by Resource</span>
                  <ScrollArea className="max-h-48">
                    <div className="space-y-2">
                      {Object.entries(groupedScopes).length > 0 ? (
                        Object.entries(groupedScopes).map(([resource, actions]) => (
                          <div key={resource} className="flex items-start gap-2">
                            <Badge variant="outline" className="font-mono text-xs shrink-0">
                              {resource}
                            </Badge>
                            <div className="flex flex-wrap gap-1">
                              {actions.map(action => (
                                <span 
                                  key={action}
                                  className="px-1.5 py-0.5 rounded bg-primary/20 text-primary text-xs font-mono"
                                >
                                  {action}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No scopes defined</p>
                      )}
                    </div>
                  </ScrollArea>
                </div>

                {/* Required Scopes Reference */}
                <div className="p-3 rounded-lg bg-muted/30">
                  <span className="text-xs text-muted-foreground block mb-2">
                    <Zap className="w-3 h-3 inline mr-1" />
                    iCom Feature Scope Requirements
                  </span>
                  <div className="space-y-1 text-xs font-mono">
                    <div><span className="text-blue-500">chat:</span> {ICOM_FEATURE_SCOPES.chat.join(' | ')}</div>
                    <div><span className="text-orange-500">call:</span> {ICOM_FEATURE_SCOPES.call.join(' | ')}</div>
                    <div><span className="text-purple-500">meeting:</span> {ICOM_FEATURE_SCOPES.meeting.join(' | ')}</div>
                    <div><span className="text-emerald-500">contact:</span> {ICOM_FEATURE_SCOPES.contact.join(' | ')}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Cross-Realm Policy Section */}
      <div className="mb-4 rounded-xl border border-border overflow-hidden">
        <button
          onClick={() => toggleSection('policy')}
          className="w-full px-4 py-3 flex items-center justify-between bg-card hover:bg-secondary/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium text-foreground">Cross-Realm Policy</span>
            <Badge variant="outline" className="text-xs">{availableChannels.length}/4</Badge>
          </div>
          {expandedSection === 'policy' ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>

        <AnimatePresence>
          {expandedSection === 'policy' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 pt-2 border-t border-border space-y-4">
                {/* Target Realm Selector */}
                <div>
                  <span className="text-xs text-muted-foreground block mb-2">Target Realm</span>
                  <div className="flex gap-2">
                    {realms.map(realm => (
                      <button
                        key={realm}
                        onClick={() => setSelectedTargetRealm(realm)}
                        className={cn(
                          "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all",
                          selectedTargetRealm === realm
                            ? `${REALM_CONFIG[realm].bg} ${REALM_CONFIG[realm].color} border border-current/30`
                            : "bg-secondary text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {REALM_CONFIG[realm].label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Policy Results */}
                <div>
                  <span className="text-xs text-muted-foreground block mb-2">
                    Policy: {REALM_CONFIG[currentRealm].label} → {REALM_CONFIG[selectedTargetRealm].label}
                  </span>
                  <div className="space-y-2">
                    {policyResults.map(({ channel, result }) => {
                      const config = CHANNEL_CONFIG[channel];
                      const Icon = config.icon;
                      
                      return (
                        <div
                          key={channel}
                          className={cn(
                            "p-3 rounded-lg border",
                            result.allowed 
                              ? 'border-success/30 bg-success/5' 
                              : 'border-destructive/30 bg-destructive/5'
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Icon className={cn("w-4 h-4", result.allowed ? config.color : 'text-muted-foreground/50')} />
                              <span className={cn(
                                "font-medium",
                                result.allowed ? 'text-foreground' : 'text-muted-foreground'
                              )}>
                                {config.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {result.allowed ? (
                                <Badge variant="outline" className="text-success border-success/30">
                                  <Check className="w-3 h-3 mr-1" />
                                  Autorisé
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-destructive border-destructive/30">
                                  <X className="w-3 h-3 mr-1" />
                                  Bloqué
                                </Badge>
                              )}
                            </div>
                          </div>
                          {!result.allowed && result.reason && (
                            <div className="mt-2 flex items-start gap-2 text-xs text-muted-foreground">
                              <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
                              <span>{formatPolicyReason(result)}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Raw Policy Matrix */}
                {crossRealmPolicy && (
                  <div className="p-3 rounded-lg bg-muted/30">
                    <span className="text-xs text-muted-foreground block mb-2">Raw Policy Matrix</span>
                    <pre className="text-xs font-mono text-foreground">
                      {JSON.stringify(crossRealmPolicy, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Full Matrix Preview */}
      <div className="rounded-xl border border-border overflow-hidden">
        <button
          onClick={() => toggleSection('matrix')}
          className="w-full px-4 py-3 flex items-center justify-between bg-card hover:bg-secondary/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium text-foreground">Full Policy Matrix</span>
          </div>
          {expandedSection === 'matrix' ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>

        <AnimatePresence>
          {expandedSection === 'matrix' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 pt-2 border-t border-border">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr>
                        <th className="text-left p-2 text-muted-foreground">From → To</th>
                        {realms.map(realm => (
                          <th key={realm} className={cn("p-2 text-center", REALM_CONFIG[realm].color)}>
                            {REALM_CONFIG[realm].label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {realms.map(fromRealm => (
                        <tr key={fromRealm}>
                          <td className={cn("p-2 font-medium", REALM_CONFIG[fromRealm].color)}>
                            {REALM_CONFIG[fromRealm].label}
                          </td>
                          {realms.map(toRealm => {
                            const available = getAvailableChannels(fromRealm, toRealm, networkType, userScopes);
                            return (
                              <td key={toRealm} className="p-2 text-center">
                                <div className="flex justify-center gap-0.5">
                                  {channels.map(channel => {
                                    const config = CHANNEL_CONFIG[channel];
                                    const Icon = config.icon;
                                    const isAllowed = available.includes(channel);
                                    return (
                                      <span
                                        key={channel}
                                        className={cn(
                                          "w-5 h-5 rounded flex items-center justify-center",
                                          isAllowed ? 'bg-success/20' : 'bg-muted'
                                        )}
                                      >
                                        <Icon className={cn(
                                          "w-3 h-3",
                                          isAllowed ? config.color : 'text-muted-foreground/30'
                                        )} />
                                      </span>
                                    );
                                  })}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Legend */}
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  {Object.entries(CHANNEL_CONFIG).map(([channel, config]) => {
                    const Icon = config.icon;
                    return (
                      <div key={channel} className="flex items-center gap-1">
                        <Icon className={cn("w-3 h-3", config.color)} />
                        <span>{config.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
