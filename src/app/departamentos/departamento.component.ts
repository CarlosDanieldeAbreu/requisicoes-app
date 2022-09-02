import { Component, OnInit, TemplateRef } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { Departamento } from './models/departamento.model';
import { DepartamentoService } from './services/departamento.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-departamento',
  templateUrl: './departamento.component.html',
})
export class DepartamentoComponent implements OnInit {

  public departamentos$: Observable<Departamento[]>;
  public form: FormGroup;

  constructor(
    private departamentoService: DepartamentoService,
    private modalServise: NgbModal,
    private fb: FormBuilder,
    private toastrService: ToastrService) { }

  ngOnInit(): void {
    this.departamentos$ = this.departamentoService.selecionarTodos();
    this.form = this.fb.group({
      id: new FormControl(""),
      nome: new FormControl(""),
      telefone: new FormControl("")
    });
  }

  get tituloModal(): string{
    return this.id?.value ? "Atualização" : "Cadastro";
  }

  get id(): AbstractControl | null{
    return this.form.get("id");
  }

  get nome(){
    return this.form.get("nome");
  }

  get telefone(){
    return this.form.get("telefone");
  }

  public async gravar(modal: TemplateRef<any>, departamento?: Departamento){
    this.form.reset();

    if(departamento)
      this.form.setValue(departamento);

    try {
      await this.modalServise.open(modal).result;

      let tipo: string;
      let tipo2: string;

      if (!departamento){
        await this.departamentoService.inserir(this.form.value);
        tipo = "inserido"
        tipo2 = "Cadastro"
      }
      else{
        await this.departamentoService.editar(this.form.value);
        tipo = "editado"
        tipo2 = "Edição"
      }

      this.toastrService.success(`O departamento foi ${tipo} com sucesso`, `${tipo2} de departamentos`);

    } catch (error) {
      let tipo: string;
      let tipo2: string;
      if (error != "fechar" && error != "0" && error != "1") {
        if (!departamento) {
          tipo = "inserir"
          tipo2 = "Cadastro"
        }
        else {
          tipo = "editar"
          tipo2 = "Edição"
        }

        this.toastrService.error(`Houve um erro ao ${tipo} departamento. Tente novamente`, `${tipo2} de departamentos`);
      }
    }
  }

  public async excluir(departamento: Departamento){
    try {
      await this.departamentoService.excluir(departamento);
      this.toastrService.success(`O departamento foi excluido com sucesso`, `Exclusão de departamentos`);
    } catch (error) {
      this.toastrService.error(`Houve um erro ao excluir departamento. Tente novamente`, `Exclusão de departamentos`);
    }
  }
}
