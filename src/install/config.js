'use strict';

import yml from 'js-yaml';
import fs from 'fs';
import path from 'path';
import parseRepo from 'parse-repo';

const packageJson = require(path.join(process.cwd(), 'package.json'));

export function createConfigFromAnswers(answers) {
  const {owner, project} = parseRepo(packageJson.repository);

  let config = {
    projectId: answers.projectId,
    projectSource: answers.projectSource,
    storiesSource: answers.storiesSource,
    github: {
      owner: owner,
      repo: project
    }
  };

  if (answers.githubUrl) {
    config.github.url = answers.githubUrl;
  }

  if (answers.githubApiHost) {
    config.github.apiHost = answers.githubApiHost;
  }

  if (answers.githubApiPath && answers.githubApiPath !== 'null') {
    config.github.githubApiPath = answers.githubApiPath;
  }

  return Promise.resolve(config);
}

export function writeConfig(config) {
  console.log('Writing the .moveto.yml config file.');

  const configPath = path.join(process.cwd(), '.moveto.yml');
  const configContent = yml.dump(config);

  return Promise.resolve(fs.writeFileSync(configPath, configContent));
}
