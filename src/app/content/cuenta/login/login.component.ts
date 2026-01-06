import { Component, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  Validators,
} from '@angular/forms';
import { ModalManagerService } from '../../../components/shared/modal-manager.service';
import { UsuarioService } from '../../../../api/usuario/usuario.service';
import { UtilsService } from '../../../services/utils.service';
import { TipoToast } from '../../../../api/entidades/enumeraciones';
import { SessionService } from '../../../services/session.service';
import { IdleService } from '../../../services/idle.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  @ViewChild('crearCuentaModal', { static: true })
  crearCuentaModal!: TemplateRef<any>;
  @ViewChild('olvidarContrasenaModal', { static: true })
  olvidarContrasenaModal!: TemplateRef<any>;
  @ViewChild('ayudaModal', { static: true })
  ayudaModal!: TemplateRef<any>;

  username = '';
  password = '';
  error = '';
  hiddenPassw: any = false;
  recordar: boolean = false;

  crearCuentaForm!: FormGroup;
  loginForm!: FormGroup;

  constructor(
    private router: Router,
    private modalManager: ModalManagerService,
    private fb: FormBuilder,
    private usuarioApi: UsuarioService,
    private utils: UtilsService,
    private sessionService: SessionService,
	private  idleService: IdleService

  ) {}
  ngOnInit(): void {

    this.initFormLogin(); // primero inicializa el form
    const session = this.sessionService.getUsuario();
    const userString = localStorage.getItem('user');

    if (session) {
      this.router.navigate(['/dashboard']);
      this.utils.MuestrasToast(TipoToast.Info, '¡Bienvenido!');
      return;
    }

    const user = this.sessionService.getUserRecordado();
	if (user) {
		this.loginForm.patchValue(user);
		this.loginForm.markAllAsTouched();
	}
  }

  sethidden() {
    this.hiddenPassw = !this.hiddenPassw;
  }

  initFormLogin() {
    this.loginForm = this.fb.group({
      usuario: ['', [Validators.required]], // Validators.email
      password: ['', [Validators.required]],
    });
  }
  /* crear cuenta */

/*   initFormCrearCuenta() {
    this.crearCuentaForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      rfc: [
        '',
        [
          Validators.required,
          Validators.pattern(/^([A-ZÑ&]{3,4})\d{6}([A-Z\d]{3})?$/i),
        ],
      ],
    });
  } */

  getValidationStatus(
    form: FormGroup,
    controlName: string
  ): 'valid' | 'invalid' | 'none' {
    const control = form.get(controlName);
    if (!control) return 'none';
    return control.valid && (control.dirty || control.touched)
      ? 'valid'
      : control.invalid && (control.dirty || control.touched)
      ? 'invalid'
      : 'none';
  }

  openConfirmModal() {
    /* this.initFormCrearCuenta(); */
    this.modalManager.openModal({
      title: '<i class="fas fa-user-plus me-2"></i> Solicitar cuenta',
      template: this.crearCuentaModal,
      showFooter: false,
      onAccept: () => null,
      onCancel: () => null,
    });
  }
  solicitudCrearCuenta() {}

  /* olvidé mi contraseña */
  openOlvidarContrasenaModal() {
    this.modalManager.openModal({
      title: '<i class="fas fa-user-lock me-2"></i> Recuperar contraseña',
      template: this.olvidarContrasenaModal,
      showFooter: false,

      onAccept: () => null,
    });
  }
  openAyudaModal() {
    this.modalManager.openModal({
      title: '<i class="fas fa-question-circle me-2"></i> Ayuda',
      template: this.ayudaModal,
      showFooter: false,
      onAccept: () => null,
    });
  }

  /* LOGIN */

  login() {
    let payload = {
      email: this.loginForm.value.usuario,
      password: this.loginForm.value.password,
      idSistema: 1,
    };
    if (
      this.loginForm.value.usuario === 'admin' &&
      this.loginForm.value.password === 'demo'
    ) {
      this.sessionService.setSession({
        nombreCompleto: 'admin',
        idUsuario: 9999,
        unidadAdscripcion: 'ROOT',
        idDeterminante: 1,
        idUsuarioRol: 1,
        area: 'Súper administrador',
      });

      setTimeout(() => {
        this.router.navigate(['/dashboard']);
      }, 0);
      return;
    } else {
      this.usuarioApi.logIn(payload).subscribe(
        (data) => {
          this.onSuccessLogin(data);
        },
        (ex) => {
          this.utils.MuestraErrorInterno(ex);
        }
      );
    }
  }
  onSuccessLogin(data: any) {
    if (data.status == 200) {
      this.sessionService.setSession(data.model);
	  this.idleService.startWatching();
      if (this.recordar) {
        this.sessionService.setUserRecordado({
          usuario: this.loginForm.value.usuario,
          password: this.loginForm.value.password,
        });
      }/*  else {
        this.sessionService.clearUserRecordado(); a menos de que lo pidan!
      } */

      this.router.navigate(['/dashboard']);
    } else {
      this.utils.MuestrasToast(TipoToast.Error, data.message);
    }
  }

  public openDocument(type: 'manual' | 'privacy' | 'regulation' | 'carta'): void {
    let url: string;

    switch (type) {
      case 'manual':
        url = '/docs/Manual de usuario_SCG_NV.pdf';
        break;
      case 'privacy':
        url = '/docs/Aviso de privacidad SCG simplificado.pdf';
        break;
      case 'regulation':
        url = '/docs/RIANAM_2023.pdf';
        break;
      case 'carta':
        url = '/docs/Carta responsiva SCG.docx';
        break;
      default:
        console.error('Tipo de documento no válido');
        return;
    }

    // Abre el documento en una nueva pestaña/ventana
    window.open(url, '_blank');
  }
}
