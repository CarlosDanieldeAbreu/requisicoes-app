import { Component, OnInit, TemplateRef } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { Equipamento } from './models/equipamento.model';
import { EquipamentoService } from './services/equipamento.service';
import { ToastrService } from 'ngx-toastr';
import { dataFuturaValidator } from '../shared/validators/data-futura.validator';

@Component({
  selector: 'app-equipamento',
  templateUrl: './equipamento.component.html',
})
export class EquipamentoComponent implements OnInit {

  public equipamentos$: Observable<Equipamento[]>;
  public form: FormGroup;

  constructor(
    private equipamentoService: EquipamentoService,
    private modalServise: NgbModal,
    private fb: FormBuilder,
    private toastrService: ToastrService) { }

  ngOnInit(): void {
    this.equipamentos$ = this.equipamentoService.selecionarTodos();
    this.form = this.fb.group({
      id: new FormControl(""),
      nome: new FormControl("", [Validators.required, Validators.minLength(3)]),
      preco: new FormControl("", [Validators.required]),
      data: new FormControl("", [Validators.required, dataFuturaValidator()])
    });
  }

  get tituloModal(): string {
    return this.id?.value ? "Atualização" : "Cadastro";
  }

  get id(): AbstractControl | null {
    return this.form.get("id");
  }

  get nome(): AbstractControl | null {
    return this.form.get("nome");
  }

  get preco(): AbstractControl | null {
    return this.form.get("preco");
  }

  get data(): AbstractControl | null {
    return this.form.get("data");
  }

  public async gravar(modal: TemplateRef<any>, equipamento?: Equipamento) {
    this.form.reset();

    if (equipamento)
      this.form.setValue(equipamento);

    try {
      await this.modalServise.open(modal).result;

      let tipo: string;
      let tipo2: string;

      if(this.form.dirty && this.form.valid){
        if (!equipamento) {
          await this.equipamentoService.inserir(this.form.value);
          tipo = "inserido";
          tipo2 = "Cadastro";
        }
        else {
          await this.equipamentoService.editar(this.form.value);
          tipo = "editado";
          tipo2 = "Edição";
        }

        this.toastrService.success(`O equipamento foi ${tipo} com sucesso`, `${tipo2} de equipamentos`);
      }else
        this.toastrService.error(`O formulário precisa ser preenchido!.`, `Cadastro de Equipamento`);

    } catch (error) {
      let tipo: string;
      let tipo2: string;
      if (error != "fechar" && error != "0" && error != "1") {
        if (!equipamento) {
          tipo = "inserir";
          tipo2 = "Cadastro";
        }
        else {
          tipo = "editar";
          tipo2 = "Edição";
        }

        this.toastrService.error(`Houve um erro ao ${tipo} equipamento. Tente novamente`, `${tipo2} de equipamentos`);
      }
    }
  }

  public async excluir(equipamento: Equipamento) {
    try {
      await this.equipamentoService.excluir(equipamento);
      this.toastrService.success(`O equipamento foi excluido com sucesso`, `Exclusão de equipamentos`);
    } catch (error) {
      this.toastrService.error(`Houve um erro ao excluir equipamento. Tente novamente`, `Exclusão de equipamentos`);
    }
  }
}
