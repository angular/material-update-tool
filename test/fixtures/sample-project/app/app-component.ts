import {Component} from '@angular/core';

@Component({
  selector: 'md-app-component',
  templateUrl: './app.component.html'
})
export class AppComponent {}

@Component({
  selector: 'md-test-component',
  template: `
    <span>This is a test</span>
    <md-slide-toggle>Test</md-slide-toggle>
  `
})
export class TestComponent {}
