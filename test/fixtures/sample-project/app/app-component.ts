import {ConnectedOverlayDirective} from '@angular/cdk/overlay';
import {Component, ElementRef, EventEmitter, ViewChild} from '@angular/core';
import {MAT_PLACEHOLDER_GLOBAL_OPTIONS, MatSidenav} from '@angular/material';

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
    `
  ]
})
export class TestComponent {
  @ViewChild('cod') cod: ConnectedOverlayDirective;
  @ViewChild('snav') snav: MatSidenav;

  thing = new MyThing();

  constructor(el: ElementRef) {
    let cods = [this.cod];

    // These lines should be changed:
    this.cod._deprecatedBackdropClass = 'test';
    let stuff = this.snav.onAlignChanged;
    cods[0]._deprecatedHeight = 1;
    let x = MAT_PLACEHOLDER_GLOBAL_OPTIONS;
    let y = el.nativeElement.querySelector('mat-form-field');

    // These lines should not be changed:
    this.thing._deprecatedBackdropClass = 'test';
    stuff = this.thing.onAlignChanged;
  }
}

class MyThing {
  _deprecatedBackdropClass: string;
  onAlignChanged = new EventEmitter<void>();
}
