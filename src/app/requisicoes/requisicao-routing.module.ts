import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DetalhesComponent } from './detalhes/detalhes.component';
import { RequisicaoComponent } from './requisicao.component';
import { RequisicoesDepartamentoComponent } from './requisicoes-departamento/requisicoes-departamento.component';
import { RequisicoesFuncionariosComponent } from './requisicoes-funcionarios/requisicoes-funcionarios.component';
import { RequisicaoResolver } from './services/requisicao.resolver';

const routes: Routes = [
  {
    path: "",
    component: RequisicaoComponent,
    children: [
      {path: "", redirectTo: "funcionario", pathMatch: "full"},
      {path: "funcionario", component: RequisicoesFuncionariosComponent},
      {path: "departamento", component: RequisicoesDepartamentoComponent}
    ]
  },
  {path: ":id", component: DetalhesComponent, resolve: { requisicao: RequisicaoResolver }}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RequisicaoRoutingModule { }
