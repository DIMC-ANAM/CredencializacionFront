import { Pipe, PipeTransform } from '@angular/core';
import { formatDate } from '@angular/common';

@Pipe({
  name: 'fechaMexico',
  standalone: false
})
export class FechaMexicoPipe implements PipeTransform {
  transform(value: any, mostrarHora: boolean = false, hora: boolean = false): any {
    if (!value) return '';

    let fecha: Date;

    // Si el valor es un string con solo fecha (YYYY-MM-DD), tratamos como local
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      // Evitar interpretación como UTC
      const [year, month, day] = value.split('-').map(Number);
      fecha = new Date(year, month - 1, day); // mes 0-indexed
    } else {
      // Si tiene hora o es ISO, se trata como fecha completa
      fecha = new Date(value.replace('Z', '')); // remove Z para tratar como local
    }

    // Solo hora
    if (hora) {
      return formatDate(fecha, 'HH:mm:ss', 'es-MX');
    }

    const formato = mostrarHora
      ? 'dd-MMM-yyyy HH:mm:ss'
      : 'dd-MMM-yyyy';

    return formatDate(fecha, formato, 'es-MX');
  }
}
