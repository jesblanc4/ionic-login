import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { environment } from '../../environments/environment';
import { Usuario, Respuesta } from '../interfaces/interfaces';
import { NavController } from '@ionic/angular';

const URL = environment.url;

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

 token: string = null;
 private usuario: Usuario = { estado:false, google:false };
 private respuesta: Respuesta = { ok:false, msg: '' };

  constructor( private http: HttpClient,
               private storage: Storage,
               private navCtrl: NavController ) { }


  login( correo: string, password: string ) {

    const data = { correo, password };
    
    return new Promise( resolve => {

      const headers = new HttpHeaders({
        'Content-Type': 'application/json'
      });

      this.http.post(`${ URL }/api/auth/login`, data, { headers } )
        .subscribe( async resp => {
          this.respuesta.ok = resp['ok'];
          this.respuesta.msg = resp['msg'];
          if ( this.respuesta.ok ) {
            await this.guardarToken( resp['token'] );
            resolve(this.respuesta);
          } else {
            this.token = null;
            this.storage.clear();
            resolve(this.respuesta);
          }

        },
        ( errResp: HttpErrorResponse ) => {
            console.log(errResp.error);
            this.token = null;
            this.storage.clear();
            this.respuesta.ok = errResp.error.ok;
            this.respuesta.msg = errResp.error.msg;
            resolve(this.respuesta);
        });

    });

  }

  logout() {
    this.token   = null;
    this.usuario = null;
    this.storage.clear();
    this.navCtrl.navigateRoot('/login', { animated: true });
  }

  registro( usuario: Usuario ) {

    return new Promise( resolve => {

      this.http.post(`${ URL }/api/usuarios`, usuario )
          .subscribe( async resp => {
            if ( resp['ok'] ) {
              this.respuesta.ok = resp['ok'];
              this.respuesta.msg = 'Usuario creado';
              await this.guardarToken( resp['token'] );
              resolve(this.respuesta);
            } else {
              this.respuesta.ok = resp['ok'];
              this.respuesta.msg = resp['msg'];
              this.token = null;
              this.storage.clear();
              resolve(this.respuesta);
            }

          },
          ( errResp : HttpErrorResponse ) => {
            
            this.respuesta.ok = errResp.error.errors[0].ok;
            this.respuesta.msg = errResp.error.errors[0].msg;
            this.token = null;
            this.storage.clear();
            console.log(this.respuesta);
            resolve(this.respuesta);
          });


    });


  }

  getUsuario() {

    if ( !this.usuario.uid ) {
      this.validaToken();
    }

    return { ...this.usuario };

  }


  async guardarToken( token: string ) {

    this.token = token;
    await this.storage.set('token', token);

    await this.validaToken();


  }

  async cargarToken() {

    this.token = await this.storage.get('token') || null;

  }


  async validaToken(): Promise<boolean> {

    await this.cargarToken();

    if ( !this.token ) {
      this.navCtrl.navigateRoot('/login');
      return Promise.resolve(false);
    }


    return new Promise<boolean>( resolve => {

      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'x-token': this.token
      });

      this.http.get(`${ URL }/api/auth/login`, { headers })
        .subscribe( resp => {

          if ( resp['ok'] ) {
            this.usuario = resp['usuario'];
            resolve(true);
          } else {
            this.navCtrl.navigateRoot('/login');
            resolve(false);
          }

        });


    });

  }


  actualizarUsuario( usuario: Usuario ) {


    const headers = new HttpHeaders({
      'x-token': this.token
    });


    return new Promise( resolve => {

      this.http.post(`${ URL }/api/usuarios/`, usuario, { headers })
        .subscribe( resp => {

          if ( resp['ok'] ) {
            this.guardarToken( resp['token'] );
            resolve(true);
          } else {
            resolve(false);
          }

        });

    });



  }


}
