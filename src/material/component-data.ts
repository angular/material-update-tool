/** Interface that describes a collection of component information. */
export interface ComponentInfoSet {
  [componentName: string]: ComponentInfo;
}

/** Interface that describes a single component in the data file. */
export interface ComponentInfo {
  inputs: string[];
  outputs: string[];
}

/** Export the component data inside as part of a module. This means that the data is cached. */
export const materialComponentData: ComponentInfoSet = require('./material-data.json');
