/**
 * Create Application Dialog
 * Modal form for creating new applications in tenant admin
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, AppWindow } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const applicationSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  description: z.string().max(500, 'La description ne peut pas dépasser 500 caractères').optional(),
  app_id: z.string()
    .min(3, 'L\'identifiant doit contenir au moins 3 caractères')
    .max(50, 'L\'identifiant ne peut pas dépasser 50 caractères')
    .regex(/^[a-z0-9-]+$/, 'L\'identifiant ne peut contenir que des lettres minuscules, chiffres et tirets'),
  network_type: z.enum(['intranet', 'extranet', 'internet']),
});

type ApplicationFormValues = z.infer<typeof applicationSchema>;

interface CreateApplicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantId: string;
  onSuccess?: () => void;
}

export function CreateApplicationDialog({ open, onOpenChange, tenantId, onSuccess }: CreateApplicationDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      name: '',
      description: '',
      app_id: '',
      network_type: 'intranet',
    },
  });

  const onSubmit = async (values: ApplicationFormValues) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase.from('applications').insert({
        tenant_id: tenantId,
        name: values.name,
        description: values.description || null,
        app_id: values.app_id,
        network_type: values.network_type,
        created_by: user?.id,
      });

      if (error) {
        if (error.code === '23505') {
          toast.error('Cet identifiant d\'application existe déjà');
        } else {
          throw error;
        }
        return;
      }

      // Create default module settings
      const { data: newApp } = await supabase
        .from('applications')
        .select('id')
        .eq('app_id', values.app_id)
        .single();

      if (newApp) {
        const modules = ['icom', 'iboite', 'iasted', 'icorrespondance'];
        await supabase.from('module_settings').insert(
          modules.map(module => ({
            application_id: newApp.id,
            module_name: module,
            enabled: module !== 'icorrespondance', // Enable all except icorrespondance by default
            updated_by: user?.id,
          }))
        );
      }

      toast.success('Application créée avec succès');
      form.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error creating application:', error);
      toast.error('Erreur lors de la création de l\'application');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AppWindow className="w-5 h-5 text-primary" />
            Nouvelle application
          </DialogTitle>
          <DialogDescription>
            Créez une nouvelle application pour votre organisation
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de l'application</FormLabel>
                  <FormControl>
                    <Input placeholder="Mon Application" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="app_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Identifiant unique</FormLabel>
                  <FormControl>
                    <Input placeholder="mon-application" {...field} />
                  </FormControl>
                  <FormDescription>
                    Identifiant technique (lettres minuscules, chiffres, tirets)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optionnel)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Description de l'application..." 
                      className="resize-none"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="network_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type de réseau</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez le type de réseau" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="intranet">Intranet (interne)</SelectItem>
                      <SelectItem value="extranet">Extranet (partenaires)</SelectItem>
                      <SelectItem value="internet">Internet (public)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Détermine les règles de sécurité et d'accès
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Créer l'application
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
