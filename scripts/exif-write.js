const chalk = require('chalk');
const program = require('commander');
const packageJson = require('../package.json');
const fs = require('fs');
const exiftool = require('node-exiftool')
const exiftoolBin = require('dist-exiftool')
const ep = new exiftool.ExiftoolProcess(exiftoolBin);

program
  .version(packageJson.version)
  .arguments('<image> <datafile>', 'read exif comment data from an image')
  .action(function (image, datafile) {
    let newMetaData = fs.readFileSync(datafile).toString();
    writeExifData(image, newMetaData);
  })
  .parse(process.argv);



  function writeExifData(image, comment) {
  ep
  .open()
  // .then((pid) => console.log('Started exiftool process %s', pid))
  .then(() => ep.readMetadata(image, ['comment']))
  .then((allExif) => {
    let [ { Comment: comment } ] = allExif.data || {};
    console.log(chalk.yellow('------------- EXISTING DATA -------------'));
    console.log(comment);
  }, (err) => {
    console.error(err);
    process.exit(1);
  })
  .then(() => ep.writeMetadata(image, {
    all: '',
    comment
  }, ['overwrite_original']))
  .then(() => ep.readMetadata(image, ['comment']))
  .then((allExif) => {
    let [ { Comment: comment } ] = allExif.data || {};
    console.log(chalk.yellow('------------- UPDATED DATA -------------'));
    console.log(comment);
  }, (err) => {
    console.error(err);
    process.exit(1);
  })
  .then(() => ep.close())
  .catch(console.error)

}