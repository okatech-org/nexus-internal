import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Key, Shield, Clock, AlertTriangle, CheckCircle, XCircle, 
  RefreshCw, Trash2, Copy, Eye, EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { decodeJwt } from '@/lib/auth/jwt';
import { groupScopes } from '@/lib/auth/scopes';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function JwtInspector() {
  const { 
    session, 
    payload, 
    expiresIn, 
    refresh, 
    revokeToken, 
    getRevocations,
    isAuthenticated,
    decodedToken 
  } = useAuth();
  
  const [showToken, setShowToken] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [revocations, setRevocations] = useState<string[]>([]);
  
  useEffect(() => {
    setRevocations(getRevocations());
  }, [getRevocations]);
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const success = await refresh();
      if (success) {
        toast.success('Token refreshed successfully');
        setRevocations(getRevocations());
      } else {
        toast.error('Failed to refresh token');
      }
    } finally {
      setIsRefreshing(false);
    }
  };
  
  const handleRevoke = async () => {
    await revokeToken();
    toast.success('Token revoked and logged out');
  };
  
  const copyToken = () => {
    if (session?.token) {
      navigator.clipboard.writeText(session.token);
      toast.success('Token copied to clipboard');
    }
  };
  
  const formatExpiry = (seconds: number | null) => {
    if (seconds === null) return 'N/A';
    if (seconds <= 0) return 'Expired';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };
  
  const isExpiringSoon = expiresIn !== null && expiresIn < 600; // < 10 minutes
  const groupedScopes = payload?.scopes ? groupScopes(payload.scopes) : {};
  
  if (!isAuthenticated) {
    return (
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
            <Key className="w-5 h-5 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">JWT Inspector</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Connectez-vous pour inspecter votre token JWT.
        </p>
      </div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-neural flex items-center justify-center">
            <Key className="w-5 h-5 text-foreground" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">JWT Inspector</h2>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", isRefreshing && "animate-spin")} />
            Refresh
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleRevoke}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Revoke
          </Button>
        </div>
      </div>
      
      {/* Token Status */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <div className="p-4 rounded-xl bg-secondary/50">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-success" />
            <span className="text-xs text-muted-foreground">Signature</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-success" />
            <span className="font-medium text-foreground">Valid</span>
          </div>
        </div>
        
        <div className="p-4 rounded-xl bg-secondary/50">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Expiration</span>
          </div>
          <div className="flex items-center gap-2">
            {isExpiringSoon ? (
              <AlertTriangle className="w-5 h-5 text-warning" />
            ) : (
              <CheckCircle className="w-5 h-5 text-success" />
            )}
            <span className={cn(
              "font-medium",
              isExpiringSoon ? "text-warning" : "text-foreground"
            )}>
              {formatExpiry(expiresIn)}
            </span>
          </div>
        </div>
        
        <div className="p-4 rounded-xl bg-secondary/50">
          <div className="flex items-center gap-2 mb-2">
            <Key className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">JTI</span>
          </div>
          <div className="flex items-center gap-2">
            {revocations.includes(payload?.jti || '') ? (
              <>
                <XCircle className="w-5 h-5 text-destructive" />
                <span className="font-medium text-destructive">Revoked</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 text-success" />
                <span className="font-medium text-foreground font-mono text-xs truncate">
                  {payload?.jti?.substring(0, 12)}...
                </span>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Token Display */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Token</span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon-sm" onClick={() => setShowToken(!showToken)}>
              {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={copyToken}>
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="p-3 rounded-lg bg-secondary/50 font-mono text-xs break-all">
          {showToken 
            ? session?.token 
            : `${session?.token?.substring(0, 20)}${'•'.repeat(50)}${session?.token?.substring(session?.token?.length - 10)}`
          }
        </div>
      </div>
      
      {/* Decoded Header & Payload */}
      <div className="grid gap-4 md:grid-cols-2 mb-6">
        {/* Header */}
        <div>
          <span className="text-sm text-muted-foreground block mb-2">Header</span>
          <ScrollArea className="h-32 p-3 rounded-lg bg-secondary/50">
            <pre className="font-mono text-xs text-foreground">
              {JSON.stringify(decodedToken?.header, null, 2)}
            </pre>
          </ScrollArea>
        </div>
        
        {/* Payload */}
        <div>
          <span className="text-sm text-muted-foreground block mb-2">Payload</span>
          <ScrollArea className="h-32 p-3 rounded-lg bg-secondary/50">
            <pre className="font-mono text-xs text-foreground">
              {JSON.stringify(decodedToken?.payload, null, 2)}
            </pre>
          </ScrollArea>
        </div>
      </div>
      
      {/* Scopes */}
      <div className="mb-6">
        <span className="text-sm text-muted-foreground block mb-2">
          Scopes ({payload?.scopes?.length || 0})
        </span>
        <div className="p-3 rounded-lg bg-secondary/50">
          {Object.entries(groupedScopes).map(([resource, actions]) => (
            <div key={resource} className="flex items-center gap-2 mb-2 last:mb-0">
              <Badge variant="outline" className="font-mono">
                {resource}
              </Badge>
              <div className="flex flex-wrap gap-1">
                {actions.map((action) => (
                  <span 
                    key={action} 
                    className="px-1.5 py-0.5 rounded bg-primary/20 text-primary text-xs font-mono"
                  >
                    {action}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Revocations List */}
      {revocations.length > 0 && (
        <div>
          <span className="text-sm text-muted-foreground block mb-2">
            Revoked JTIs ({revocations.length})
          </span>
          <div className="p-3 rounded-lg bg-destructive/10 max-h-24 overflow-auto">
            {revocations.map((jti) => (
              <div key={jti} className="font-mono text-xs text-destructive">
                {jti}
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
