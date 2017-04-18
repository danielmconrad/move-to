'use strict';

// TODO:
//  - Ask for PIVOTAL_TOKEN and place it in their CI build params if not existent
//  - Add in-pr and merged states to CI build if not existent.

import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import exec from 'exec-then';

import questions from './questions';
import * as config from './config';
import * as ci from './ci';

const packageJson = require(path.join(process.cwd(), 'package.json'));

function askQuestions() {
  return inquirer.prompt(questions);
}

function addCITasks(answers) {
  if (answers.ciTool === 'travis') {
    ci.addTravisTask();
  }

  return Promise.resolve(answers);
}

function addDevDependency() {
  console.log('Installing move-to as a devDependency.');

  if (packageJson.name === 'move-to') {
    return Promise.resolve();
  }

  const hasYarn = fs.existsSync(path.join(process.cwd(), 'yarn.lock'));

  return exec(hasYarn ? 'yarn add move-to -D' : 'npm install move-to -D');
}

export default function () {
  return askQuestions()
    .then(addCITasks)
    .then(config.createFromAnswers)
    .then(config.write)
    .then(addDevDependency)
    .then(() => console.log('Finished!'));
}
