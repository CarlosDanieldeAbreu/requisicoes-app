import { Component, OnInit, TemplateRef } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { Departamento } from '../departamentos/models/departamento.model';
import { DepartamentoService } from '../departamentos/services/departamento.service';
import { Equipamento } from '../equipamentos/models/equipamento.model';
import { EquipamentoService } from '../equipamentos/services/equipamento.service';
import { Requisicao } from './models/requisicao.model';
import { RequisicaoService } from './services/requisicao.service';

@Component({
  selector: 'app-requisicao',
  templateUrl: './requisicao.component.html',
})
export class RequisicaoComponent implements OnInit {
  public departamentos$: Observable<Departamento[]>
  public equipamentos$: Observable<Equipamento[]>;
  public requisicoes$: Observable<Requisicao[]>;
  public form: FormGroup;

  constructor(
    private requisicaoService: RequisicaoService,
    private departamentoService: DepartamentoService,
    private equipamentoService: EquipamentoService,
    private modalServise: NgbModal,
    private fb: FormBuilder,
    private toastrService: ToastrService) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      id: new FormControl(""),
      data: new FormControl(""),
      descricao: new FormControl("", [Validators.required, Validators.minLength(4)]),
      equipamentoId: new FormControl("", [Validators.required]),
      equipamento: new FormControl(""),
      departamentoId: new FormControl("", [Validators.required]),
      departamento: new FormControl(""),
    });

    this.requisicoes$ = this.requisicaoService.selecionarTodos();
    this.departamentos$ = this.departamentoService.selecionarTodos();
    this.equipamentos$ = this.equipamentoService.selecionarTodos();
  }

  get tituloModal(): string {
    return this.id?.value ? "Atualização" : "Cadastro";
  }

  get id(): AbstractControl | null {
    return this.form.get("id");
  }

  get data(){
    return this.form.get("data");
  }

  get descricao(): AbstractControl | null {
    return this.form.get("descricao");
  }

  get equipamentoId(): AbstractControl | null {
    return this.form.get("equipamentoId");
  }

  get departamentoId(): AbstractControl | null {
    return this.form.get("departamentoId");
  }

  public async gravar(modal: TemplateRef<any>, requisicao?: Requisicao) {
    this.form.reset();

    if (requisicao){
      const departamento = requisicao.departamento ? requisicao.departamento: null;
      const equipamento = requisicao.equipamento ? requisicao.equipamento: null;

      const requisicaoCompleta = {
        ...requisicao,
        departamento,
        equipamento
      }

      this.form.setValue(requisicaoCompleta);
    }

    try {
      await this.modalServise.open(modal).result;

      let tipo: string;
      let tipo2: string;

      if(this.form.dirty && this.form.valid){
        if (!requisicao) {
          await this.requisicaoService.inserir(this.form.value);
          tipo = "inserida";
          tipo2 = "Cadastro";
        }
        else {
          await this.requisicaoService.editar(this.form.value);
          tipo = "editada";
          tipo2 = "Edição";
        }

        this.toastrService.success(`A requisição foi ${tipo} com sucesso`, `${tipo2} de requisições`);
      }else
        this.toastrService.error(`O formulário precisa ser preenchido!.`, `Cadastro de requisições`);

    } catch (error) {
      let tipo: string;
      let tipo2: string;
      if (error != "fechar" && error != "0" && error != "1") {
        if (!requisicao) {
          tipo = "inserir";
          tipo2 = "Cadastro";
        }
        else {
          tipo = "editar";
          tipo2 = "Edição";
        }

        this.toastrService.error(`Houve um erro ao ${tipo} requisição. Tente novamente`, `${tipo2} de requisições`);
      }
    }
  }

  public async excluir(requisicao: Requisicao) {
    try {
      await this.requisicaoService.excluir(requisicao);
      this.toastrService.success(`A requisição foi excluida com sucesso`, `Exclusão de requisições`);
    } catch (error) {
      this.toastrService.error(`Houve um erro ao excluir requisição. Tente novamente`, `Exclusão de requisições`);
    }
  }
}
