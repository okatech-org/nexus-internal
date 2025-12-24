/**
 * Invite User Dialog
 * Modal form for inviting users to tenant
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, UserPlus, Mail, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const inviteSchema = z.object({
  email: z.string().email('Adresse email invalide').max(255, 'Email trop long'),
  role: z.enum(['admin', 'member', 'viewer']),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

interface InviteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantId: string;
  onSuccess?: () => void;
}

export function InviteUserDialog({ open, onOpenChange, tenantId, onSuccess }: InviteUserDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: '',
      role: 'member',
    },
  });

  const onSubmit = async (values: InviteFormValues) => {
    setIsLoading(true);
    setInviteLink(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Check if user is already invited
      const { data: existingInvite } = await supabase
        .from('invitations')
        .select('id')
        .eq('tenant_id', tenantId)
        .eq('email', values.email)
        .is('accepted_at', null)
        .maybeSingle();

      if (existingInvite) {
        toast.error('Cet utilisateur a déjà été invité');
        setIsLoading(false);
        return;
      }

      // Create invitation
      const { data: invitation, error } = await supabase
        .from('invitations')
        .insert({
          tenant_id: tenantId,
          email: values.email,
          role: values.role,
          invited_by: user?.id,
        })
        .select('token')
        .single();

      if (error) throw error;

      // Generate invite link
      const link = `${window.location.origin}/invite/${invitation.token}`;
      setInviteLink(link);

      toast.success('Invitation envoyée avec succès');
      onSuccess?.();
    } catch (error) {
      console.error('Error creating invitation:', error);
      toast.error('Erreur lors de l\'envoi de l\'invitation');
    } finally {
      setIsLoading(false);
    }
  };

  const copyLink = async () => {
    if (inviteLink) {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Lien copié dans le presse-papier');
    }
  };

  const handleClose = () => {
    form.reset();
    setInviteLink(null);
    setCopied(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            Inviter un utilisateur
          </DialogTitle>
          <DialogDescription>
            Envoyez une invitation pour rejoindre votre organisation
          </DialogDescription>
        </DialogHeader>

        {!inviteLink ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input placeholder="utilisateur@example.com" className="pl-9" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rôle</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez un rôle" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin">Administrateur</SelectItem>
                        <SelectItem value="member">Membre</SelectItem>
                        <SelectItem value="viewer">Lecteur</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Détermine les permissions de l'utilisateur
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Annuler
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Envoyer l'invitation
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-success/10 border border-success/20">
              <p className="text-sm text-success font-medium mb-2">
                Invitation créée avec succès !
              </p>
              <p className="text-sm text-muted-foreground">
                Partagez ce lien avec l'utilisateur pour qu'il rejoigne votre organisation.
              </p>
            </div>

            <div className="flex gap-2">
              <Input 
                value={inviteLink} 
                readOnly 
                className="font-mono text-xs"
              />
              <Button variant="outline" size="icon" onClick={copyLink}>
                {copied ? (
                  <Check className="w-4 h-4 text-success" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>

            <DialogFooter>
              <Button onClick={handleClose}>
                Fermer
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
