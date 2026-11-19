import { expect, test } from '@playwright/test';

test('a valid user can sign in and reach their authorized area', async ({
  page,
}) => {
  const username = process.env.E2E_USERNAME;
  const password = process.env.E2E_PASSWORD;

  if (!username || !password) {
    throw new Error('Set E2E_USERNAME and E2E_PASSWORD to run this test.');
  }

  await page.goto('/login');
  await page.getByLabel('Usuario').fill(username);
  await page.getByLabel('Contraseña').fill(password);
  await page.getByRole('button', { name: 'Ingresar' }).click();

  await expect(page).toHaveURL(/\/(home|panel)$/);

  if (new URL(page.url()).pathname === '/home') {
    await expect(
      page.getByRole('heading', { name: 'Inicio de sesión exitoso' }),
    ).toBeVisible();
  } else {
    await expect(
      page.getByRole('button', { name: 'Abrir menú de usuario' }),
    ).toBeVisible();
  }
});
