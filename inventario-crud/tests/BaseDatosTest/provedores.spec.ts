import { expect, test } from '@playwright/test';

// @ts-ignore
const USER = process.env.TEST_USER || 'oleal';
// @ts-ignore
const PASS = process.env.TEST_PASS || 'papus';

test('CRUD de proveedores', async ({ page }) => {
  // ---- LOGIN ----
  await page.goto('http://localhost/login');
  await page.getByPlaceholder('Usuario').fill(USER);
  await page.getByPlaceholder('Contraseña').fill(PASS);
  await page.getByRole('button', { name: /Entrar/i }).click();
  await page.waitForURL('**/dashboard', { timeout: 10000 }).catch(() => {});

  // ---- IR A PROVEEDORES ----
  await page.goto('http://localhost/proveedores');
  await page.waitForLoadState('networkidle');

  // ---- AGREGAR ----
  const addButton = page.getByRole('button', { name: /Agregar Proveedor/i });
  await expect(addButton).toBeVisible({ timeout: 10000 });
  await addButton.click();

  const modal = page.getByRole('dialog');
  await expect(modal).toBeVisible({ timeout: 10000 });

  // Campos principales
  await modal.getByPlaceholder('Empresa').fill('Proveedor Test');
  await modal.getByPlaceholder('Dirección').fill('Dirección Proveedor');
  await modal.getByPlaceholder('Teléfono').first().fill('5559876543'); // Teléfono empresa

  // Contacto principal
  await modal.getByPlaceholder('Nombre').fill('Juan Pérez');
  await modal.getByPlaceholder('Puesto').fill('Compras');
  await modal.getByPlaceholder('Correo').fill('juan@test.com');
  await modal.getByPlaceholder('Teléfono').nth(1).fill('5551112222'); // Teléfono contacto
  await modal.getByPlaceholder('Ext').fill('123');

  await modal.getByRole('button', { name: /Guardar/i }).click();
  await expect(modal).not.toBeVisible({ timeout: 10000 });

  // Ver en tabla
  const searchBar = page.getByPlaceholder('Buscar por empresa, dirección o contacto...');
  await searchBar.fill('Proveedor Test');

  const row = page.locator('tbody tr').filter({ has: page.getByText('Proveedor Test') });
  await expect(row).toBeVisible({ timeout: 10000 });
  await expect(row.locator('td')).toContainText(['Proveedor Test', 'Dirección Proveedor', '5559876543']);

  // ---- EDITAR ----
  await row.getByRole('button', { name: /Editar/i }).click();
  const editModal = page.getByRole('dialog');
  await expect(editModal).toBeVisible({ timeout: 10000 });

  await editModal.getByPlaceholder('Empresa').fill('Proveedor Test Editado');
  await editModal.getByPlaceholder('Dirección').fill('Dirección Editada');
  await editModal.getByPlaceholder('Teléfono').first().fill('5553334444'); // Tel empresa editado

  // Editar contacto
  await editModal.getByPlaceholder('Nombre').fill('Ana López');
  await editModal.getByPlaceholder('Puesto').fill('Jefa de Compras');
  await editModal.getByPlaceholder('Correo').fill('ana@test.com');
  await editModal.getByPlaceholder('Teléfono').nth(1).fill('5552223333'); // Tel contacto editado
  await editModal.getByPlaceholder('Ext').fill('321');

  await editModal.getByRole('button', { name: /Guardar/i }).click();
  await expect(editModal).not.toBeVisible({ timeout: 10000 });

  // Confirmar edición
  await searchBar.fill('Proveedor Test Editado');
  const rowEdit = page.locator('tbody tr').filter({ has: page.getByText('Proveedor Test Editado') });
  await expect(rowEdit).toBeVisible({ timeout: 10000 });
  await expect(rowEdit.locator('td')).toContainText(['Proveedor Test Editado', 'Dirección Editada', '5553334444']);

  // ---- ELIMINAR ----
  page.once('dialog', async dialog => {
    expect(dialog.type()).toBe('confirm');
    expect(dialog.message()).toMatch(/¿Eliminar proveedor\?/);
    await dialog.accept();
  });
  await rowEdit.getByRole('button', { name: /Eliminar/i }).click();

  await expect(rowEdit).not.toBeVisible({ timeout: 10000 });
});
