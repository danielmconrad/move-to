'use strict';

import fs from 'fs';
import path from 'path';
import yml from 'js-yaml';

const runtimeConfigPath = path.join(process.cwd(), '.moveto.yml');
let runtimeConfig = yml.safeLoad(fs.readFileSync(runtimeConfigPath, 'utf8'));

runtimeConfig.tokens = {
  github: process.env.GITHUB_TOKEN,
  pivotal: process.env.PIVOTAL_TOKEN,
  trello: process.env.TRELLO_TOKEN
};

export default runtimeConfig;
