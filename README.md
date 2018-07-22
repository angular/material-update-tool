# Angular Material 5.x to 6.0 updater tool


**Outdated**: This repository won't be updated anymore. Future major releases for Angular Material will also include an upgrade tool that can be used in **Angular CLI** projects by running **`ng update @angular/material`**


---

## Installation
```bash
npm i -g angular-material-updater
```
**Note**: Running this tool with Angular Material versions higher than `5.2.4` will not work. The
updater tool requires type information from the outdated `5.x` API. The upgrade to the latest
version of Angular Material should happen _after_ running the tool.

## Usage
Run the `mat-updater` command to update your project. The updater tool will attempt to automatically
fix issues that it can and report issues that can't be automatically fixed. The tool may not catch
100% of the issues, but it should help get most of the way there. The fixes applied by the tool also
may not be perfect. For example it may rename a symbol resulting in an invalid import. If you want
to run the tool and just detect issues without trying to fix them, you can do so by specifying
`--fix=false`.

```bash
# Show the help for the tool
mat-updater --help

# Run the tool to update prefixes
mat-updater -p path/to/project/tsconfig.json

# Run the tool to update prefixes with additional style
# files not referenced by an Angular component, where --extra-css
# accepts a glob pointing to the style files
mat-updater -p path/to/project/tsconfig.json --extra-css 'custom/**/*.css' 

# Run the tool to but don't automatically change anything
mat-updater -p path/to/project/tsconfig.json --fix=false
```

## After running the tool
1. Update the packages below if you are using them:
   ```bash
   npm i @angular/cdk@latest
   npm i @angular/material@latest
   npm i @angular/material-moment-adapter@latest
   ```
2. Address any issues that were reported by `mat-updater` but unable to be
   automatically fixed.
3. Try to build your app and fix any issues that show up (e.g. bad imports).
