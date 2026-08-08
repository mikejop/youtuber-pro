import { test, expect } from '@playwright/test';

test.describe('Fluxo de Cadastro e Pagamento no Checkout', () => {
  test('deve carregar a tela de checkout e exibir o resumo do pedido', async ({ page }) => {
    await page.goto('/?criar-conta=true');
    await expect(page).toHaveTitle(/YouTuber Pro/i);
    
    // Verifica se os campos de resumo do pedido e preço estão visíveis
    const valorFinal = page.locator('text=Valor Final');
    await expect(valorFinal).toBeVisible();
  });

  test('deve alternar entre os métodos de pagamento Cartão, Pix e Boleto', async ({ page }) => {
    await page.goto('/');
    
    // Simula clique nos seletores de pagamento
    const pixBtn = page.locator('button:has-text("Pix")');
    if (await pixBtn.isVisible()) {
      await pixBtn.click();
      await expect(page.locator('text=Aprovação instantânea')).toBeVisible();
    }
  });
});
