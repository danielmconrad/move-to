'use strict';

import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import parseRepo from 'parse-repo';
import yml from 'js-yaml';
import exec from 'exec-then';

const packageJson = require(path.join(process.cwd(), 'package.json'));

function askQuestions() {
  return inquirer.prompt([{
    name: 'projectSource',
    message: 'What are you using to manage your stories?',
    type: 'list',
    choices: [
      {name: 'Pivotal Tracker', value: 'pivotal'}
      // {name: 'Trello', value: 'trello'}
    ]
  }, {
    when: (a => a.projectSource === 'pivotal'),
    name: 'projectId',
    message: 'What is your Pivotal Project ID? (123456)',
    validate: input => /^[0-9]{6,}/.test(input)
  }, {
    when: (a => a.projectSource === 'trello'),
    name: 'projectId',
    message: 'What is your Trello Project ID? (abcd1234)',
    validate: input => /^[0-9a-zA-Z]{8}/.test(input)
  }, {
    name: 'isEnterprise',
    message: 'Do you have a self-hosted Enterprise Github?',
    type: 'confirm',
    default: false
  }, {
    when: (a => a.isEnterprise),
    name: 'githubUrl',
    message: 'What is your Github url?',
    default: 'http://www.github.com'
  }, {
    when: (a => a.isEnterprise),
    name: 'githubApiHost',
    message: 'What is your Github API domain?',
    default: 'api.github.com'
  }, {
    when: (a => a.isEnterprise),
    name: 'githubApiPath',
    message: 'What is your Github API path prefix?',
    default: 'null'
  }, {
    name: 'storiesSource',
    message: 'Where in your PRs do you place your story ids?',
    type: 'list',
    choices: [
      {name: 'Title', value: 'title'},
      {name: 'Milestone', value: 'milestone.title'},
      {name: 'Body', value: 'body'}
    ]
  }]);
}

function createConfigFromAnswers(answers) {
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

function writeConfig(config) {
  console.log('Writing the .moveto.yml config file.');

  const configPath = path.join(process.cwd(), '.moveto.yml');
  const configContent = yml.dump(config);

  return Promise.resolve(fs.writeFileSync(configPath, configContent));
}

function addDevDependency() {
  console.log('Installing move-to as a devDependency.');

  if (packageJson.name === 'move-to') {
    return Promise.resolve();
  }

  const hasYarn = fs.existsSync(path.join(process.cwd(), 'yarn.lock'));

  return exec(hasYarn ? 'yarn add move-to -D' : 'npm install move-to -D');
}

function complete() {
  return Promise.resolve(console.log('Finished!'));
}

export default function () {
  return askQuestions()
    .then(createConfigFromAnswers)
    .then(writeConfig)
    .then(addDevDependency)
    .then(complete);
}
