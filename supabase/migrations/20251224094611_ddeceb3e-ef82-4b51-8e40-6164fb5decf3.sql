-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('platform_admin', 'tenant_admin', 'user', 'agent');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);

-- Create tenants table
CREATE TABLE public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  realm TEXT NOT NULL DEFAULT 'government',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tenant_members table (links users to tenants)
CREATE TABLE public.tenant_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member', 'viewer')),
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  joined_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive')),
  UNIQUE (tenant_id, user_id)
);

-- Create applications table
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  app_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  network_type TEXT NOT NULL DEFAULT 'intranet' CHECK (network_type IN ('intranet', 'extranet', 'internet')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create module_settings table
CREATE TABLE public.module_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  module_name TEXT NOT NULL CHECK (module_name IN ('icom', 'iboite', 'iasted', 'icorrespondance')),
  enabled BOOLEAN NOT NULL DEFAULT false,
  settings JSONB DEFAULT '{}',
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (application_id, module_name)
);

-- Create usage_metrics table for analytics
CREATE TABLE public.usage_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('messages', 'calls', 'meetings', 'threads', 'documents', 'ai_requests')),
  count INTEGER NOT NULL DEFAULT 0,
  recorded_at DATE NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE (tenant_id, application_id, metric_type, recorded_at)
);

-- Create invitations table
CREATE TABLE public.invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member', 'viewer')),
  invited_by UUID REFERENCES auth.users(id),
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to check tenant membership
CREATE OR REPLACE FUNCTION public.is_tenant_member(_user_id UUID, _tenant_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.tenant_members
    WHERE user_id = _user_id
      AND tenant_id = _tenant_id
      AND status = 'active'
  )
$$;

-- Function to check tenant admin
CREATE OR REPLACE FUNCTION public.is_tenant_admin(_user_id UUID, _tenant_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.tenant_members
    WHERE user_id = _user_id
      AND tenant_id = _tenant_id
      AND role = 'admin'
      AND status = 'active'
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for user_roles (only platform admins can manage)
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Platform admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'platform_admin'));

-- RLS Policies for tenants
CREATE POLICY "Members can view their tenants" ON public.tenants FOR SELECT USING (
  public.is_tenant_member(auth.uid(), id) OR public.has_role(auth.uid(), 'platform_admin')
);
CREATE POLICY "Platform admins can manage tenants" ON public.tenants FOR ALL USING (public.has_role(auth.uid(), 'platform_admin'));

-- RLS Policies for tenant_members
CREATE POLICY "Members can view tenant members" ON public.tenant_members FOR SELECT USING (
  public.is_tenant_member(auth.uid(), tenant_id) OR public.has_role(auth.uid(), 'platform_admin')
);
CREATE POLICY "Tenant admins can manage members" ON public.tenant_members FOR INSERT WITH CHECK (
  public.is_tenant_admin(auth.uid(), tenant_id) OR public.has_role(auth.uid(), 'platform_admin')
);
CREATE POLICY "Tenant admins can update members" ON public.tenant_members FOR UPDATE USING (
  public.is_tenant_admin(auth.uid(), tenant_id) OR public.has_role(auth.uid(), 'platform_admin')
);

-- RLS Policies for applications
CREATE POLICY "Members can view tenant applications" ON public.applications FOR SELECT USING (
  public.is_tenant_member(auth.uid(), tenant_id) OR public.has_role(auth.uid(), 'platform_admin')
);
CREATE POLICY "Tenant admins can manage applications" ON public.applications FOR INSERT WITH CHECK (
  public.is_tenant_admin(auth.uid(), tenant_id) OR public.has_role(auth.uid(), 'platform_admin')
);
CREATE POLICY "Tenant admins can update applications" ON public.applications FOR UPDATE USING (
  public.is_tenant_admin(auth.uid(), tenant_id) OR public.has_role(auth.uid(), 'platform_admin')
);
CREATE POLICY "Tenant admins can delete applications" ON public.applications FOR DELETE USING (
  public.is_tenant_admin(auth.uid(), tenant_id) OR public.has_role(auth.uid(), 'platform_admin')
);

-- RLS Policies for module_settings
CREATE POLICY "Members can view module settings" ON public.module_settings FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.applications a
    WHERE a.id = application_id
    AND (public.is_tenant_member(auth.uid(), a.tenant_id) OR public.has_role(auth.uid(), 'platform_admin'))
  )
);
CREATE POLICY "Tenant admins can manage module settings" ON public.module_settings FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.applications a
    WHERE a.id = application_id
    AND (public.is_tenant_admin(auth.uid(), a.tenant_id) OR public.has_role(auth.uid(), 'platform_admin'))
  )
);

-- RLS Policies for usage_metrics
CREATE POLICY "Members can view tenant metrics" ON public.usage_metrics FOR SELECT USING (
  public.is_tenant_member(auth.uid(), tenant_id) OR public.has_role(auth.uid(), 'platform_admin')
);
CREATE POLICY "System can insert metrics" ON public.usage_metrics FOR INSERT WITH CHECK (true);

-- RLS Policies for invitations
CREATE POLICY "Tenant admins can view invitations" ON public.invitations FOR SELECT USING (
  public.is_tenant_admin(auth.uid(), tenant_id) OR public.has_role(auth.uid(), 'platform_admin')
);
CREATE POLICY "Tenant admins can create invitations" ON public.invitations FOR INSERT WITH CHECK (
  public.is_tenant_admin(auth.uid(), tenant_id) OR public.has_role(auth.uid(), 'platform_admin')
);

-- Trigger for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON public.tenants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_module_settings_updated_at BEFORE UPDATE ON public.module_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();