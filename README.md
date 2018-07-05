# UiToolbox
We have some shared front-end solutions (services, utility methods, etc) between Atlas, Arachne, Athena, so want to put them into shared lib.

# Usage
`require('@ohdsi/ui-toolbox/lib/umd')` or `import UiToolbox from '@ohdsi/ui-toolbox'`
Also, the package contains source (untranspiled) files under `/src` folder

# Development
  1. Place a module under `/src/<module>` folder
  2. Export it from `/src/index.js` file
  3. (Optionally) write tests