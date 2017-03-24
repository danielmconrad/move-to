'use strict';

import commander from 'commander';
import MoveTo from './index';
import packageJson from '../package';

const program = commander.version(packageJson.version);

program
  .command('pr <prId>')
  .action((dir, otherDirs) => {
    MoveTo(dir, otherDirs);
  });

program.parse(process.argv);
