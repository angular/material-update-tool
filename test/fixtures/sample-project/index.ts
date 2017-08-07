import {NgModule} from '@angular/core';
import {AppComponent} from './app/app-component';
import {MdCheckboxModule} from '@angular/material'
import {Lol} from './re-export';

@NgModule({
  bootstrap: [AppComponent],
  imports: [
    Lol,
    MdCheckboxModule,
  ]
})
export class MdSampleProjectModule {}
