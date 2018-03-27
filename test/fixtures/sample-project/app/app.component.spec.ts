import {By} from '@angular/platform-browser';
import {MatSort} from '@angular/material';
import {Observable} from "rxjs/Observable";

describe('App Component', () => {

  it('should change string literals in tests as well', () => {
    const debugElement = By.css('[mat-button]');

    // This can be considered as invalid, since the button is always an attribute and no selector.
    const debugElement2 = By.css('mat-button');

    // Fakes the old MatSort implementation with the old output property.
    const sort: {mdSortChange: Observable<void>} & MatSort = null;

    // This property has been updated as part of the prefix switching.
    sort.sortChange.subscribe(() => {});
  });

});
