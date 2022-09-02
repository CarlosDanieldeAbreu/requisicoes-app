import { Component, OnInit, TemplateRef } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { Departamento } from '../departamentos/models/departamento.model';
import { DepartamentoService } from '../departamentos/services/departamento.service';
import { Funcionario } from './models/funcionario.model';
import { FuncionarioService } from './services/funcionario.service';

@Component({
  selector: 'app-funcionario',
  templateUrl: './funcionario.component.html',
})
export class FuncionarioComponent implements OnInit {
  public funcionario$: Observable<Funcionario[]>;
  public departamento$: Observable<Departamento[]>;
  public form: FormGroup;

  constructor(
    private funcionarioService: FuncionarioService,
    private departamentoService: DepartamentoService,
    private modalServise: NgbModal,
    private fb: FormBuilder,
    private toastrService: ToastrService) { }

  ngOnInit(): void {
    this.funcionario$ = this.funcionarioService.selecionarTodos();
    this.form = this.fb.group({
      id: new FormControl(""),
      nome: new FormControl("", [Validators.required, Validators.minLength(3)]),
      email: new  FormControl("", [Validators.required, Validators.email]),
      funcao: new FormControl("", [Validators.required, Validators.minLength(3)]),
      departamentoId: new FormControl("", [Validators.required]),
      departamento: new FormControl("")
    });

    this.funcionario$ = this.funcionarioService.selecionarTodos();
    this.departamento$ = this.departamentoService.selecionarTodos();
  }

  get tituloModal(): string {
    return this.id?.value ? "Atualização" : "Cadastro";
  }

  get id(): AbstractControl | null{
    return this.form.get("id");
  }

  get nome(): AbstractControl | null {
    return this.form.get("nome");
  }

  get email(): AbstractControl | null {
    return this.form.get("email");
  }

  get funcao(): AbstractControl | null {
    return this.form.get("funcao");
  }

  get departamentoId(): AbstractControl | null {
    return this.form.get("departamentoId");
  }

  public async gravar(modal: TemplateRef<any>, funcionario?: Funcionario) {
    this.form.reset();

    if (funcionario){
      const departamento = funcionario.departamento ? funcionario.departamento : null;

      const funcionarioCompleto = {
        ...funcionario,
        departamento
      }

      this.form.setValue(funcionarioCompleto);
    }

    try {
      await this.modalServise.open(modal).result;

      let tipo: string;
      let tipo2: string;

      if(this.form.dirty && this.form.valid){
        if (!funcionario) {
          await this.funcionarioService.inserir(this.form.value);
          tipo = "inserido"
          tipo2 = "Cadastro"
        }
        else {
          await this.funcionarioService.editar(this.form.value);
          tipo = "editado"
          tipo2 = "Edição"
        }

        this.toastrService.success(`O funcionário foi ${tipo} com sucesso`, `${tipo2} de Funcionários`);
      }else
        this.toastrService.error(`O formulário precisa ser preenchido!.`, `Cadastro de Funcionário`);

    } catch (error) {
      let tipo: string;
      let tipo2: string;
      if (error != "fechar" && error != "0" && error != "1") {
        if (!funcionario) {
          tipo = "inserir"
          tipo2 = "Cadastro"
        }
        else {
          tipo = "editar"
          tipo2 = "Edição"
        }

        this.toastrService.error(`Houve um erro ao ${tipo} funcionário. Tente novamente`, `${tipo2} de Funcionários`);
      }
    }
  }

  public async excluir(funcionario: Funcionario) {
    try {
      await this.funcionarioService.excluir(funcionario);
      this.toastrService.success(`O funcionário foi excluido com sucesso`, `Exclusão de Funcionários`);
    } catch (error) {
      this.toastrService.error(`Houve um erro ao excluir funcionário. Tente novamente`, `Exclusão de Funcionários`);
    }
  }
}
