import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sizeFormat',
  standalone: false
})
export class SizeFormatPipe implements PipeTransform {
  transform(bytes: number, decimals: number = 1): string {
    if (bytes === 0) return '0 B';
    if (!bytes || isNaN(bytes)) return '';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const size = bytes / Math.pow(k, i);

    return `${size.toFixed(decimals)} ${sizes[i]}`;
  }
}
