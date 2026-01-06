import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  
  urlBase: String = environment.baseurl + "token/";

  constructor(private http: HttpClient) { }

  generarToken() {
    return this.http.get(this.urlBase + "generarToken");
  }
}
