import { Injectable } from '@angular/core';

export enum EstadoAsunto {
  Registrado = 1,
  EnCurso = 2,
  Concluido = 3
}

export enum EstadoTurnado {
  Recibido = 1,
  Visto = 2,
  Atendido = 3,
  Rechazado = 4
}

export enum PrioridadAsunto {
  Alta = 'Alta',
  Media = 'Media',
  Baja = 'Baja'
}

@Injectable({
  providedIn: 'root'
})
export class ColorsEnum {
  private readonly estadoStyles: Record<string, { icon: string; colorClass: string }> = {
    // EstadoAsunto
    ['asunto:Registrado']: {
      icon: 'fas fa-file-alt',
      colorClass: 'bg-deep-blue text-white'
    },
    ['asunto:EnCurso']: {
      icon: 'fas fa-clock',
      colorClass: 'bg-purple text-white'
    },
    ['asunto:Concluido']: {
      icon: 'fas fa-check',
      colorClass: 'bg-success text-white'
    },

    // EstadoTurnado
    ['turnado:Recibido']: {
      icon: 'fas fa-file',
      colorClass: 'bg-deep-blue text-white'
    },
    ['turnado:Visto']: {
      icon: 'fas fa-clock',
      colorClass: 'bg-purple text-white'
    },
    ['turnado:Atendido']: {
      icon: 'fas fa-check',
      colorClass: 'bg-success text-white'
    },
    ['turnado:Rechazado']: {
      icon: 'fas fa-times',
      colorClass: 'bg-secondary text-white'
    }
  };

  private readonly prioridadStyles: Record<PrioridadAsunto, { colorClass: string }> = {
    [PrioridadAsunto.Alta]: { colorClass: 'text-primary ' },/*  text-white */
    [PrioridadAsunto.Media]: { colorClass: 'text-gold ' },/*  text-white */
    [PrioridadAsunto.Baja]: { colorClass: 'text-success ' }/*  text-white */
  };

  getEstadoIcon(idStatusAsunto: number): string {
    const estado = EstadoAsunto[idStatusAsunto];
    return estado ? this.estadoStyles[`asunto:${estado}`]?.icon || 'x-circle' : 'x-circle';
  }

  getEstadoColor(idStatusAsunto: number): string {
    const estado = EstadoAsunto[idStatusAsunto];
    return estado ? this.estadoStyles[`asunto:${estado}`]?.colorClass || '' : '';
  }

  getEstadoTurnadoIcon(idStatusTurnado: number): string {
    const estado = EstadoTurnado[idStatusTurnado];
    return estado ? this.estadoStyles[`turnado:${estado}`]?.icon || 'x-circle' : 'x-circle';
  }

  getEstadoTurnadoColor(idStatusTurnado: number): string {
    const estado = EstadoTurnado[idStatusTurnado];
    return estado ? this.estadoStyles[`turnado:${estado}`]?.colorClass || '' : '';
  }

  getPrioridadColor(prioridad: PrioridadAsunto): string {
    return this.prioridadStyles[prioridad]?.colorClass || '';
  }

}
