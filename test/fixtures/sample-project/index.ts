import {NgModule} from '@angular/core';
import {AppComponent} from './app/app-component';
import {MatButtonToggleModule, MatDatepickerModule} from '@angular/material'
import {MyAppMaterialModule} from './material.module';

@NgModule({
  bootstrap: [
    AppComponent
  ],
  imports: [
    MyAppMaterialModule,
    MatButtonToggleModule,
    MatDatepickerModule
  ]
})
export class MdSampleProjectModule {}
