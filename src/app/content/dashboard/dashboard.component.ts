import { Component } from '@angular/core';
import { SessionService } from '../../services/session.service';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  usuario:any= {};
  constructor(private sessionS: SessionService) {}

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.usuario = this.sessionS.getUsuario();
  }

  public openDocument(type: 'manual' | 'privacy' | 'regulation'): void {
    let url: string;

    switch (type) {
      case 'manual':
        url = '/docs/Manual de usuario_SCG_NV.pdf';
        break;
      case 'privacy':
        url = '/docs/Aviso de privacidad SCG.pdf';
        break;
      case 'regulation':
        url = '/docs/RIANAM_2023.pdf';
        break;
      default:
        console.error('Tipo de documento no válido');
        return;
    }

    // Abre el documento en una nueva pestaña/ventana
    window.open(url, '_blank');
  }
}
