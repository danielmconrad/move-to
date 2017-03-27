'use strict';

import _ from 'lodash';
import async from 'async';
import fs from 'fs';
import path from 'path';
import yml from 'js-yaml';

import PivotalClient from './clients/pivotal';
import TrelloClient from './clients/trello';
import GithubClient from './clients/github';

class MoveTo {
  constructor(appConfig) {
    this._setConfig(appConfig);
    this._validateConfig();
    this._setClients();
  }

  handleStateChange(stateName, options) {
    if (options.prNumbers) {
      return this.updatePrsState(options.prNumbers, stateName);
    }

    if (options.diff) {
      return this.githubClient.findPrNumbersFromDiff(options.diff)
        .then(prNumbers => this.updatePrsState(prNumbers, stateName));
    }

    return Promise.reject('No action can be taken');
  }

  updatePrsState(prNumbers, stateName) {
    return this.githubClient
      .findPairsFromPrNumbers(prNumbers)
      .then(pairs => this.updateStories(pairs, stateName));
  }

  updateStories(pairs, stateName) {
    return new Promise((resolve, reject) => {
      async.eachSeries(pairs, ({storyId, prNumber}, cb) => {
        this.updateStory(storyId, prNumber, stateName).then(() => cb());
      }, (err) => err ? reject(err) : resolve());
    });
  }

  updateStory(storyId, prNumber, stateName) {
    const {isPartialRegex} = this.config;
    const isPartial = new RegExp(isPartialRegex).test(storyId);
    const cleanStoryId = isPartial ? storyId.replace(isPartialRegex, '') : storyId;

    return this.projectClient.handleStateChange(stateName, cleanStoryId, prNumber, isPartial);
  }

  // PIVATE METHODS

  _setConfig(appConfig) {
    const defaultConfigPath = path.join(__dirname, '../config.default.yml');
    const defaultConfig = yml.safeLoad(fs.readFileSync(defaultConfigPath, 'utf8'));

    this.config = _.defaultsDeep({}, appConfig, defaultConfig);
  }

  _validateConfig() {
    let requiredConfigs = [
      ['projectSource', 'projectSource'],
      ['projectId', 'projectId'],
      ['github.owner', 'github.owner'],
      ['github.repo', 'github.repo'],
      ['tokens.github', 'GITHUB_TOKEN']
    ];

    if (this.config.projectSource === 'trello') {
      requiredConfigs.push(['tokens.trello', 'TRELLO_TOKEN']);
    }

    if (this.config.projectSource === 'pivotal') {
      requiredConfigs.push(['tokens.pivotal', 'PIVOTAL_TOKEN']);
    }

    const missingConfigs = requiredConfigs.reduce((missing, [testPath, desc]) => {
      if (!_.get(this.config, testPath)) {
        missing.push(desc);
      }
      return missing;
    }, []);

    if (missingConfigs.length) {
      throw new Error(
        `Missing configurations for: ${missingConfigs.join(', ')}.`
      );
    }
  }

  _setClients() {
    const {projectSource} = this.config;
    const projecClients = {
      pivotal: PivotalClient,
      trello: TrelloClient
    };
    const ClientClass = projecClients[projectSource];

    this.githubClient = new GithubClient(this.config);
    this.projectClient = new ClientClass(this.config);
  }
}

export default MoveTo;
