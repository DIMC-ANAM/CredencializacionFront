import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CuentaRoutingModule } from './cuenta-routing.module';
import { LoginComponent } from './login/login.component';
import { PerfilComponent } from './perfil/perfil.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    LoginComponent,
    PerfilComponent
  ],
  imports: [
    CommonModule,
    CuentaRoutingModule,
    FormsModule,
    ReactiveFormsModule


  ]
})
export class CuentaModule { }
