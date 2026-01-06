import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';

/* to exclude loader: 

this.http.get('...', {
  headers: new HttpHeaders({ 'X-Skip-Loader': 'true' })
});

*/

@Injectable({
  providedIn: 'root',
})
export class TurnadoService {
  urlBase: String = environment.baseurl + 'turnado/';

  constructor(private http: HttpClient) {}
  
  consultarTurnados(data:any) {
    return this.http.post(this.urlBase + 'consultarTurnados', data);
  }
  consultarDetalleTurnado(data:any) {
    return this.http.post(this.urlBase + 'consultarDetalleTurnado', data);
  }
  contestarTurnado(data:any) {
    return this.http.post(this.urlBase + 'contestarTurnado', data);
  }
  rechazarTurnado(data:any) {
    return this.http.post(this.urlBase + 'rechazarTurnado', data);
  }
  
  verTurnado(data:any) {
    return this.http.post(this.urlBase + 'verTurnado', data);
  }
  
}
