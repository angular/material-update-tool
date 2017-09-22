import {NgModule} from '@angular/core';
import {SlideToggleCustom} from './re-export';
import {MdCheckboxModule, MdSidenavModule} from '@angular/material';

// Alternative and uncommon way of importing Angular Material in a project.
import * as md from '@angular/material';

@NgModule({
  exports: [
    SlideToggleCustom,
    MdCheckboxModule,
    MdSidenavModule,

    md.MdSelectModule,
    md.MdListModule
  ]
})
export class MyAppMaterialModule {}
