'use strict';

import commander from 'commander';
import MoveTo from './index';
import packageJson from '../package';
import {parseArray} from './parsers';
import config from './config';

const moveTo = new MoveTo(config);
const cli = commander.version(packageJson.version);

cli
  .arguments('<actionName>')
  .option('-p, --pr-ids <prIds>', 'PR Ids (comma separated)', parseArray)
  .option('-d, --diff <diff>', 'PRs between diff (Ex: master...develop)', parseArray)
  .action((actionName, options) => {
    return moveTo.handleAction(actionName, options);
  });

cli.parse(process.argv);
