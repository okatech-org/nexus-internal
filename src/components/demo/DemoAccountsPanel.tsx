import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Shield, 
  Building, 
  Bot, 
  User,
  Check,
  ChevronDown,
  ChevronUp,
  X,
  Crown,
  Briefcase,
  UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDemo } from '@/contexts/DemoContext';
import { DemoAccount } from '@/types/demo-accounts';
import { cn } from '@/lib/utils';

interface DemoAccountsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenComms: () => void;
}

const modeIcons = {
  platform_admin: Crown,
  tenant_admin: Building,
  service: Bot,
  delegated: UserCheck,
};

const modeColors = {
  platform_admin: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  tenant_admin: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  service: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  delegated: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

const modeLabels = {
  platform_admin: 'Platform Admin',
  tenant_admin: 'Tenant Admin',
  service: 'Service Account',
  delegated: 'Delegated Actor',
};

export function DemoAccountsPanel({ isOpen, onClose, onOpenComms }: DemoAccountsPanelProps) {
  const { demoAccounts, activeProfile, switchProfile, effectiveModules } = useDemo();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  const handleSelect = (account: DemoAccount) => {
    switchProfile(account.id);
  };
  
  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          />
          
          <motion.div
            initial={{ opacity: 0, x: -400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -400 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-6 top-6 bottom-6 z-50 w-[420px] glass-strong rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Demo Accounts</h2>
                    <p className="text-xs text-muted-foreground">Switch profile in 1 click</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon-sm" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Active Profile Status */}
              {activeProfile && (
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="text-xs text-muted-foreground mb-1">Active Profile</div>
                  <div className="font-medium text-foreground text-sm mb-2">{activeProfile.label}</div>
                  <div className="flex flex-wrap gap-1.5 text-[10px]">
                    <span className="px-1.5 py-0.5 rounded bg-secondary text-foreground font-mono">
                      {activeProfile.app_id}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-secondary text-foreground">
                      {activeProfile.tenant_id}
                    </span>
                    <span className={cn(
                      "px-1.5 py-0.5 rounded",
                      activeProfile.network_type === 'government' 
                        ? 'bg-blue-500/20 text-blue-400' 
                        : 'bg-amber-500/20 text-amber-400'
                    )}>
                      {activeProfile.network_type}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-secondary text-foreground">
                      {activeProfile.realm}
                    </span>
                    <span className={cn("px-1.5 py-0.5 rounded border", modeColors[activeProfile.mode])}>
                      {modeLabels[activeProfile.mode]}
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Account List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {demoAccounts.map((account) => {
                const Icon = modeIcons[account.mode];
                const isActive = activeProfile?.id === account.id;
                const isExpanded = expandedId === account.id;
                
                return (
                  <motion.div
                    key={account.id}
                    layout
                    className={cn(
                      "rounded-xl border transition-all overflow-hidden",
                      isActive 
                        ? "border-primary/50 bg-primary/10" 
                        : "border-border bg-secondary/30 hover:bg-secondary/50"
                    )}
                  >
                    <div 
                      className="p-3 cursor-pointer"
                      onClick={() => handleSelect(account)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                          modeColors[account.mode]
                        )}>
                          <Icon className="w-5 h-5" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-foreground text-sm truncate">
                              {account.label}
                            </h4>
                            {isActive && (
                              <Check className="w-4 h-4 text-success shrink-0" />
                            )}
                          </div>
                          
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                            {account.description}
                          </p>
                          
                          <div className="flex flex-wrap gap-1 mt-2">
                            <span className={cn(
                              "text-[10px] px-1.5 py-0.5 rounded border",
                              modeColors[account.mode]
                            )}>
                              {modeLabels[account.mode]}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                              {account.network_type}
                            </span>
                            {account.actor_id && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400">
                                actor: {account.actor_id}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(account.id);
                          }}
                          className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-border overflow-hidden"
                        >
                          <div className="p-3 space-y-2 text-xs">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <span className="text-muted-foreground">App ID:</span>
                                <span className="ml-1 font-mono text-foreground">{account.app_id}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Tenant:</span>
                                <span className="ml-1 font-mono text-foreground">{account.tenant_id}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Network:</span>
                                <span className="ml-1 font-mono text-foreground">{account.network || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Realm:</span>
                                <span className="ml-1 text-foreground">{account.realm}</span>
                              </div>
                            </div>
                            
                            <div>
                              <span className="text-muted-foreground">Desired Modules:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {Object.entries(account.desired_modules).map(([mod, enabled]) => (
                                  <span 
                                    key={mod}
                                    className={cn(
                                      "px-1.5 py-0.5 rounded text-[10px]",
                                      enabled 
                                        ? "bg-success/20 text-success" 
                                        : "bg-muted text-muted-foreground line-through"
                                    )}
                                  >
                                    {mod}
                                  </span>
                                ))}
                              </div>
                            </div>
                            
                            {account.permissions.length > 0 && (
                              <div>
                                <span className="text-muted-foreground">Permissions:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {account.permissions.map(perm => (
                                    <span 
                                      key={perm}
                                      className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px]"
                                    >
                                      {perm}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
            
            {/* Footer Actions */}
            <div className="p-4 border-t border-border space-y-2">
              {/* Effective Modules Status */}
              <div className="p-3 rounded-lg bg-secondary/30">
                <div className="text-xs text-muted-foreground mb-2">Effective Modules</div>
                <div className="flex flex-wrap gap-1.5">
                  {effectiveModules.map(mod => (
                    <div 
                      key={mod.name}
                      className={cn(
                        "px-2 py-1 rounded text-xs flex items-center gap-1",
                        mod.enabled 
                          ? "bg-success/20 text-success" 
                          : "bg-destructive/20 text-destructive"
                      )}
                      title={mod.disabled_reason}
                    >
                      {mod.enabled ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      {mod.name}
                      {mod.disabled_reason && (
                        <span className="text-[10px] opacity-70">({mod.disabled_reason})</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <Button 
                variant="default" 
                className="w-full"
                onClick={() => {
                  onClose();
                  onOpenComms();
                }}
              >
                Open Comms Center
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
