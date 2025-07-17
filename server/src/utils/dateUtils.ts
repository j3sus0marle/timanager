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
   * Convierte una fecha recibida del frontend a fecha de Mexicali
   * @param dateString - String de fecha en formato ISO o yyyy-mm-dd
   */
  static parseToMexicaliDate(dateString: string): Date {
    if (!dateString) {
      return this.getCurrentDateInMexicali();
    }

    // Si es solo fecha (YYYY-MM-DD), asumimos que es en zona horaria de Mexicali
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateString.split('-').map(Number);
      // Crear fecha en zona horaria de Mexicali
      const mexicaliDate = new Date();
      mexicaliDate.setFullYear(year, month - 1, day);
      mexicaliDate.setHours(12, 0, 0, 0); // Mediodía para evitar problemas de zona horaria
      return mexicaliDate;
    }

    // Para otros formatos, convertir a zona horaria de Mexicali
    const date = new Date(dateString);
    return new Date(date.toLocaleString("en-US", { timeZone: this.MEXICALI_TIMEZONE }));
  }

  /**
   * Obtiene el timestamp actual en zona horaria de Mexicali para nombres de archivo
   */
  static getCurrentTimestamp(): number {
    return this.getCurrentDateInMexicali().getTime();
  }

  /**
   * Verifica si una fecha es válida
   */
  static isValidDate(date: any): boolean {
    return date instanceof Date && !isNaN(date.getTime());
  }

  /**
   * Formatea fecha para orden de compra (dd/mm/yyyy)
   */
  static formatForOrdenCompra(date?: Date | string): string {
    let dateToFormat: Date;
    
    if (typeof date === 'string') {
      dateToFormat = this.parseToMexicaliDate(date);
    } else if (date instanceof Date) {
      dateToFormat = date;
    } else {
      dateToFormat = this.getCurrentDateInMexicali();
    }

    return this.formatDateToMexicanFormat(dateToFormat);
  }

  /**
   * Obtiene la fecha de inicio del día en zona horaria de Mexicali
   */
  static getStartOfDay(date?: Date): Date {
    const targetDate = date || this.getCurrentDateInMexicali();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    return startOfDay;
  }

  /**
   * Obtiene la fecha de fin del día en zona horaria de Mexicali
   */
  static getEndOfDay(date?: Date): Date {
    const targetDate = date || this.getCurrentDateInMexicali();
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);
    return endOfDay;
  }
}
