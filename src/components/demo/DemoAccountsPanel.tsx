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
  UserCheck,
  Plus,
  Trash2,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useDemo } from '@/contexts/DemoContext';
import { DemoAccount, DemoAccountMode } from '@/types/demo-accounts';
import { ModuleName, NetworkType, Realm } from '@/types/comms';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

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

const defaultFormState = {
  label: '',
  mode: 'service' as DemoAccountMode,
  tenant_id: '',
  realm: 'citizen' as Realm | 'platform',
  app_id: '',
  network: '',
  network_type: 'commercial' as NetworkType,
  actor_id: '',
  description: '',
  desired_modules: {
    icom: true,
    iboite: true,
    iasted: true,
    icorrespondance: false,
  },
};

export function DemoAccountsPanel({ isOpen, onClose, onOpenComms }: DemoAccountsPanelProps) {
  const { 
    demoAccounts, 
    customProfiles,
    activeProfile, 
    switchProfile, 
    effectiveModules,
    createCustomProfile,
    deleteCustomProfile,
    resetDemoState,
  } = useDemo();
  
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formState, setFormState] = useState(defaultFormState);
  
  const handleSelect = (account: DemoAccount) => {
    switchProfile(account.id);
  };
  
  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };
  
  const handleFormChange = (field: string, value: unknown) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };
  
  const handleModuleToggle = (module: ModuleName, enabled: boolean) => {
    setFormState(prev => ({
      ...prev,
      desired_modules: { ...prev.desired_modules, [module]: enabled },
    }));
  };
  
  const handleCreateProfile = () => {
    if (!formState.label.trim() || !formState.app_id.trim() || !formState.tenant_id.trim()) {
      toast.error('Please fill in required fields');
      return;
    }
    
    const newProfile = createCustomProfile({
      label: formState.label,
      mode: formState.mode,
      tenant_id: formState.tenant_id,
      realm: formState.realm,
      app_id: formState.app_id,
      network: formState.network || null,
      network_type: formState.network_type,
      actor_id: formState.mode === 'delegated' ? formState.actor_id : null,
      desired_modules: formState.desired_modules,
      permissions: [],
      description: formState.description || `Custom profile: ${formState.label}`,
    });
    
    toast.success(`Profile "${newProfile.label}" created`);
    setFormState(defaultFormState);
    setShowCreateForm(false);
    switchProfile(newProfile.id);
  };
  
  const handleDeleteProfile = (profileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteCustomProfile(profileId);
    toast.success('Profile deleted');
  };
  
  const handleReset = () => {
    resetDemoState();
    toast.success('Demo state reset to defaults');
  };
  
  const isCustomProfile = (id: string) => customProfiles.some(p => p.id === id);
  
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
            className="fixed left-6 top-6 bottom-6 z-50 w-[460px] glass-strong rounded-2xl shadow-2xl overflow-hidden flex flex-col"
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
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon-sm" 
                    onClick={handleReset}
                    title="Reset demo state"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" onClick={onClose}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
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
            
            {/* Content Area */}
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                {showCreateForm ? (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-4 space-y-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-foreground">Create Custom Profile</h3>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setShowCreateForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                    
                    {/* Form Fields */}
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="label">Profile Name *</Label>
                        <Input
                          id="label"
                          value={formState.label}
                          onChange={e => handleFormChange('label', e.target.value)}
                          placeholder="My Custom Profile"
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label>Mode *</Label>
                        <div className="grid grid-cols-2 gap-2 mt-1">
                          {(['service', 'delegated', 'tenant_admin', 'platform_admin'] as DemoAccountMode[]).map(mode => (
                            <button
                              key={mode}
                              onClick={() => handleFormChange('mode', mode)}
                              className={cn(
                                "p-2 rounded-lg text-xs font-medium transition-all border",
                                formState.mode === mode 
                                  ? modeColors[mode]
                                  : "border-border bg-secondary/30 text-muted-foreground hover:text-foreground"
                              )}
                            >
                              {modeLabels[mode]}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="app_id">App ID *</Label>
                          <Input
                            id="app_id"
                            value={formState.app_id}
                            onChange={e => handleFormChange('app_id', e.target.value)}
                            placeholder="my-app"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="tenant_id">Tenant ID *</Label>
                          <Input
                            id="tenant_id"
                            value={formState.tenant_id}
                            onChange={e => handleFormChange('tenant_id', e.target.value)}
                            placeholder="my-tenant"
                            className="mt-1"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="network">Network ID</Label>
                          <Input
                            id="network"
                            value={formState.network}
                            onChange={e => handleFormChange('network', e.target.value)}
                            placeholder="network-1"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Network Type *</Label>
                          <div className="flex gap-2 mt-1">
                            <button
                              onClick={() => handleFormChange('network_type', 'commercial')}
                              className={cn(
                                "flex-1 py-2 rounded-lg text-xs font-medium transition-all",
                                formState.network_type === 'commercial'
                                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                  : "bg-secondary/30 text-muted-foreground"
                              )}
                            >
                              Commercial
                            </button>
                            <button
                              onClick={() => handleFormChange('network_type', 'government')}
                              className={cn(
                                "flex-1 py-2 rounded-lg text-xs font-medium transition-all",
                                formState.network_type === 'government'
                                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                  : "bg-secondary/30 text-muted-foreground"
                              )}
                            >
                              Government
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Realm *</Label>
                          <select
                            value={formState.realm}
                            onChange={e => handleFormChange('realm', e.target.value)}
                            className="w-full mt-1 bg-secondary/50 rounded-lg px-3 py-2 text-sm text-foreground"
                          >
                            <option value="citizen">Citizen</option>
                            <option value="government">Government</option>
                            <option value="business">Business</option>
                            <option value="platform">Platform</option>
                          </select>
                        </div>
                        {formState.mode === 'delegated' && (
                          <div>
                            <Label htmlFor="actor_id">Actor ID</Label>
                            <Input
                              id="actor_id"
                              value={formState.actor_id}
                              onChange={e => handleFormChange('actor_id', e.target.value)}
                              placeholder="user-123"
                              className="mt-1"
                            />
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Input
                          id="description"
                          value={formState.description}
                          onChange={e => handleFormChange('description', e.target.value)}
                          placeholder="Optional description..."
                          className="mt-1"
                        />
                      </div>
                      
                      {/* Desired Modules */}
                      <div>
                        <Label>Desired Modules</Label>
                        <div className="space-y-2 mt-2">
                          {(['icom', 'iboite', 'iasted', 'icorrespondance'] as ModuleName[]).map(mod => (
                            <div key={mod} className="flex items-center justify-between p-2 rounded-lg bg-secondary/30">
                              <span className="text-sm text-foreground">{mod}</span>
                              <Switch
                                checked={formState.desired_modules[mod]}
                                onCheckedChange={checked => handleModuleToggle(mod, checked)}
                              />
                            </div>
                          ))}
                        </div>
                        {formState.network_type === 'commercial' && formState.desired_modules.icorrespondance && (
                          <p className="text-xs text-warning mt-2">
                            ⚠️ iCorrespondance requires government network
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <Button 
                      variant="default" 
                      className="w-full"
                      onClick={handleCreateProfile}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Profile
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="list"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="p-4 space-y-2"
                  >
                    {/* Create Button */}
                    <Button 
                      variant="outline" 
                      className="w-full mb-3"
                      onClick={() => setShowCreateForm(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Custom Profile
                    </Button>
                    
                    {/* Custom Profiles Section */}
                    {customProfiles.length > 0 && (
                      <div className="mb-4">
                        <div className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
                          <User className="w-3 h-3" />
                          Custom Profiles ({customProfiles.length})
                        </div>
                        {customProfiles.map((account) => (
                          <AccountCard
                            key={account.id}
                            account={account}
                            isActive={activeProfile?.id === account.id}
                            isExpanded={expandedId === account.id}
                            isCustom={true}
                            onSelect={() => handleSelect(account)}
                            onToggleExpand={() => toggleExpand(account.id)}
                            onDelete={(e) => handleDeleteProfile(account.id, e)}
                          />
                        ))}
                      </div>
                    )}
                    
                    {/* Built-in Profiles */}
                    <div className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
                      <Shield className="w-3 h-3" />
                      Built-in Profiles ({demoAccounts.length - customProfiles.length})
                    </div>
                    {demoAccounts
                      .filter(a => !isCustomProfile(a.id))
                      .map((account) => (
                        <AccountCard
                          key={account.id}
                          account={account}
                          isActive={activeProfile?.id === account.id}
                          isExpanded={expandedId === account.id}
                          isCustom={false}
                          onSelect={() => handleSelect(account)}
                          onToggleExpand={() => toggleExpand(account.id)}
                        />
                      ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Footer Actions */}
            {!showCreateForm && (
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
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Account Card Component
interface AccountCardProps {
  account: DemoAccount;
  isActive: boolean;
  isExpanded: boolean;
  isCustom: boolean;
  onSelect: () => void;
  onToggleExpand: () => void;
  onDelete?: (e: React.MouseEvent) => void;
}

function AccountCard({ 
  account, 
  isActive, 
  isExpanded, 
  isCustom,
  onSelect, 
  onToggleExpand,
  onDelete 
}: AccountCardProps) {
  const Icon = modeIcons[account.mode];
  
  return (
    <motion.div
      layout
      className={cn(
        "rounded-xl border transition-all overflow-hidden mb-2",
        isActive 
          ? "border-primary/50 bg-primary/10" 
          : "border-border bg-secondary/30 hover:bg-secondary/50"
      )}
    >
      <div 
        className="p-3 cursor-pointer"
        onClick={onSelect}
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
              {isCustom && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400">
                  Custom
                </span>
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
          
          <div className="flex items-center gap-1">
            {isCustom && onDelete && (
              <button
                onClick={onDelete}
                className="p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand();
              }}
              className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
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
}
