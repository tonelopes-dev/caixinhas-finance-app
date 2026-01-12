/**
 * Componente para prévia dos logos dos bancos
 * Permite visualizar todos os logos padronizados
 */

"use client"

import React, { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { BANKS } from '@/lib/banks';
import { Search, Download, Eye } from 'lucide-react';

export function BankLogosPreview() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSize, setSelectedSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [showMissing, setShowMissing] = useState(false);

  const filteredBanks = BANKS.filter(bank =>
    bank.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bank.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sizeMap = {
    sm: { px: 32, class: 'w-8 h-8' },
    md: { px: 64, class: 'w-16 h-16' },
    lg: { px: 96, class: 'w-24 h-24' }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Prévia dos Logos dos Bancos
          </CardTitle>
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <Input
                placeholder="Buscar banco..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
                icon={<Search className="w-4 h-4" />}
              />
            </div>
            
            <div className="flex gap-2">
              {(['sm', 'md', 'lg'] as const).map((size) => (
                <Button
                  key={size}
                  variant={selectedSize === size ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedSize(size)}
                >
                  {size.toUpperCase()} ({sizeMap[size].px}px)
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {filteredBanks.map((bank) => (
              <BankLogoCard 
                key={bank.id} 
                bank={bank} 
                size={selectedSize}
                sizeClass={sizeMap[selectedSize].class}
              />
            ))}
          </div>
          
          {filteredBanks.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum banco encontrado para "{searchTerm}"
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Estatísticas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{BANKS.length}</div>
              <div className="text-sm text-muted-foreground">Total de Bancos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{filteredBanks.length}</div>
              <div className="text-sm text-muted-foreground">Exibidos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">128px</div>
              <div className="text-sm text-muted-foreground">Tamanho Padrão</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">PNG</div>
              <div className="text-sm text-muted-foreground">Formato</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function BankLogoCard({ 
  bank, 
  size, 
  sizeClass 
}: { 
  bank: typeof BANKS[0]; 
  size: 'sm' | 'md' | 'lg';
  sizeClass: string;
}) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <Card className="p-3 hover:shadow-md transition-shadow">
      <div className="space-y-2">
        <div className="flex justify-center">
          <div className={`${sizeClass} relative bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden border`}>
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 animate-pulse bg-gray-200 rounded-lg" />
            )}
            
            <Image
              src={bank.logo}
              alt={bank.name}
              width={size === 'sm' ? 32 : size === 'md' ? 64 : 96}
              height={size === 'sm' ? 32 : size === 'md' ? 64 : 96}
              className={`${sizeClass} object-contain ${!imageLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity`}
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                setImageError(true);
                setImageLoaded(true);
              }}
            />
            
            {imageError && (
              <div className="absolute inset-0 flex items-center justify-center bg-red-50 text-red-500 text-xs">
                404
              </div>
            )}
          </div>
        </div>
        
        <div className="text-center space-y-1">
          <div className="font-medium text-xs truncate" title={bank.name}>
            {bank.name}
          </div>
          <div className="text-xs text-muted-foreground">
            {bank.id}
          </div>
          {imageError && (
            <Badge variant="destructive" className="text-xs">
              Não encontrado
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
}