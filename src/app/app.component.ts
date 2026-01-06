import { Component, OnInit } from '@angular/core';
import { IdleService } from './services/idle.service';
import { SessionService } from './services/session.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'simoge_front';

  constructor(    
	private idleService: IdleService,
    private sessionService: SessionService){

  }

  ngOnInit(): void {
	    // Iniciar monitoreo solo si hay sesión activa
    if (this.sessionService.isLoggedIn()) {
      this.idleService.startWatching();
    }
  }
}
