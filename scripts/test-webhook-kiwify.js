// Script para testar webhook da Kiwify localmente
const webhookUrl = 'http://localhost:9002/api/webhooks/kiwify';

const testData = {
  order_id: 'teste-123',
  order_status: 'paid',
  webhook_event_type: 'order_approved',
  Customer: {
    email: 'teste@example.com',
    name: 'João da Silva Teste',
    phone: '+5511999999999'
  },
  Product: {
    id: 'caixinhas-finance-pro',
    name: 'Caixinhas Finance Pro'
  },
  subscription_id: 'sub-123',
  subscription_status: 'active'
};

console.log('🧪 Testando webhook da Kiwify...');
console.log('📡 URL:', webhookUrl);
console.log('📦 Dados:', JSON.stringify(testData, null, 2));

fetch(webhookUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testData)
})
.then(response => response.json())
.then(data => {
  console.log('✅ Resposta recebida:', data);
})
.catch(error => {
  console.error('❌ Erro no teste:', error);
});

// Também testar o endpoint GET
fetch(webhookUrl)
.then(response => response.json())
.then(data => {
  console.log('📋 Status do webhook:', data);
})
.catch(error => {
  console.error('❌ Erro ao verificar status:', error);
});