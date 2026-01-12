"use client"

import React from 'react';
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BANKS, searchBanks } from '@/lib/banks';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface BankSelectorProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  showSearch?: boolean;
}

export function BankSelector({ 
  value, 
  onValueChange, 
  placeholder = "Selecione o banco", 
  className,
  disabled = false,
  showSearch = false 
}: BankSelectorProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const filteredBanks = showSearch ? searchBanks(searchQuery) : BANKS;
  
  const selectedBank = BANKS.find(bank => bank.id === value);

  return (
    <div className="space-y-2">
      {showSearch && (
        <div>
          <Label htmlFor="bank-search">Buscar Banco</Label>
          <Input
            id="bank-search"
            placeholder="Digite o nome do banco..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-2"
          />
        </div>
      )}
      
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger className={cn("w-full", className)}>
          <SelectValue placeholder={placeholder}>
            {selectedBank && (
              <div className="flex items-center gap-2">
                <Image 
                  src={selectedBank.logo} 
                  alt={selectedBank.name} 
                  width={20} 
                  height={20}
                  className="rounded"
                  onError={(e) => {
                    // Fallback para imagem genérica se não carregar
                    e.currentTarget.src = '/images/banks/generic.png';
                  }}
                />
                <span className="truncate">{selectedBank.name}</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {filteredBanks.map((bank) => (
            <SelectItem key={bank.id} value={bank.id}>
              <div className="flex items-center gap-2 w-full">
                <Image 
                  src={bank.logo} 
                  alt={bank.name} 
                  width={20} 
                  height={20}
                  className="rounded flex-shrink-0"
                  onError={(e) => {
                    // Fallback para imagem genérica se não carregar
                    e.currentTarget.src = '/images/banks/generic.png';
                  }}
                />
                <span className="truncate">{bank.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// Componente para mostrar logo do banco (sem seletor)
interface BankLogoProps {
  bankId?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showName?: boolean;
}

export function BankLogo({ bankId, size = 'md', className, showName = false }: BankLogoProps) {
  const bank = BANKS.find(b => b.id === bankId) || BANKS.find(b => b.id === 'generic');
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  };

  if (!bank) return null;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Image
        src={bank.logo}
        alt={bank.name}
        width={size === 'sm' ? 16 : size === 'md' ? 24 : 32}
        height={size === 'sm' ? 16 : size === 'md' ? 24 : 32}
        className={cn("rounded", sizeClasses[size])}
        onError={(e) => {
          e.currentTarget.src = '/images/banks/generic.png';
        }}
      />
      {showName && (
        <span className="text-sm font-medium truncate">{bank.name}</span>
      )}
    </div>
  );
}