import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { DemoAccount, DemoState, EffectiveModule, AppState, NetworkState } from '@/types/demo-accounts';
import { ModuleName, Realm, NetworkType } from '@/types/comms';
import demoAccountsData from '@/mocks/demo-accounts.mock.json';
import appsData from '@/mocks/apps.mock.json';
import networksData from '@/mocks/networks.mock.json';

const STORAGE_KEY = 'comms.demoProfile';

const demoAccounts: DemoAccount[] = demoAccountsData as DemoAccount[];

interface DemoContextType {
  // State
  activeProfile: DemoAccount | null;
  effectiveModules: EffectiveModule[];
  apps: AppState[];
  networks: NetworkState[];
  demoAccounts: DemoAccount[];
  
  // Actions
  switchProfile: (profileId: string) => void;
  clearProfile: () => void;
  updateAppModules: (appId: string, modules: Partial<Record<ModuleName, boolean>>) => void;
  updateNetworkPolicy: (networkId: string, modules: Partial<Record<ModuleName, boolean>>) => void;
  addAppToNetwork: (appId: string, networkId: string) => void;
  
  // Admin checks
  isPlatformAdmin: boolean;
  isTenantAdmin: boolean;
}

const DemoContext = createContext<DemoContextType | null>(null);

function calculateEffectiveModules(
  profile: DemoAccount | null,
  networks: NetworkState[]
): EffectiveModule[] {
  const modules: ModuleName[] = ['icom', 'iboite', 'iasted', 'icorrespondance'];
  
  if (!profile) {
    return modules.map(name => ({ name, enabled: false, disabled_reason: 'NO_PROFILE_SELECTED' }));
  }
  
  const network = networks.find(n => n.network_id === profile.network);
  
  return modules.map(name => {
    // Check desired modules from profile
    const desired = profile.desired_modules[name];
    if (!desired) {
      return { name, enabled: false, disabled_reason: 'MODULE_DISABLED' };
    }
    
    // Check network policy
    if (network && !network.modules_policy[name]) {
      return { name, enabled: false, disabled_reason: 'NETWORK_POLICY' };
    }
    
    // Special iCorrespondance rules
    if (name === 'icorrespondance') {
      // Must be in government network
      if (profile.network_type !== 'government') {
        return { name, enabled: false, disabled_reason: 'NOT_IN_GOV_NETWORK' };
      }
      
      // Realm must be government (or platform for admins)
      if (profile.realm !== 'government' && profile.realm !== 'platform') {
        return { name, enabled: false, disabled_reason: 'REALM_NOT_GOV' };
      }
    }
    
    return { name, enabled: true };
  });
}

export function DemoProvider({ children }: { children: ReactNode }) {
  const [activeProfile, setActiveProfile] = useState<DemoAccount | null>(null);
  const [apps, setApps] = useState<AppState[]>(() => {
    const stored = localStorage.getItem('comms.demoApps');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return appsData as AppState[];
      }
    }
    return appsData as AppState[];
  });
  
  const [networks, setNetworks] = useState<NetworkState[]>(() => {
    const stored = localStorage.getItem('comms.demoNetworks');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return networksData as NetworkState[];
      }
    }
    return networksData as NetworkState[];
  });
  
  const [effectiveModules, setEffectiveModules] = useState<EffectiveModule[]>([]);
  
  // Load profile on mount
  useEffect(() => {
    const storedProfileId = localStorage.getItem(STORAGE_KEY);
    if (storedProfileId) {
      const profile = demoAccounts.find(p => p.id === storedProfileId);
      if (profile) {
        setActiveProfile(profile);
      }
    }
  }, []);
  
  // Recalculate effective modules when profile or networks change
  useEffect(() => {
    setEffectiveModules(calculateEffectiveModules(activeProfile, networks));
  }, [activeProfile, networks]);
  
  // Persist apps and networks to localStorage
  useEffect(() => {
    localStorage.setItem('comms.demoApps', JSON.stringify(apps));
  }, [apps]);
  
  useEffect(() => {
    localStorage.setItem('comms.demoNetworks', JSON.stringify(networks));
  }, [networks]);
  
  const switchProfile = useCallback((profileId: string) => {
    const profile = demoAccounts.find(p => p.id === profileId);
    if (profile) {
      setActiveProfile(profile);
      localStorage.setItem(STORAGE_KEY, profileId);
      
      // Also update the main comms context localStorage
      localStorage.setItem('comms.app_id', profile.app_id);
      localStorage.setItem('comms.tenant_id', profile.tenant_id);
      localStorage.setItem('comms.network_id', profile.network || '');
      localStorage.setItem('comms.network_type', profile.network_type);
      localStorage.setItem('comms.mode', profile.mode === 'delegated' ? 'delegated' : 'service');
      
      if (profile.actor_id) {
        localStorage.setItem('comms.delegated_actor_id', profile.actor_id);
      } else {
        localStorage.removeItem('comms.delegated_actor_id');
      }
      
      if (profile.realm && profile.realm !== 'platform') {
        localStorage.setItem('comms.delegated_realm', profile.realm);
      } else {
        localStorage.removeItem('comms.delegated_realm');
      }
    }
  }, []);
  
  const clearProfile = useCallback(() => {
    setActiveProfile(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);
  
  const updateAppModules = useCallback((appId: string, modules: Partial<Record<ModuleName, boolean>>) => {
    setApps(prev => prev.map(app => 
      app.app_id === appId 
        ? { ...app, enabled_modules: { ...app.enabled_modules, ...modules } }
        : app
    ));
  }, []);
  
  const updateNetworkPolicy = useCallback((networkId: string, modules: Partial<Record<ModuleName, boolean>>) => {
    setNetworks(prev => prev.map(network => 
      network.network_id === networkId 
        ? { ...network, modules_policy: { ...network.modules_policy, ...modules } }
        : network
    ));
  }, []);
  
  const addAppToNetwork = useCallback((appId: string, networkId: string) => {
    setNetworks(prev => prev.map(network => 
      network.network_id === networkId 
        ? { ...network, member_apps: [...new Set([...network.member_apps, appId])] }
        : network
    ));
    
    setApps(prev => prev.map(app => 
      app.app_id === appId 
        ? { ...app, network_id: networkId }
        : app
    ));
  }, []);
  
  const isPlatformAdmin = activeProfile?.mode === 'platform_admin';
  const isTenantAdmin = activeProfile?.mode === 'tenant_admin';
  
  return (
    <DemoContext.Provider
      value={{
        activeProfile,
        effectiveModules,
        apps,
        networks,
        demoAccounts,
        switchProfile,
        clearProfile,
        updateAppModules,
        updateNetworkPolicy,
        addAppToNetwork,
        isPlatformAdmin,
        isTenantAdmin,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
}
