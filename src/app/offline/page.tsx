import { WifiOff, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <WifiOff className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-xl">Você está offline</CardTitle>
          <CardDescription>
            Não foi possível conectar com os servidores. Verifique sua conexão com a internet.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 text-sm">
            <p className="text-muted-foreground mb-2">
              <strong>O que você pode fazer:</strong>
            </p>
            <ul className="text-muted-foreground space-y-1 text-sm list-disc list-inside">
              <li>Verifique sua conexão WiFi ou dados móveis</li>
              <li>Tente recarregar a página</li>
              <li>Aguarde a conexão ser reestabelecida</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => window.location.reload()}
              className="w-full"
              size="lg"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Tentar Novamente
            </Button>

            <Button
              onClick={() => window.location.href = '/dashboard'}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <Home className="mr-2 h-4 w-4" />
              Ir para o Início
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}