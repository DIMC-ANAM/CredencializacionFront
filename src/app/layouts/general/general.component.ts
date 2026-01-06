import { Component, inject } from '@angular/core';
import { SidebarService } from '../../services/sidebar-service.service'; // ajusta el path si es necesario
import { Router } from '@angular/router';
import { UtilsService } from '../../services/utils.service';
import { TipoToast } from '../../../api/entidades/enumeraciones';

@Component({
  selector: 'app-general',
  standalone: false,
  templateUrl: './general.component.html',
  styleUrl: './general.component.scss'
})
export class GeneralComponent {

  constructor(
    private router: Router,
    private utils: UtilsService
  ){}


  sidebarService = inject(SidebarService);
  toggleMenuMovil(){
    
  }	
}
