import { Realm, NetworkType, ModuleName } from './comms';

export type DemoAccountMode = 'platform_admin' | 'tenant_admin' | 'service' | 'delegated';

export interface DemoAccount {
  id: string;
  label: string;
  mode: DemoAccountMode;
  tenant_id: string;
  realm: Realm | 'platform';
  app_id: string;
  network: string | null;
  network_type: NetworkType;
  actor_id: string | null;
  desired_modules: Record<ModuleName, boolean>;
  permissions: string[];
  description: string;
}

export interface EffectiveModule {
  name: ModuleName;
  enabled: boolean;
  disabled_reason?: string;
}

export interface DemoState {
  activeProfile: DemoAccount | null;
  effectiveModules: EffectiveModule[];
  apps: AppState[];
  networks: NetworkState[];
}

export interface AppState {
  app_id: string;
  name: string;
  tenant_id: string;
  network_id: string;
  enabled_modules: Record<ModuleName, boolean>;
  status: 'active' | 'inactive';
}

export interface NetworkState {
  network_id: string;
  name: string;
  network_type: NetworkType;
  member_apps: string[];
  modules_policy: Record<ModuleName, boolean>;
}
