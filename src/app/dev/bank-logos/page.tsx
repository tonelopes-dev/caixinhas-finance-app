import { BankLogosPreview } from '@/components/dev/bank-logos-preview';

export default function BankLogosPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Logos dos Bancos</h1>
        <p className="text-muted-foreground">
          Visualize e teste todos os logos dos bancos cadastrados no sistema.
        </p>
      </div>
      
      <BankLogosPreview />
    </div>
  );
}