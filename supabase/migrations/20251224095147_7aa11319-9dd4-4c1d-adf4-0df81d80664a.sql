-- Enable realtime for module_settings table
ALTER TABLE public.module_settings REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.module_settings;

-- Enable realtime for invitations table
ALTER TABLE public.invitations REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.invitations;