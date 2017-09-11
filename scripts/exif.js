const program = require('commander');
const packageJson = require('../package.json');

program
  .version(packageJson.version)
  .command('read <image>', 'read exif comment data from an image')
  .command('write <image> <datafile>', 'update exif comment data in an image')
  .parse(process.argv);


