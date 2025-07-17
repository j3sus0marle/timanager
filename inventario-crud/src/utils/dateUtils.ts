/**
 * Utilidades para el manejo de fechas con zona horaria de Mexicali, Baja California
 * Zona horaria: America/Tijuana (UTC-8 en invierno, UTC-7 en verano)
 */

export class DateUtils {
  private static readonly MEXICALI_TIMEZONE = 'America/Tijuana';

  /**
   * Obtiene la fecha actual en zona horaria de Mexicali
   */
  static getCurrentDateInMexicali(): Date {
    const now = new Date();
    const mexicaliTime = new Date(now.toLocaleString("en-US", { timeZone: this.MEXICALI_TIMEZONE }));
    return mexicaliTime;
  }

  /**
   * Formatea una fecha en formato español mexicano (dd/mm/yyyy)
   * @param date - Fecha a formatear (opcional, usa fecha actual de Mexicali si no se proporciona)
   */
  static formatDateToMexicanFormat(date?: Date): string {
    const dateToFormat = date || this.getCurrentDateInMexicali();
    return dateToFormat.toLocaleDateString('es-MX', { 
      timeZone: this.MEXICALI_TIMEZONE,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  /**
   * Formatea una fecha para formularios HTML (yyyy-mm-dd)
   * @param date - Fecha a formatear (opcional, usa fecha actual de Mexicali si no se proporciona)
   */
  static formatDateForInput(date?: Date): string {
    const dateToFormat = date || this.getCurrentDateInMexicali();
    return dateToFormat.toLocaleDateString('en-CA', { 
      timeZone: this.MEXICALI_TIMEZONE
    }); // 'en-CA' da formato YYYY-MM-DD
  }

  /**
   * Convierte una fecha recibida del backend a fecha de Mexicali
   * @param dateString - String de fecha en formato ISO
   */
  static parseFromBackend(dateString: string): Date {
    if (!dateString) {
      return this.getCurrentDateInMexicali();
    }

    const date = new Date(dateString);
    return new Date(date.toLocaleString("en-US", { timeZone: this.MEXICALI_TIMEZONE }));
  }

  /**
   * Convierte una fecha de input HTML a string ISO para enviar al backend
   * @param inputDate - Fecha del input en formato YYYY-MM-DD
   */
  static formatForBackend(inputDate: string): string {
    if (!inputDate) {
      return this.getCurrentDateInMexicali().toISOString();
    }

    // Crear fecha en zona horaria de Mexicali
    const [year, month, day] = inputDate.split('-').map(Number);
    const mexicaliDate = new Date();
    mexicaliDate.setFullYear(year, month - 1, day);
    mexicaliDate.setHours(12, 0, 0, 0); // Mediodía para evitar problemas de zona horaria
    
    return mexicaliDate.toISOString();
  }

  /**
   * Obtiene la fecha de hoy formateada para input HTML
   */
  static getTodayForInput(): string {
    return this.formatDateForInput();
  }

  /**
   * Verifica si una fecha es válida
   */
  static isValidDate(date: any): boolean {
    return date instanceof Date && !isNaN(date.getTime());
  }

  /**
   * Convierte fecha de MongoDB/backend a formato de input
   */
  static dateToInputFormat(mongoDate: string | Date): string {
    if (!mongoDate) {
      return this.getTodayForInput();
    }

    const date = typeof mongoDate === 'string' ? new Date(mongoDate) : mongoDate;
    return this.formatDateForInput(date);
  }
}
