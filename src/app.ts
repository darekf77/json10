//#region @notForNpm
//#region @browser
import { NgModule } from '@angular/core';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-json10',
  template: 'hello from json10'
})
export class Json10Component implements OnInit {
  constructor() { }

  ngOnInit() { }
}

@NgModule({
  imports: [],
  exports: [Json10Component],
  declarations: [Json10Component],
  providers: [],
})
export class Json10Module { }
//#endregion

//#region @backend
async function start(port: number)  {

}

export default start;

//#endregion

//#endregion