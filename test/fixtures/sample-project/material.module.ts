import {NgModule} from '@angular/core';
import {SlideToggleCustom} from './re-export';
import * as md from '@angular/material';
import {MatCheckboxModule, MatSidenavModule} from '@angular/material';

@NgModule({
  exports: [
    SlideToggleCustom,
    MatCheckboxModule,
    MatSidenavModule,

    md.MatSelectModule,
    md.MatListModule
  ]
})
export class MyAppMaterialModule {}
