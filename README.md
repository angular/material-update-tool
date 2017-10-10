# Angular Material "md" -> "mat" prefix updater.

## Installation
```bash
npm i -g angular-material-prefix-updater
```
**Note**: Running this tool with Angular Material versions higher than `beta.11` will not work. The prefix updater tool requires type information from the outdated `Md` classes. 

The upgrade to the latest version of Angular Material should happen after running the tool.

## Usage

```bash
# Show the help for the tool
mat-switcher --help

# Run the tool to update prefixes
mat-switcher -p path/to/project/tsconfig.json

# Run the tool to update prefixes with additional style
# files not referenced by an Angular component, where --extra-css
# accepts a glob pointing to the style files
mat-switcher -p path/to/project/tsconfig.json --extra-css 'custom/**/*.css' 
```

## After running the tool
After running the tool, add a provider to the root of your application:
```ts
import {MATERIAL_COMPATIBILITY_MODE} from '@angular/material';

@NgModule({
  providers: [
    {provide: MATERIAL_COMPATIBILITY_MODE, useValue: true},
    // ...
  ],
})
export class MyModule { }

```

This will enforce that only the "mat" prefix is used for all selectors.
