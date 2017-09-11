const chalk = require('chalk');
const program = require('commander');
const packageJson = require('../package.json');

const exiftool = require('node-exiftool')
const exiftoolBin = require('dist-exiftool')
const ep = new exiftool.ExiftoolProcess(exiftoolBin);

program
  .version(packageJson.version)
  .arguments('<image>', 'read exif comment data from an image')
  .action(function (image) {
    if (!image) {
      console.error(chalk.bgRed.white('No image specified'));
      program.help();
      process.exit(1);
    } else {
      extractExifData(image);
    }
  })
  .parse(process.argv);

function extractExifData(image) {
  ep
  .open()
  // .then((pid) => console.log('Started exiftool process %s', pid))
  .then(() => ep.readMetadata(image, ['comment']))
  .then((allExif) => {
    let [ { Comment: comment } ] = allExif.data;
    console.log(comment);
  }, (err) => {
    console.error(err);
  })
  .then(() => ep.close());
  // .then(() => console.log('Process has closed'));
}