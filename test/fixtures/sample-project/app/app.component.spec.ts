import {By} from '@angular/platform-browser';

describe('App Component', () => {

  it('should change string literals in tests as well', () => {
    const debugElement = By.css('[md-button]');

    // This can be considered as invalid, since the button is always an attribute and no selector.
    const debugElement2 = By.css('md-button');
  });

});
