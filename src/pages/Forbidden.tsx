import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldX, ArrowLeft, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export default function Forbidden() {
  const { payload, logout } = useAuth();
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center"
      >
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-destructive/20 flex items-center justify-center">
          <ShieldX className="w-10 h-10 text-destructive" />
        </div>
        
        <h1 className="text-3xl font-bold text-foreground mb-3">
          Accès Refusé
        </h1>
        
        <p className="text-muted-foreground mb-6">
          Vous n'avez pas les permissions nécessaires pour accéder à cette ressource.
        </p>
        
        {payload && (
          <div className="mb-6 p-4 rounded-xl glass text-left">
            <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Votre session actuelle
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mode</span>
                <span className="font-mono text-foreground">{payload.mode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Realm</span>
                <span className="font-mono text-foreground">{payload.realm}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Scopes</span>
                <span className="font-mono text-foreground">{payload.scopes?.length || 0}</span>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/demo-accounts">
            <Button variant="default">
              Changer de compte
            </Button>
          </Link>
          <Link to="/">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à l'accueil
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
