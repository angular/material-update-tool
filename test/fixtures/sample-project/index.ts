import {NgModule} from '@angular/core';
import {AppComponent} from './app/app-component';
import {MdButtonToggleModule, MdDatepickerModule} from '@angular/material'
import {MyAppMaterialModule} from './material.module';

@NgModule({
  bootstrap: [
    AppComponent
  ],
  imports: [
    MyAppMaterialModule,
    MdButtonToggleModule,
    MdDatepickerModule
  ]
})
export class MdSampleProjectModule {}
