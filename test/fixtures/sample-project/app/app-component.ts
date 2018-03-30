import {FocusMonitor} from '@angular/cdk/a11y';
import {ConnectedOverlayDirective} from '@angular/cdk/overlay';
import {Component, ElementRef, EventEmitter, ViewChild} from '@angular/core';
import {
  MAT_PLACEHOLDER_GLOBAL_OPTIONS, MatDatepicker,
  MatDrawerToggleResult,
  MatFormFieldControl, MatListOption, MatListOptionChange,
  MatSelect,
  MatSidenav,
  NativeDateAdapter
} from '@angular/material';
import {Observable} from 'rxjs/Observable';

@Component({
  selector: 'md-app-component',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {}

@Component({
  selector: 'md-test-component',
  template: `      
    <!-- This line should be changed: -->
    <mat-radio-group align="start"></mat-radio-group>
  `,
  styles: [
    `
      mat-checkbox {
        font-weight: bold;
      }
    `,
    `
      button[mat-button] {
        text-transform: none;
      }

      /* This line should be changed: */
      mat-input-container {}
    `
  ]
})
export class TestComponent {
  @ViewChild('cod') cod: ConnectedOverlayDirective;
  @ViewChild('snav') snav: MatSidenav;
  @ViewChild('select') select: MatSelect;
  @ViewChild('opt') opt: MatListOption;
  @ViewChild('dp') dp: MatDatepicker<any>;

  thing = new MyThing();
  blah: MatDrawerToggleResult;

  constructor(el: ElementRef, fm: FocusMonitor) {
    fm.monitor(el.nativeElement, null, true);
    let cods = [this.cod];
    this.opt.selectionChange.subscribe((x: MatListOptionChange) => {});
    this.dp.selectedChanged.subscribe(() => {});

    // These lines should be changed:
    this.cod._deprecatedBackdropClass = 'test';
    let stuff = this.snav.onAlignChanged;
    cods[0]._deprecatedHeight = 1;
    let x = MAT_PLACEHOLDER_GLOBAL_OPTIONS;
    let y = el.nativeElement.querySelector('mat-input-container');
    this.select.onOpen.subscribe(() => {});

    // These lines should not be changed:
    this.thing._deprecatedBackdropClass = 'test';
    stuff = this.thing.onAlignChanged;
  }
}

class MyThing {
  _deprecatedBackdropClass: string;
  onAlignChanged = new EventEmitter<void>();
}

class MySidenav extends MatSidenav {}

class MyDateAdapter extends NativeDateAdapter {
  constructor() { super(null); }
}

class MyFormFiledControl implements MatFormFieldControl<any> {
  value: any;
  stateChanges: Observable<void>;
  id: string;
  placeholder: string;
  ngControl: | null;
  focused: boolean;
  empty: boolean;
  required: boolean;
  disabled: boolean;
  errorState: boolean;
  setDescribedByIds(ids: string[]): void {}
  onContainerClick(event: MouseEvent): void {}
}
