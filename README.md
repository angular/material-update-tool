# Angular Material "md" -> "mat" prefix updater.

## Installation
```bash
npm i angular-material-prefix-updater
```

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
