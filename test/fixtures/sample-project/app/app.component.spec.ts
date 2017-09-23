import {By} from '@angular/platform-browser';
import {MdSort} from '@angular/material';
import {Observable} from "rxjs/Observable";

describe('App Component', () => {

  it('should change string literals in tests as well', () => {
    const debugElement = By.css('[md-button]');

    // This can be considered as invalid, since the button is always an attribute and no selector.
    const debugElement2 = By.css('md-button');

    // Fakes the old MatSort implementation with the old output property.
    const sort: {mdSortChange: Observable<void>} & MdSort = null;

    // This property has been updated as part of the prefix switching.
    sort.mdSortChange.subscribe(() => {});
  });

});
