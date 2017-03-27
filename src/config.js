'use strict';

import yml from 'js-yaml';
import fs from 'fs';
import path from 'path';
import _ from 'lodash';

const defaultConfigPath = path.join(__dirname, '../config.default.yml');
const appConfigPath = path.join(process.cwd(), '.moveto.yml');

let defaultConfig = yml.safeLoad(fs.readFileSync(defaultConfigPath, 'utf8'));
let appConfig = yml.safeLoad(fs.readFileSync(appConfigPath, 'utf8'));

const config = _.defaultsDeep({}, appConfig, defaultConfig);
const {url, owner, repo} = config.github;

const runtimeConfig = {
  repoUrl: [url, owner, repo].join('/'),
  tokens: {
    github: process.env.GITHUB_TOKEN,
    pivotal: process.env.PIVOTAL_TOKEN,
    trello: process.env.TRELLO_TOKEN
  }
};

export default _.defaultsDeep({}, runtimeConfig, config);
