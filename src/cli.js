'use strict';

import commander from 'commander';
import MoveTo from './index';
import install from './install';
import packageJson from '../package';
import {parseArray, parseDiff} from './parsers';

const cli = commander.version(packageJson.version);

cli
  .command('state <stateName>')
  .option('-p, --pr-numbers <prNumbers>', 'PR Numbers (comma separated)', parseArray)
  .option('-d, --diff <diff>', 'PRs between diff (Ex: master...develop)', parseDiff)
  .action((stateName, options) => {
    const rc = require('./rc');
    return new MoveTo(rc).handleStateChange(stateName, options)
      .catch(err => console.log(err));
  });

cli
  .command('install')
  .action(install);

cli.parse(process.argv);
