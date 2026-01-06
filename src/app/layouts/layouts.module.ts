import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeneralComponent } from './general/general.component';
import { SharedModule } from '../components/shared/shared.module';
import { RouterModule } from '@angular/router';
@NgModule({
  declarations: [
    GeneralComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule
  ],
  exports: [
    GeneralComponent
  ]
})
export class LayoutsModule { }