'use strict';

import commander from 'commander';

import packageJson from '../../package';
import {getRuntimeConfig} from '../config';
import MoveTo from '../index';
import install from '../install';
import {parseArray, parseDiff} from './parsers';

const cli = commander.version(packageJson.version);

cli
  .command('state <stateName>')
  .option('-p, --pr-numbers <prNumbers>', 'PR Numbers (comma separated)', parseArray)
  .option('-d, --diff <diff>', 'PRs between diff (Ex: master...develop)', parseDiff)
  .action((stateName, options) => {
    return new MoveTo(getRuntimeConfig())
      .handleStateChange(stateName, options)
      .catch(err => console.log(err));
  });

cli
  .command('install')
  .action(install);

cli.parse(process.argv);
