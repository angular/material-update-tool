import {NgModule} from '@angular/core';
import {AppComponent} from './app-component';
import {MdSlideToggleModule, MdCheckboxModule} from '@angular/material'

@NgModule({
  bootstrap: [AppComponent],
  imports: [
    MdSlideToggleModule,
    MdCheckboxModule,
  ]
})
export class MdSampleProjectModule {}
