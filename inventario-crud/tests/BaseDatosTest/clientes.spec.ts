import { expect, test } from '@playwright/test';

// @ts-ignore
const USER = process.env.TEST_USER;
// @ts-ignore
const PASS = process.env.TEST_PASS;

test('CRUD de clientes', async ({ page }) => {
  // Login antes de acceder a clientes
  await page.goto('http://localhost/login');
  await page.getByPlaceholder('Usuario').fill(USER);
  await page.getByPlaceholder('Contraseña').fill(PASS);
  await page.getByRole('button', { name: /Entrar/i }).click();
  await page.waitForURL('**/dashboard', { timeout: 10000 }).catch(() => {});

  // Navega a clientes
  await page.goto('http://localhost/clientes');
  await page.waitForLoadState('networkidle');

  // Espera explícita por el botón para mayor robustez
  const addButton = page.getByRole('button', { name: /Agregar Cliente/i });
  await expect(addButton).toBeVisible({ timeout: 10000 });
  await addButton.click();

  // Llenar campos por label y placeholder reales
  await page.getByLabel('Empresa').fill('Empresa Test');
  await page.getByLabel('Dirección').fill('Dirección Test');
  await page.getByLabel('Teléfono').fill('5551234567');
  // Contacto principal
  await page.getByPlaceholder('Nombre').fill('Contacto Test');
  await page.getByPlaceholder('Puesto').fill('Gerente');
  await page.getByPlaceholder('Correo').fill('contacto@test.com');
  await page.getByPlaceholder('Teléfono').fill('5559876543');
  await page.getByPlaceholder('Ext').fill('101');
  await page.getByRole('button', { name: /Guardar/i }).click();

  // Espera a que desaparezca el modal antes de buscar en la lista
  await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 10000 });

  // Usa la barra de búsqueda para filtrar por la empresa
  const searchBar = page.getByPlaceholder('Buscar por empresa, dirección o contacto...');
  await searchBar.fill('Empresa Test');

  // Busca la fila por la celda de empresa
  const row = page.locator('tbody tr').filter({ has: page.getByText('Empresa Test') });
  await expect(row).toBeVisible({ timeout: 10000 });
  await expect(row.locator('td')).toContainText(['Empresa Test', 'Dirección Test', '5551234567']);

  // Editar cliente
  await row.getByRole('button', { name: /Editar/i }).click();
  await page.getByLabel('Empresa').fill('Empresa Editada');
  await page.getByLabel('Dirección').fill('Dirección Editada');
  await page.getByLabel('Teléfono').fill('5557654321');
  await page.getByPlaceholder('Nombre').fill('Contacto Editado');
  await page.getByPlaceholder('Puesto').fill('Director');
  await page.getByPlaceholder('Correo').fill('editado@test.com');
  await page.getByPlaceholder('Teléfono').fill('5551112222');
  await page.getByPlaceholder('Ext').fill('202');
  await page.getByRole('button', { name: /Guardar/i }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 10000 });

  // Filtra por la empresa editada
  await searchBar.fill('Empresa Editada');

  // Validar cambio
  const rowEdit = page.locator('tbody tr').filter({ has: page.getByText('Empresa Editada') });
  await expect(rowEdit).toBeVisible({ timeout: 10000 });
  await expect(rowEdit.locator('td')).toContainText(['Empresa Editada', 'Dirección Editada', '5557654321']);

  // Eliminar cliente
  page.once('dialog', async (dialog) => {
    expect(dialog.type()).toBe('confirm');
    expect(dialog.message()).toMatch(/¿Eliminar cliente?/);
    await dialog.accept();
  });
  await rowEdit.getByRole('button', { name: /Eliminar/i }).click();

  // Espera a que desaparezca la fila
  await expect(rowEdit).not.toBeVisible({ timeout: 10000 });
});