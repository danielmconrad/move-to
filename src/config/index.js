'use strict';

import fs from 'fs';
import path from 'path';
import yml from 'js-yaml';

export function getRuntimeConfig() {
  const runtimeConfigPath = path.join(process.cwd(), '.moveto.yml');
  let runtimeConfig = yml.safeLoad(fs.readFileSync(runtimeConfigPath, 'utf8'));

  runtimeConfig.tokens = {
    github: process.env.GITHUB_TOKEN,
    pivotal: process.env.PIVOTAL_TOKEN,
    trello: process.env.TRELLO_TOKEN
  };

  return runtimeConfig;
}

export function getDefaultConfig() {
  const defaultConfigPath = path.join(__dirname, './defaults.yml');
  return yml.safeLoad(fs.readFileSync(defaultConfigPath, 'utf8'));
}
