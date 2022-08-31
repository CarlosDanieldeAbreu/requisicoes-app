import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FuncionarioRoutingModule } from './funcionario-routing.module';
import { FunciionarioComponent } from './funciionario.component';
import { FuncionarioComponent } from './funcionario.component';


@NgModule({
  declarations: [
    FunciionarioComponent,
    FuncionarioComponent
  ],
  imports: [
    CommonModule,
    FuncionarioRoutingModule
  ]
})
export class FuncionarioModule { }
