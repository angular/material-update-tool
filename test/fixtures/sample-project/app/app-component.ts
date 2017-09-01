import {Component} from '@angular/core';

@Component({
  selector: 'md-app-component',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {}

@Component({
  selector: 'md-test-component',
  template: `
    <span>This is a test</span>
    <md-slide-toggle>Test</md-slide-toggle>
  `,
  styles: [
    `
      md-checkbox {
        font-weight: bold;
      }
    `,
    `
      button[md-button] {
        text-transform: none;
      }
    `
  ]
})
export class TestComponent {}
