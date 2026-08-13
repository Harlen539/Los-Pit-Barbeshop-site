import { expect, test } from '@playwright/test';

const services = [
  { id: '1', name: 'Corte masculino', slug: 'corte', description: 'Corte personalizado com acabamento preciso.', durationMin: 30, priceCents: 3500, featured: true, active: true },
  { id: '2', name: 'Barba', slug: 'barba', description: 'Modelagem, toalha quente e finalização.', durationMin: 30, priceCents: 2500, featured: true, active: true },
  { id: '3', name: 'Corte + barba', slug: 'combo', description: 'Experiência completa de corte e barba.', durationMin: 60, priceCents: 5000, featured: true, active: true },
  { id: '4', name: 'Sobrancelha', slug: 'sobrancelha', description: 'Alinhamento discreto e natural.', durationMin: 15, priceCents: 2000, featured: true, active: true }
];

for (const viewport of [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'tablet', width: 820, height: 1180 },
  { name: 'mobile', width: 390, height: 844 },
  { name: 'mobile-small', width: 320, height: 700 }
]) {
  test(`homepage sem overflow em ${viewport.name}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.route('**/api/**', async (route) => {
      const url = route.request().url();
      if (url.includes('/auth/refresh')) return route.fulfill({ status: 401, json: { error: 'Sem sessão' } });
      if (url.endsWith('/services')) return route.fulfill({ json: services });
      if (url.endsWith('/professionals')) return route.fulfill({ json: [] });
      if (url.endsWith('/settings')) return route.fulfill({ json: { name: 'Los Pit Barber Shop', timezone: 'America/Fortaleza' } });
      return route.fulfill({ json: [] });
    });
    await page.goto('/');
    await expect(page.getByRole('img', { name: /Profissionais da Los Pit/ })).toBeVisible();
    await page.evaluate(() => sessionStorage.setItem('los-pit-loaded', '1'));
    await page.reload();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`home-${viewport.name}.png`), fullPage: true });
  });
}
