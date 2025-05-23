// //#region imports
// import { Taon, BaseContext } from 'taon/src';
// import { Observable, map } from 'rxjs';
// import { HOST_BACKEND_PORT } from './app.hosts';
// //#region @browser
// import { NgModule, inject, Injectable } from '@angular/core';
// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// //#endregion
// //#endregion

// console.log('hello world');
// console.log('Your server will start on port '+ HOST_BACKEND_PORT);
// const host = 'http://localhost:' + HOST_BACKEND_PORT;

// //#region json10 component
// //#region @browser
// @Component({
//   selector: 'app-json10',
//   template: `hello from json10<br>
//     <br>
//     users from backend
//     <ul>
//       <li *ngFor="let user of (users$ | async)"> {{ user | json }} </li>
//     </ul>
//   `,
//   styles: [` body { margin: 0px !important; } `],
// })
// export class Json10Component {
//   userApiService = inject(UserApiService);
//   readonly users$: Observable<User[]> = this.userApiService.getAll();
// }
// //#endregion
// //#endregion

// //#region  json10 api service
// //#region @browser
// @Injectable({
//   providedIn:'root'
// })
// export class UserApiService {
//   userControlller = Taon.inject(()=> MainContext.get(UserController))
//   getAll() {
//     return this.userControlller.getAll()
//       .received
//       .observable
//       .pipe(map(r => r.body.json));
//   }
// }
// //#endregion
// //#endregion

// //#region  json10 module
// //#region @browser
// @NgModule({
//   exports: [Json10Component],
//   imports: [CommonModule],
//   declarations: [Json10Component],
// })
// export class Json10Module { }
// //#endregion
// //#endregion

// //#region  json10 entity
// @Taon.Entity({ className: 'User' })
// class User extends Taon.Base.AbstractEntity {
//   public static ctrl?: UserController;
//   //#region @websql
//   @Taon.Orm.Column.String()
//   //#endregion
//   name?: string;
// }
// //#endregion

// //#region  json10 controller
// @Taon.Controller({ className: 'UserController' })
// class UserController extends Taon.Base.CrudController<User> {
//   entityClassResolveFn = ()=> User;
//   //#region @websql
//   async initExampleDbData(): Promise<void> {
//     const superAdmin = new User();
//     superAdmin.name = 'super-admin';
//     await this.db.save(superAdmin);
//   }
//   //#endregion
// }
// //#endregion

// //#region  json10 context
// const MainContext = Taon.createContext(()=>({
//   host,
//   contextName: 'MainContext',
//   contexts:{ BaseContext },
//   controllers: {
//     UserController,
//     // PUT FIREDEV CONTORLLERS HERE
//   },
//   entities: {
//     User,
//     // PUT FIREDEV ENTITIES HERE
//   },
//   database: true,
//   disabledRealtime: true,
// }));
// //#endregion

// async function start() {

//   await MainContext.initialize();

//   if (Taon.isBrowser) {
//     const users = (await MainContext.getClassInstance(UserController).getAll().received)
//       .body?.json;
//     console.log({
//       'users from backend': users,
//     });
//   }
// }

// export default start;

//#region  json10 component
//#region @browser
@Component({ template: 'hello world fromr json10' })
export class Json10Component {}
//#endregion
//#endregion

//#region  json10 module
//#region @browser
@NgModule({
  declarations: [Json10Component],
  imports: [CommonModule],
  exports: [Json10Component],
})
export class Json10Module {}
//#endregion
//#endregion
