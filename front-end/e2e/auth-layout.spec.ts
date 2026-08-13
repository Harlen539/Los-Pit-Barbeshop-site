import { expect, test } from '@playwright/test';

test('bloco institucional permanece centralizado no login e cadastro', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.route('**/api/auth/refresh', (route) => route.fulfill({ status: 401, json: { error: 'Sem sessão' } }));
  await page.goto('/entrar');
  const hero = page.locator('.auth-image h1');
  const loginBox = await hero.boundingBox();
  await page.getByRole('button', { name: 'Cadastrar' }).click();
  const registerBox = await hero.boundingBox();
  expect(loginBox).not.toBeNull();
  expect(registerBox).not.toBeNull();
  expect(Math.abs((loginBox?.y ?? 0) - (registerBox?.y ?? 0))).toBeLessThan(2);
  expect(registerBox?.y ?? 0).toBeGreaterThan(200);
  expect(registerBox?.y ?? 1000).toBeLessThan(500);
  await page.screenshot({ path: testInfo.outputPath('cadastro-centralizado.png'), fullPage: false });
});

test('cadastro explica qual campo precisa ser corrigido', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.route('**/api/auth/refresh', (route) => route.fulfill({ status: 401, json: { error: 'Sem sessão' } }));
  await page.goto('/entrar');
  await page.getByRole('button', { name: 'Cadastrar' }).click();
  await page.getByLabel('Nome completo').fill('Cliente Teste');
  await page.getByLabel('E-mail').fill('cliente@exemplo.com');
  await page.getByLabel('WhatsApp').fill('85999999999');
  await page.locator('.password-field input').fill('senhafraca');
  await page.getByLabel('Confirmar senha').fill('senhafraca');
  await page.getByLabel(/Aceito os termos/).check();
  await page.getByRole('button', { name: 'Criar conta' }).click();
  await expect(page.getByText('A senha deve conter ao menos uma letra maiúscula.')).toBeVisible();
});
