import { expect, test } from '@playwright/test';

const user = { id: 'client-1', name: 'Cliente Los Pit', email: 'cliente@lospit.com', phone: '85999999999', role: 'CLIENT' };
const appointment = {
  id: 'appointment-1', code: 'LP-2026-63F195', startAt: '2030-08-17T15:00:00.000Z', endAt: '2030-08-17T16:00:00.000Z',
  status: 'CONFIRMED', totalCents: 5000, customerName: user.name, customerPhone: user.phone,
  services: [{ serviceId: 'combo', nameSnapshot: 'Corte + barba', priceCents: 5000, durationMin: 60 }],
  professional: { id: 'pro-1', name: 'Eribaldo' }
};

for (const viewport of [{ name: 'desktop', width: 1280, height: 900 }, { name: 'mobile', width: 390, height: 844 }]) {
  test(`área de agendamentos responsiva em ${viewport.name}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.route('**/api/auth/refresh', (route) => route.fulfill({ json: { accessToken: 'test-token', user } }));
    await page.route('**/api/appointments/me', (route) => route.fulfill({ json: [appointment] }));
    await page.goto('/conta/agendamentos');
    await expect(page.getByRole('heading', { name: 'Meus agendamentos' })).toBeVisible();
    await expect(page.getByText('Corte + barba')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cancelar' })).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`agendamentos-${viewport.name}.png`), fullPage: true });
  });
}
