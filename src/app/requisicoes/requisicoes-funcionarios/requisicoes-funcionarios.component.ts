import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subscription } from 'rxjs';
import { AuthenticationService } from 'src/app/auth/services/authentication.service';
import { Departamento } from 'src/app/departamentos/models/departamento.model';
import { DepartamentoService } from 'src/app/departamentos/services/departamento.service';
import { Equipamento } from 'src/app/equipamentos/models/equipamento.model';
import { EquipamentoService } from 'src/app/equipamentos/services/equipamento.service';
import { Funcionario } from 'src/app/funcionarios/models/funcionario.model';
import { FuncionarioService } from 'src/app/funcionarios/services/funcionario.service';
import { Requisicao } from '../models/requisicao.model';
import { RequisicaoService } from '../services/requisicao.service';

@Component({
  selector: 'app-requisicoes-funcionarios',
  templateUrl: './requisicoes-funcionarios.component.html'
})
export class RequisicoesFuncionariosComponent implements OnInit, OnDestroy {
  public departamentos$: Observable<Departamento[]>;
  public equipamentos$: Observable<Equipamento[]>;
  public funcionarios$: Observable<Funcionario[]>;
  public requisicoes$: Observable<Requisicao[]>;
  private processoAutenticado$: Subscription;

  public funcionarioLogado: Funcionario;
  public form: FormGroup;

  constructor(
    private authService: AuthenticationService,
    private requisicaoService: RequisicaoService,
    private departamentoService: DepartamentoService,
    private equipamentoService: EquipamentoService,
    private funcionarioService: FuncionarioService,
    private modalServise: NgbModal,

    private fb: FormBuilder,
    private toastrService: ToastrService) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      id: new FormControl(""),
      descricao: new FormControl("", [Validators.required, Validators.minLength(4)]),
      dataAbertura: new FormControl(""),

      equipamentoId: new FormControl("", [Validators.required]),
      equipamento: new FormControl(""),
      departamentoId: new FormControl("", [Validators.required]),
      departamento: new FormControl(""),
      funcionarioId: new FormControl(""),
      funcionario: new FormControl(""),

      status: new FormControl(""),
      ultimaAtualizacao: new FormControl(""),
      movimentacoes: new FormControl(""),
    });

    this.requisicoes$ = this.requisicaoService.selecionarTodos();
    this.departamentos$ = this.departamentoService.selecionarTodos();
    this.equipamentos$ = this.equipamentoService.selecionarTodos();
    this.funcionarios$ = this.funcionarioService.selecionarTodos();

    this.processoAutenticado$ = this.authService.usuarioLogado.subscribe(usuario => {
      const email: string = usuario?.email!;

      this.funcionarioService.selecionarFuncionarioLogado(email)
        .subscribe(funcionario => {this.funcionarioLogado = funcionario;})
    });
  }

  ngOnDestroy(): void {
    this.processoAutenticado$.unsubscribe();
  }

  get tituloModal(): string {
    return this.id?.value ? "Atualiza????o" : "Cadastro";
  }

  get id(): AbstractControl | null {
    return this.form.get("id");
  }

  get dataAbertura(): AbstractControl | null{
    return this.form.get("dataAbertura");
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

  get funcionarioId(): AbstractControl | null {
    return this.form.get("funcionarioId");
  }

  get ultimaAtualizacao(): AbstractControl | null{
    return this.form.get("ultimaAtualizacao")
  }


  get status(): AbstractControl | null {
    return this.form.get("status")
  }


  public async gravar(modal: TemplateRef<any>, requisicao?: Requisicao) {
    this.form.reset();
    this.configurarValoresPadrao();

    if (requisicao){
      const departamento = requisicao.departamento ? requisicao.departamento: null;
      const equipamento = requisicao.equipamento ? requisicao.equipamento: null;
      const funcionario = requisicao.funcionario ? requisicao.funcionario : null;

      const requisicaoCompleta = {
        ...requisicao,
        funcionario,
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
          tipo2 = "Edi????o";
        }

        this.toastrService.success(`A requisi????o foi ${tipo} com sucesso`, `${tipo2} de requisi????es`);
      }else
        this.toastrService.error(`O formul??rio precisa ser preenchido!.`, `Cadastro de requisi????es`);

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
          tipo2 = "Edi????o";
        }

        this.toastrService.error(`Houve um erro ao ${tipo} requisi????o. Tente novamente`, `${tipo2} de requisi????es`);
      }
    }
  }

  public async excluir(requisicao: Requisicao) {
    try {
      await this.requisicaoService.excluir(requisicao);
      this.toastrService.success(`A requisi????o foi excluida com sucesso`, `Exclus??o de requisi????es`);
    } catch (error) {
      this.toastrService.error(`Houve um erro ao excluir requisi????o. Tente novamente`, `Exclus??o de requisi????es`);
    }
  }

  private configurarValoresPadrao(): void{
    this.status?.setValue("Aberta");
    this.dataAbertura?.setValue(new Date());
    this.ultimaAtualizacao?.setValue(new Date());
    this.equipamentoId?.setValue(null);
    this.funcionarioId?.setValue(this.funcionarioLogado.id);
  }
}
