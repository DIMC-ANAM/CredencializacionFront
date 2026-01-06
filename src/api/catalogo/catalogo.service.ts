import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CatalogoService {

  urlBase: String = environment.baseurl + "catalogo/";

  constructor(private http: HttpClient) { }

  consultarTipoDocumento() {
    return this.http.get(this.urlBase + 'consultarTipoDocumento');
  }
  consultarTema() {
    return this.http.get(this.urlBase + 'consultarTema');
  }
  consultarPrioridad() {
    return this.http.get(this.urlBase + 'consultarPrioridad');
  }
  consultarMedioRecepcion() {
    return this.http.get(this.urlBase + 'consultarMedioRecepcion');
  }
  consultarUnidadAdministrativa(data:any) {
    return this.http.post(this.urlBase + 'consultarUnidadAdministrativa', data);
  }
  consultarInstruccion(data:any) {
    return this.http.post(this.urlBase + 'consultarInstruccion', data);
  }
  consultarDependencia(data:any) {
    return this.http.post(this.urlBase + 'consultarDependencia', data);
  }
  consultarUsuarioRol(data:any) {
    return this.http.post(this.urlBase + 'consultarUsuarioRol', data);
  }
  consultarCantidadesStatus(data:any) {
    return this.http.post(this.urlBase + 'consultarCantidadesStatus', data);
  }
    consultarDeterminantes(data:any) {
    return this.http.post(this.urlBase + 'consultarDeterminantes', data);
  }
  insertarDeterminantes(data:any){
    return this.http.post(this.urlBase + 'insertarDeterminantes', data);
  }
  actualizarDeterminantes(data:any){
    return this.http.post(this.urlBase + 'actualizarDeterminantes', data);
  }
  desactivarDeterminantes(data:any){
    return this.http.post(this.urlBase + 'desactivarDeterminantes', data);
  }
  actualizarTema(data:any){
    return this.http.post(this.urlBase + 'actualizarTema', data);
  }
  desactivarTema(data:any){
    return this.http.post(this.urlBase + 'desactivarTema', data);
  }
  actualizarPrioridad(data:any){
    return this.http.post(this.urlBase + 'actualizarPrioridad', data);
  }
  desactivarPrioridad(data:any){
    return this.http.post(this.urlBase + 'desactivarPrioridad', data);
  }
  registrarTema(data:any){ 
    return this.http.post(this.urlBase + 'registrarTema', data); 
  }
  registrarPrioridad(data:any){
    return this.http.post(this.urlBase + 'registrarPrioridad', data); 
  }
  registrarTipoDocumento(data: { tipoDocumento: string }) {
    return this.http.post(this.urlBase + 'registrarTipoDocumento', data);
  }

  actualizarTipoDocumento(data: { idTipoDocumento: number; tipoDocumento: string }) {
    return this.http.post(this.urlBase + 'actualizarTipoDocumento', data);
  }

  desactivarTipoDocumento(data: { idTipoDocumento: number }) {
    return this.http.post(this.urlBase + 'activarTipoDocumento', data);
  }

  verReporte(data: { fechaInicio: string | null; fechaFin: string | null }) {
    return this.http.post(this.urlBase + 'verReporte', data);
  }
  
    busquedaAvanzadaTurnados(data: any) {
    return this.http.post(this.urlBase + 'busquedaAvanzadaTurnados', data);
  }
  
}

