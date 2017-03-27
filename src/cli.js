'use strict';

import commander from 'commander';
import MoveTo from './index';
import packageJson from '../package';
import {parseArray, parseDiff} from './parsers';
import rc from './rc';

const moveTo = new MoveTo(rc);
const cli = commander.version(packageJson.version);

cli
  .command('state <stateName>')
  .option('-p, --pr-numbers <prNumbers>', 'PR Numbers (comma separated)', parseArray)
  .option('-d, --diff <diff>', 'PRs between diff (Ex: master...develop)', parseDiff)
  .action((stateName, options) => {
    return moveTo.handleStateChange(stateName, options)
      /* eslint no-console: 0 */
      .catch(err => console.log(err));
  });

cli.parse(process.argv);
