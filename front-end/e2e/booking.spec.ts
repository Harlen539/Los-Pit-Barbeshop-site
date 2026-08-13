import { expect, test } from '@playwright/test';

test('fluxo completo de agendamento como convidado', async ({ page }) => {
  const date = new Date(); date.setDate(date.getDate() + 1);
  const dateValue = date.toISOString().slice(0, 10);
  const startAt = `${dateValue}T12:00:00.000Z`;
  await page.route('**/api/**', async (route) => {
    const url = route.request().url();
    if (url.includes('/auth/refresh')) return route.fulfill({ status: 401, json: { error: 'Sem sessão' } });
    if (url.endsWith('/services')) return route.fulfill({ json: [{ id: 'service-1', name: 'Corte masculino', slug: 'corte', description: 'Corte personalizado.', durationMin: 30, priceCents: 3500, featured: true, active: true }] });
    if (url.endsWith('/professionals')) return route.fulfill({ json: [{ id: 'pro-1', name: 'Profissional Los Pit', slug: 'profissional', specialty: 'Cortes', active: true, services: [{ id: 'service-1', name: 'Corte masculino' }] }] });
    if (url.includes('/availability')) return route.fulfill({ json: [{ professionalId: 'pro-1', professionalName: 'Profissional Los Pit', slots: [startAt], durationMin: 30, totalCents: 3500 }] });
    if (url.endsWith('/appointments') && route.request().method() === 'POST') return route.fulfill({ status: 201, json: { appointment: { id: 'a1', code: 'LP-E2E-1', startAt, endAt: startAt, status: 'CONFIRMED', totalCents: 3500, customerName: 'Cliente Teste', customerPhone: '85999999999', services: [], professional: { id: 'pro-1', name: 'Profissional Los Pit' } }, whatsAppUrl: null } });
    return route.fulfill({ json: {} });
  });
  await page.goto('/agendar');
  await page.getByRole('button', { name: /Corte masculino/ }).click();
  await page.getByRole('button', { name: /Próximo →/ }).click();
  await page.getByRole('button', { name: /Profissional Los Pit/ }).click();
  await page.getByRole('button', { name: /Próximo →/ }).click();
  await page.locator('.date-strip button').nth(1).click();
  await page.getByRole('button', { name: /Próximo →/ }).click();
  await page.getByRole('button', { name: '09:00' }).click();
  await page.getByRole('button', { name: /Próximo →/ }).click();
  await page.getByLabel('Nome completo').fill('Cliente Teste');
  await page.getByLabel('WhatsApp').fill('85999999999');
  await page.getByRole('button', { name: /Próximo →/ }).click();
  await page.getByRole('button', { name: /Confirmar agendamento/ }).click();
  await expect(page.getByText('Horário confirmado')).toBeVisible();
});

test('pula a escolha de profissional quando ele foi selecionado na página inicial', async ({ page }) => {
  await page.route('**/api/**', async (route) => {
    const url = route.request().url();
    if (url.includes('/auth/refresh')) return route.fulfill({ status: 401, json: { error: 'Sem sessão' } });
    if (url.endsWith('/services')) return route.fulfill({ json: [{ id: 'service-1', name: 'Corte masculino', slug: 'corte', description: 'Corte personalizado.', durationMin: 30, priceCents: 3500, featured: true, active: true }] });
    if (url.endsWith('/professionals')) return route.fulfill({ json: [{ id: 'pro-1', name: 'Cyell', slug: 'cyell', specialty: 'Barbeiro', active: true, services: [{ id: 'service-1', name: 'Corte masculino' }] }] });
    if (url.endsWith('/settings')) return route.fulfill({ json: { name: 'Los Pit Barber Shop', timezone: 'America/Fortaleza' } });
    return route.fulfill({ json: {} });
  });

  await page.goto('/');
  await page.locator('.professional').first().getByRole('button', { name: 'Agendar', exact: true }).click();
  await page.getByRole('button', { name: /Corte masculino/ }).click();
  await page.getByRole('button', { name: /Próximo/ }).click();

  await expect(page.getByRole('heading', { name: 'Quando você vem?' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Selecione um profissional' })).not.toBeVisible();
});
