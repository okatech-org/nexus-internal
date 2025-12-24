import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layers, ArrowRight, Users, Key, Server } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [apiUrl, setApiUrl] = useState(import.meta.env.VITE_COMMS_API_URL || 'https://api.ndjobi.okatech.ga');
  const [appId, setAppId] = useState('');
  const [jwtToken, setJwtToken] = useState('');
  
  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate('/');
    return null;
  }
  
  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 gradient-neural opacity-10" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-neural/20 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex flex-col justify-center p-12 lg:p-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center">
              <Layers className="w-7 h-7 text-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">NDJOBI</h1>
              <p className="text-sm text-muted-foreground">Okatech Communications</p>
            </div>
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
            Plateforme de Communication
            <br />
            <span className="text-gradient-primary">100% Interne</span>
          </h2>
          
          <p className="text-lg text-muted-foreground mb-8 max-w-md">
            Architecture app-centric sécurisée. Aucun email externe, 
            traçabilité complète, modules activables par application.
          </p>
          
          <div className="flex flex-wrap gap-3">
            {['iCom', 'iBoîte', 'iAsted', 'iCorrespondance'].map((module) => (
              <span 
                key={module}
                className="px-3 py-1.5 rounded-full glass text-sm text-foreground"
              >
                {module}
              </span>
            ))}
          </div>
        </div>
      </div>
      
      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Mobile branding */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
              <Layers className="w-6 h-6 text-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">NDJOBI</h1>
              <p className="text-xs text-muted-foreground">Sandbox Demo</p>
            </div>
          </div>
          
          <div className="glass rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-foreground mb-2">Connexion</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Connectez-vous avec un token JWT ou utilisez le mode démo
            </p>
            
            <div className="space-y-5">
              <div>
                <Label htmlFor="apiUrl" className="text-sm text-muted-foreground flex items-center gap-2 mb-2">
                  <Server className="w-4 h-4" />
                  API Base URL
                </Label>
                <Input
                  id="apiUrl"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder="https://api.ndjobi.okatech.ga"
                  className="bg-secondary/50"
                />
              </div>
              
              <div>
                <Label htmlFor="appId" className="text-sm text-muted-foreground flex items-center gap-2 mb-2">
                  <Layers className="w-4 h-4" />
                  App ID (optionnel)
                </Label>
                <Input
                  id="appId"
                  value={appId}
                  onChange={(e) => setAppId(e.target.value)}
                  placeholder="my-app-id"
                  className="bg-secondary/50"
                />
              </div>
              
              <div>
                <Label htmlFor="jwt" className="text-sm text-muted-foreground flex items-center gap-2 mb-2">
                  <Key className="w-4 h-4" />
                  JWT Token
                </Label>
                <Textarea
                  id="jwt"
                  value={jwtToken}
                  onChange={(e) => setJwtToken(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIs..."
                  className="bg-secondary/50 min-h-[100px] font-mono text-xs"
                />
              </div>
              
              <Button
                className="w-full"
                size="lg"
                disabled={!jwtToken.trim()}
              >
                Se connecter
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              
              {!jwtToken.trim() && (
                <p className="text-xs text-center text-muted-foreground">
                  Collez un token JWT ou utilisez le mode démo ci-dessous
                </p>
              )}
            </div>
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-card px-3 text-xs text-muted-foreground">ou</span>
              </div>
            </div>
            
            <Button
              variant="neural"
              className="w-full"
              size="lg"
              onClick={() => navigate('/demo-accounts')}
            >
              <Users className="w-4 h-4 mr-2" />
              Mode Démo
            </Button>
            
            <p className="text-xs text-center text-muted-foreground mt-4">
              Accédez à des comptes pré-configurés avec différents niveaux d'accès
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
