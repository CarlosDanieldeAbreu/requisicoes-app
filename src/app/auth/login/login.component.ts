import { Component, OnInit, TemplateRef } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from '../services/authentication.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  public form: FormGroup;
  public formRecuperacao: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthenticationService,
    private router: Router,
    private modalService: NgbModal,
    private toastrService: ToastrService
    ) { }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      email: new FormControl("", [Validators.required, Validators.email]),
      senha: new FormControl("", [Validators.required])
    });

    this.formRecuperacao = this.formBuilder.group({
      emailRecuperacao: new FormControl("", [Validators.required, Validators.email])
    });
  }

  get email(): AbstractControl | null {
    return this.form.get("email");
  }

  get senha(): AbstractControl | null {
    return this.form.get("senha");
  }

  get emailRecuperacao(): AbstractControl | null {
    return this.formRecuperacao.get("emailRecuperacao");
  }

  public async login() {
    const email = this.email?.value;
    const senha = this.senha?.value;

    try{
      const resposta = await this.authService.login(email, senha);

      if(this.form.dirty && this.form.valid){
        if(resposta?.user) {
          this.router.navigate(["/painel"]);
          this.toastrService.success(`O login foi executado com sucesso.`, 'Login');
        }
      }else
        this.toastrService.success(`Email e Senha precisam ser preenchidos para realizar o login`, 'Login');

    }catch(error){
      if (error != "fechar" && error != "0" && error != "1")
        this.toastrService.error(`Houve um erro ao logar, verifique senha e email se estão corretos. Tente novamente`, 'Login');
    }
  }

  public abrirModalRecuperacao(modal: TemplateRef<any>) {
    this.modalService.open(modal)
      .result
      .then(resultado => {
        if(resultado === "enviar"){
          this.authService.resetarSenha(this.emailRecuperacao?.value);
        }
      })
      .catch(() => {
        this.formRecuperacao.reset();
      });
  }
}
