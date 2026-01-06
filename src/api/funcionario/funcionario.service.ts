import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FuncionarioService {
  
  urlBase: String = environment.baseurl + "funcionario/";
  constructor(private http: HttpClient) { }

  registraFuncionario(data){
    return this.http.post(this.urlBase + "registraFuncionario",data);
  }

  actualizarCartaFuncionario(data){
    return this.http.post(this.urlBase + "actualizarCartaFuncionario",data);
  }

  validarCURPFuncionario(data){
    return this.http.post(this.urlBase + "validarCURPFuncionario",data);
  }

  obtenerIp() {
    return this.http.get("https://api.ipify.org/?format=json"); 
  }
}
