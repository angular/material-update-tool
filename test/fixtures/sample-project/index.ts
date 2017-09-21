import {NgModule} from '@angular/core';
import {AppComponent} from './app/app-component';
import {MdCheckboxModule} from '@angular/material'
import {SlideToggleCustom} from './re-export';

@NgModule({
  bootstrap: [AppComponent],
  imports: [
    SlideToggleCustom,
    MdCheckboxModule,
  ]
})
export class MdSampleProjectModule {}
