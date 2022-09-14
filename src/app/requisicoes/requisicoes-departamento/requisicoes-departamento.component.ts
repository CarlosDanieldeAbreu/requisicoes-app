import { Component, OnInit, TemplateRef } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subscription } from 'rxjs';
import { Requisicao } from '../models/requisicao.model';
import { RequisicaoService } from '../services/requisicao.service';
import { AuthenticationService } from 'src/app/auth/services/authentication.service';
import { DepartamentoService } from 'src/app/departamentos/services/departamento.service';
import { EquipamentoService } from 'src/app/equipamentos/services/equipamento.service';
import { FuncionarioService } from 'src/app/funcionarios/services/funcionario.service';
import { Departamento } from 'src/app/departamentos/models/departamento.model';
import { Equipamento } from 'src/app/equipamentos/models/equipamento.model';
import { Funcionario } from 'src/app/funcionarios/models/funcionario.model';
import { Movimentacao } from '../models/movimentacao.model';

@Component({
  selector: 'app-requisicoes-departamento',
  templateUrl: './requisicoes-departamento.component.html',
})
export class RequisicoesDepartamentoComponent implements OnInit {
  public departamentos$: Observable<Departamento[]>;
  public equipamentos$: Observable<Equipamento[]>;
  public funcionarios$: Observable<Funcionario[]>;
  public requisicoes$: Observable<Requisicao[]>;
  private processoAutenticado$: Subscription;

  public funcionarioLogado: Funcionario;
  public requisicaoSelecionada: Requisicao;
  public listaStatus: string[] = ["Aberta", "Processando", "Não Autorizada", "Fechada"]
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
      status: new FormControl("", Validators.required),
      descricao: new FormControl("", [Validators.required, Validators.minLength(6)]),
      funcionario: new FormControl(""),
      data: new FormControl("", Validators.required),
    });

    this.requisicoes$ = this.requisicaoService.selecionarTodos();
    this.departamentos$ = this.departamentoService.selecionarTodos();
    this.equipamentos$ = this.equipamentoService.selecionarTodos();
    this.funcionarios$ = this.funcionarioService.selecionarTodos();
    this.requisicoes$ = this.requisicaoService.selecionarTodos();

    this.processoAutenticado$ = this.authService.usuarioLogado.subscribe(usuario => {
      const email: string = usuario?.email!;

      this.funcionarioService.selecionarFuncionarioLogado(email)
        .subscribe(funcionario => {this.funcionarioLogado = funcionario;})
    });
  }

  ngOnDestroy(): void {
    this.processoAutenticado$.unsubscribe();
  }

  get data(): AbstractControl | null{
    return this.form.get("data");
  }

  get descricao(): AbstractControl | null {
    return this.form.get("descricao");
  }

  get funcionario(): AbstractControl | null{
    return this.form.get("funcionario");
  }
  get status(): AbstractControl | null {
    return this.form.get("status");
  }

  public async gravar(modal: TemplateRef<any>, requisicao: Requisicao) {
    this.requisicaoSelecionada = requisicao;
    this.requisicaoSelecionada.movimentacoes = requisicao.movimentacoes ? requisicao.movimentacoes: [];

    this.form.reset();
    this.configurarValoresPadrao();

    try {
      await this.modalServise.open(modal).result;

      if(this.form.dirty && this.form.valid){
        this.atualizarRequisicao(this.form.value)
        await this.requisicaoService.editar(this.requisicaoSelecionada)

        this.toastrService.success(`A requisição foi salva com sucesso`, `Cadastro de requisições`);
      }else
        this.toastrService.error(`O formulário precisa ser preenchido!.`, `Cadastro de requisições`);

    } catch (error) {
      if (error != "fechar" && error != "0" && error != "1") {
        this.toastrService.error(`Houve um erro ao salvar requisição. Tente novamente`, `Cadastro de requisições`);
      }
    }
  }

  private atualizarRequisicao(movimentacao: Movimentacao){
    this.requisicaoSelecionada.movimentacoes.push(movimentacao);
    this.requisicaoSelecionada.status = this.status?.value;
    this.requisicaoSelecionada.ultimaAtualizacao = new Date();
  }

  private configurarValoresPadrao(): void{
    this.form.patchValue({
      funcionario: this.funcionarioLogado,
      status: this.requisicaoSelecionada?.status,
      data: new Date()
    })
  }
}
