import { test, expect } from '@playwright/test';

test.describe('Gestão de Cofres - Ciclo Completo', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/E-mail/i).fill('clara.beatriz@caixinhas.app');
    await page.getByLabel(/Senha/i).fill('password123');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await page.waitForURL(/.*vaults/, { timeout: 15000 });
  });

  test('Deve criar, editar, convidar e excluir um cofre compartilhado', async ({ page }) => {
    const vaultName = `Cofre Teste ${Date.now()}`;
    const updatedVaultName = `${vaultName} Editado`;

    // 1. Criar Cofre
    await page.getByText('Criar Novo Cofre').click();
    await page.getByPlaceholder(/Ex: Reforma da Casa/i).fill(vaultName);
    await page.getByRole('button', { name: /Continuar/i }).click(); // Imagem
    
    // Passo 2: Selecionar Imagem
    await page.getByRole('button', { name: /Continuar/i }).click(); // Privacidade
    
    // Passo 3: Escolher "Cofre em Conjunto"
    await page.getByText(/Cofre em Conjunto/i).click();
    await page.getByRole('button', { name: /Finalizar e Abrir/i }).click();

    await expect(page.getByText(vaultName)).toBeVisible();
    console.log('✅ Cofre criado com sucesso');

    // 2. Editar e Convidar
    const vaultCard = page.locator('div, button').filter({ hasText: vaultName }).last();
    await vaultCard.locator('button').filter({ has: page.locator('svg.lucide-more-vertical') }).first().click();
    await page.getByRole('menuitem', { name: /Editar Espaço/i }).click();

    // Aba Membros e Enviar Convite
    await page.getByRole('tab', { name: /Membros/i }).click();
    await page.getByPlaceholder(/E-mail do novo membro/i).fill('tonelopes.dev@gmail.com');
    await page.getByRole('button', { name: /Convidar/i }).first().click();
    
    // Se aparecer o modal de confirmação
    const confirmInvite = page.getByRole('button', { name: /Sim, convidar/i });
    if (await confirmInvite.isVisible()) {
        await confirmInvite.click();
    }

    await expect(page.getByText('tonelopes.dev@gmail.com')).toBeVisible();
    console.log('✅ Convite enviado para tonelopes.dev@gmail.com');

    // Aba Geral e Editar Nome
    await page.getByRole('tab', { name: /Geral/i }).click();
    await page.getByPlaceholder(/Ex: Reforma da Casa/i).fill(updatedVaultName);
    await page.getByRole('button', { name: /Salvar Alterações/i }).click();
    
    await expect(page.getByText(updatedVaultName)).toBeVisible();
    console.log('✅ Edição de nome realizada');

    // 3. Excluir Cofre (Zona de Perigo)
    const updatedVaultCard = page.locator('div, button').filter({ hasText: updatedVaultName }).last();
    await updatedVaultCard.locator('button').filter({ has: page.locator('svg.lucide-more-vertical') }).first().click();
    await page.getByRole('menuitem', { name: /Editar Espaço/i }).click();
    
    await page.getByRole('tab', { name: /Ajustes/i }).click();
    await page.getByRole('button', { name: /Excluir Cofre Agora/i }).click();
    
    // Confirmar no AlertDialog
    await page.getByRole('button', { name: /Sim, excluir para sempre/i }).click();
    
    await expect(page.getByText(updatedVaultName)).not.toBeVisible();
    console.log('✅ Cofre excluído com sucesso');
  });

});
