// Exemplo de como usar o BankSelector no formulário de adicionar conta

import { BankSelector, BankLogo } from '@/components/ui/bank-selector';

// No estado do componente
const [selectedBank, setSelectedBank] = useState<string>('');

// No JSX do formulário
<div className="space-y-2">
  <Label htmlFor="bank">Banco *</Label>
  <BankSelector
    value={selectedBank}
    onValueChange={setSelectedBank}
    placeholder="Escolha seu banco"
    showSearch={true}
  />
</div>

// Para exibir o logo da conta em listas
<BankLogo 
  bankId={account.bankId} 
  size="md" 
  showName={true} 
  className="flex-shrink-0" 
/>

// Para salvar no banco de dados, adicione o campo bankId na tabela accounts:
/*
-- Migration para adicionar campo do banco
ALTER TABLE "Account" ADD COLUMN "bankId" TEXT;
UPDATE "Account" SET "bankId" = 'generic' WHERE "bankId" IS NULL;
*/

// No schema Prisma (prisma/schema.prisma):
/*
model Account {
  id        String   @id @default(cuid())
  name      String
  type      String
  bankId    String   @default("generic") // <- Adicionar esta linha
  balance   Decimal  @db.Decimal(10, 2)
  ownerId   String
  owner     User     @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Transações
  sourceTransactions      Transaction[] @relation("SourceAccount")
  destinationTransactions Transaction[] @relation("DestinationAccount")

  @@map("accounts")
}
*/