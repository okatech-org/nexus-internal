/**
 * Invitation Acceptance Page
 * Allows invited users to join a tenant
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, XCircle, UserPlus, Building, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Invitation {
  id: string;
  email: string;
  role: string;
  expires_at: string;
  tenant: {
    id: string;
    name: string;
    description: string | null;
  };
}

type InviteStatus = 'loading' | 'valid' | 'expired' | 'used' | 'invalid' | 'accepted';

export default function AcceptInvitePage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<InviteStatus>('loading');
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSignUp, setIsSignUp] = useState(true);

  // Check invitation validity
  useEffect(() => {
    const checkInvitation = async () => {
      if (!token) {
        setStatus('invalid');
        return;
      }

      try {
        // Check if user is logged in
        const { data: { user } } = await supabase.auth.getUser();
        setIsLoggedIn(!!user);

        // Fetch invitation
        const { data, error } = await supabase
          .from('invitations')
          .select(`
            id,
            email,
            role,
            expires_at,
            accepted_at,
            tenant:tenant_id (
              id,
              name,
              description
            )
          `)
          .eq('token', token)
          .maybeSingle();

        if (error) throw error;

        if (!data) {
          setStatus('invalid');
          return;
        }

        // Check if already accepted
        if (data.accepted_at) {
          setStatus('used');
          return;
        }

        // Check if expired
        if (new Date(data.expires_at) < new Date()) {
          setStatus('expired');
          return;
        }

        // Type assertion for the tenant join
        const tenant = data.tenant as unknown as { id: string; name: string; description: string | null };
        
        setInvitation({
          id: data.id,
          email: data.email,
          role: data.role,
          expires_at: data.expires_at,
          tenant
        });
        setEmail(data.email);
        setStatus('valid');
      } catch (error) {
        console.error('Error checking invitation:', error);
        setStatus('invalid');
      }
    };

    checkInvitation();
  }, [token]);

  // Accept invitation
  const acceptInvitation = async () => {
    if (!invitation) return;

    setIsAccepting(true);

    try {
      let userId: string;

      // If not logged in, create account or sign in
      if (!isLoggedIn) {
        if (isSignUp) {
          // Sign up new user
          const { data: authData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/`,
              data: {
                full_name: fullName
              }
            }
          });

          if (signUpError) throw signUpError;
          if (!authData.user) throw new Error('Erreur lors de la création du compte');

          userId = authData.user.id;
        } else {
          // Sign in existing user
          const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password
          });

          if (signInError) throw signInError;
          if (!authData.user) throw new Error('Erreur lors de la connexion');

          userId = authData.user.id;
        }
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Utilisateur non connecté');
        userId = user.id;
      }

      // Add user to tenant members
      const { error: memberError } = await supabase
        .from('tenant_members')
        .insert({
          tenant_id: invitation.tenant.id,
          user_id: userId,
          role: invitation.role,
          status: 'active',
          joined_at: new Date().toISOString()
        });

      if (memberError) {
        if (memberError.code === '23505') {
          toast.error('Vous êtes déjà membre de cette organisation');
        } else {
          throw memberError;
        }
        return;
      }

      // Mark invitation as accepted
      await supabase
        .from('invitations')
        .update({ accepted_at: new Date().toISOString() })
        .eq('id', invitation.id);

      setStatus('accepted');
      toast.success('Invitation acceptée avec succès !');

      // Redirect after a short delay
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error: any) {
      console.error('Error accepting invitation:', error);
      toast.error(error.message || 'Erreur lors de l\'acceptation de l\'invitation');
    } finally {
      setIsAccepting(false);
    }
  };

  // Render based on status
  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Vérification de l'invitation...</p>
          </div>
        );

      case 'invalid':
        return (
          <div className="flex flex-col items-center justify-center py-12">
            <XCircle className="w-12 h-12 text-destructive mb-4" />
            <h2 className="text-xl font-semibold mb-2">Invitation invalide</h2>
            <p className="text-muted-foreground text-center mb-6">
              Ce lien d'invitation n'est pas valide ou a été supprimé.
            </p>
            <Button asChild>
              <Link to="/">Retour à l'accueil</Link>
            </Button>
          </div>
        );

      case 'expired':
        return (
          <div className="flex flex-col items-center justify-center py-12">
            <XCircle className="w-12 h-12 text-warning mb-4" />
            <h2 className="text-xl font-semibold mb-2">Invitation expirée</h2>
            <p className="text-muted-foreground text-center mb-6">
              Ce lien d'invitation a expiré. Veuillez demander une nouvelle invitation.
            </p>
            <Button asChild>
              <Link to="/">Retour à l'accueil</Link>
            </Button>
          </div>
        );

      case 'used':
        return (
          <div className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="w-12 h-12 text-success mb-4" />
            <h2 className="text-xl font-semibold mb-2">Invitation déjà utilisée</h2>
            <p className="text-muted-foreground text-center mb-6">
              Cette invitation a déjà été acceptée.
            </p>
            <Button asChild>
              <Link to="/">Accéder à la plateforme</Link>
            </Button>
          </div>
        );

      case 'accepted':
        return (
          <div className="flex flex-col items-center justify-center py-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              <CheckCircle className="w-16 h-16 text-success mb-4" />
            </motion.div>
            <h2 className="text-xl font-semibold mb-2">Bienvenue !</h2>
            <p className="text-muted-foreground text-center mb-6">
              Vous avez rejoint {invitation?.tenant.name} avec succès.
            </p>
            <p className="text-sm text-muted-foreground">Redirection en cours...</p>
          </div>
        );

      case 'valid':
        return (
          <div className="space-y-6">
            {/* Tenant Info */}
            <div className="flex items-center gap-4 p-4 rounded-lg bg-primary/10 border border-primary/20">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Building className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{invitation?.tenant.name}</h3>
                {invitation?.tenant.description && (
                  <p className="text-sm text-muted-foreground">{invitation.tenant.description}</p>
                )}
              </div>
            </div>

            {/* Invitation Details */}
            <div className="text-center">
              <p className="text-muted-foreground">
                Vous êtes invité à rejoindre en tant que{' '}
                <span className="font-medium text-foreground capitalize">{invitation?.role}</span>
              </p>
            </div>

            {/* Auth Form (if not logged in) */}
            {!isLoggedIn && (
              <div className="space-y-4">
                <div className="flex gap-2 p-1 rounded-lg bg-muted">
                  <Button
                    variant={isSignUp ? 'default' : 'ghost'}
                    className="flex-1"
                    onClick={() => setIsSignUp(true)}
                  >
                    Créer un compte
                  </Button>
                  <Button
                    variant={!isSignUp ? 'default' : 'ghost'}
                    className="flex-1"
                    onClick={() => setIsSignUp(false)}
                  >
                    Se connecter
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled
                      className="mt-1.5"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      L'invitation est liée à cette adresse email
                    </p>
                  </div>

                  {isSignUp && (
                    <div>
                      <Label htmlFor="fullName">Nom complet</Label>
                      <Input
                        id="fullName"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Jean Dupont"
                        className="mt-1.5"
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="password">Mot de passe</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="mt-1.5"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Accept Button */}
            <Button
              className="w-full gap-2"
              size="lg"
              onClick={acceptInvitation}
              disabled={isAccepting || (!isLoggedIn && !password)}
            >
              {isAccepting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              {isLoggedIn ? 'Accepter l\'invitation' : isSignUp ? 'Créer mon compte et rejoindre' : 'Se connecter et rejoindre'}
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
              <UserPlus className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Invitation</CardTitle>
            <CardDescription>
              Rejoignez une organisation sur NDJOBI
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderContent()}
          </CardContent>
        </Card>

        <div className="mt-4 text-center">
          <Link 
            to="/" 
            className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3 h-3" />
            Retour à l'accueil
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
