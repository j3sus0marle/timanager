import { expect, test } from '@playwright/test';

// @ts-ignore
const USER = process.env.TEST_USER;
// @ts-ignore
const PASS = process.env.TEST_PASS;
/*
// Si quieres evitar el error, puedes dejar este bloque comentado
// if (!USER || !PASS) {
//   throw new Error('TEST_USER and TEST_PASS environment variables must be set');
// }
*/
test('CRUD de orden de compra', async ({ page }) => {
  // Login
  await page.goto('http://localhost/login');
  await page.getByPlaceholder('Usuario').fill(USER);
  await page.getByPlaceholder('Contraseña').fill(PASS);
  await page.getByRole('button', { name: /Entrar/i }).click();
  await page.waitForURL('**/dashboard', { timeout: 10000 }).catch(() => {});

  // Navega a ordenes de compra
  await page.goto('http://localhost/ordenes-compra');
  await page.waitForLoadState('networkidle');

  // Agregar orden de compra
  const addButton = page.getByRole('button', { name: /Nueva Orden de Compra/i });
  await expect(addButton).toBeVisible({ timeout: 10000 });
  await addButton.click();

  // Espera el modal (corregido: busca el texto dentro del modal)
  await expect(
    page.getByRole('dialog').getByText('Nueva Orden de Compra')
  ).toBeVisible({ timeout: 10000 });

  // Completa el formulario (ajusta los valores según tus datos)
  await page.getByLabel(/Proveedor/i).fill('Proveedor Demo');
  await page.waitForTimeout(1000);
  await page.getByRole('listitem').first().click();

  await page.getByLabel(/Razón Social/i).fill('Razón Social Demo');
  await page.waitForTimeout(1000);
  await page.getByRole('listitem').first().click();

  // Adjunta un PDF de prueba
  const pdfPath = 'tests/OrdenCompraTest/test.pdf';
  await page.setInputFiles('input[type="file"]', pdfPath);

  // Procesa la orden
  await page.getByRole('button', { name: /Revisar Datos/i }).click();
  await expect(page.getByText(/Procesamiento completado/i)).toBeVisible({ timeout: 20000 });

  // Genera la orden
  await page.getByRole('button', { name: /Generar Orden/i }).click();
  await page.waitForTimeout(2000);

  // Verifica que la orden aparece en la lista
  await page.goto('http://localhost/ordenes-compra');
  await page.waitForLoadState('networkidle');
  await expect(page.getByText(/Proveedor Demo/i)).toBeVisible();

  // Edita la orden
  await page.getByRole('button', { name: /Editar/i }).first().click();
  await expect(
    page.getByRole('dialog').getByText('Nueva Orden de Compra')
  ).toBeVisible({ timeout: 10000 });
  await page.getByLabel(/Número de Orden/i).fill('EDITADO-123');
  await page.getByRole('button', { name: /Revisar Datos/i }).click();
  await page.getByRole('button', { name: /Actualizar Orden/i }).click();
  await page.waitForTimeout(2000);

  // Elimina la orden
  await page.goto('http://localhost/ordenes-compra');
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: /Eliminar/i }).first().click();
  await page.waitForTimeout(1000);
  // Acepta el diálogo de confirmación
  page.once('dialog', dialog => dialog.accept());
  await page.waitForTimeout(2000);

  // Verifica que la orden ya no aparece
  await expect(page.getByText(/EDITADO-123/i)).not.toBeVisible();
});