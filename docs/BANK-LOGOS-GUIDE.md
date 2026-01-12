## Estrutura para Logos de Bancos

### 📂 Localização Recomendada
```
public/images/banks/
├── nubank.png
├── itau.png
├── bradesco.png
├── banco-do-brasil.png
├── santander.png
├── inter.png
├── caixa.png
├── c6.png
├── original.png
├── neon.png
├── picpay.png
├── btg.png
├── xp.png
├── safra.png
├── will.png
└── generic.png (banco padrão)
```

### 📋 Especificações das Imagens

**Formato Recomendado:**
- **Formato**: PNG com fundo transparente
- **Tamanho**: 64x64px ou 128x128px (quadrado)
- **Qualidade**: Alta resolução para telas Retina
- **Peso**: Máximo 10KB por imagem

**Alternativa SVG:**
- Formato SVG para logos vetoriais
- Melhor qualidade e menor tamanho
- Escalabilidade perfeita

### 🔄 Como Usar

```tsx
import { BANKS, getBankById } from '@/lib/banks';
import Image from 'next/image';

// Exemplo de uso no componente
const bank = getBankById('nubank');

<Image 
  src={bank?.logo || '/images/banks/generic.png'} 
  alt={bank?.name || 'Banco'} 
  width={32} 
  height={32}
  className="rounded-lg"
/>
```

### 🎨 Implementação no Modal

Adicionar seletor de banco no formulário de adicionar conta:

```tsx
<Select value={selectedBank} onValueChange={setSelectedBank}>
  <SelectTrigger>
    <SelectValue placeholder="Selecione o banco" />
  </SelectTrigger>
  <SelectContent>
    {BANKS.map((bank) => (
      <SelectItem key={bank.id} value={bank.id}>
        <div className="flex items-center gap-2">
          <Image 
            src={bank.logo} 
            alt={bank.name} 
            width={20} 
            height={20}
            className="rounded"
          />
          {bank.name}
        </div>
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

### 📥 Onde Baixar Logos

1. **Brand Guidelines** dos bancos (melhor qualidade)
2. **LogoSearch.com**
3. **Brandfolder** dos bancos
4. **Flaticon** (ícones genéricos)
5. **SVG Repo** para versões SVG

### ⚡ Otimizações

- Use `next/image` para otimização automática
- Implemente lazy loading
- Considere usar um CDN para logos
- Mantenha fallback para banco genérico