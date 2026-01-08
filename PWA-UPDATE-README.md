# 🚀 Quick Start - PWA Update System

## Desenvolvimento

```bash
npm run dev
```

✅ Service Worker gerado automaticamente  
✅ Cache desabilitado para ver mudanças instantaneamente  
✅ Modo DEV ativo

## Build para Produção

```bash
npm run build
```

✅ Service Worker gerado com versão única  
✅ Cache otimizado  
✅ Sistema de atualização ativo

## Testando Localmente

### 1. Build de produção
```bash
npm run build
npm start
```

### 2. Abra o app
- Navegue para `http://localhost:3000`
- Abra DevTools → Application → Service Workers
- Veja a versão instalada

### 3. Simular atualização
```bash
# Em outro terminal, faça novo build
npm run build

# Recarregue a página
# A notificação de atualização deve aparecer!
```

## Ver versão atual no console

```javascript
navigator.serviceWorker.getRegistration().then(reg => {
  const mc = new MessageChannel();
  mc.port1.onmessage = e => console.log('📦 Versão:', e.data.version);
  reg.active.postMessage({ type: 'GET_VERSION' }, [mc.port2]);
});
```

## Forçar atualização

```javascript
navigator.serviceWorker.getRegistration().then(reg => {
  reg.update().then(() => console.log('✅ Update iniciado'));
});
```

## 📝 Notas

- `public/sw.js` é gerado automaticamente - não edite manualmente
- Cada build cria uma versão única baseada em timestamp
- Desenvolvimento usa cache mínimo
- Produção usa cache agressivo com estratégias inteligentes

## 🎯 Arquitetura

```
scripts/generate-sw.js
    ↓ (executa no build/dev)
public/sw.js (gerado)
    ↓ (registrado no layout)
Service Worker ativo
    ↓ (detecta updates)
UpdateAvailableNotification
    ↓ (usuário clica)
Atualização suave!
```
