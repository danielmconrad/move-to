'use strict';

import {get} from 'lodash';
import {eachSeries} from 'async';

import PivotalClient from './clients/pivotal';
import TrelloClient from './clients/trello';
import GithubClient from './clients/github';

const CLIENTS = {
  pivotal: PivotalClient,
  trello: TrelloClient
};

const PARTIAL_REGEX = /.*-wip$/;

class MoveTo {
  constructor(config) {
    this.config = config;

    this._validateConfig();
    this._setClients();
  }

  // PUBLIC METHODS

  handleAction(actionName, options) {
    if (options.prIds) {
      return this.githubClient
        .findPairsFromPullRequestIds(options.prIds)
        .then(pairs => this.updateStories(pairs, actionName, options));
    }
  }

  updateStories(pairs, actionName, options) {
    return new Promise((resolve, reject) => {
      eachSeries(pairs, (pair, cb) => {
        this.updateStory(pair, actionName, options).then(() => cb());
      }, (err) => err ? reject(err) : resolve());
    });
  }

  updateStory(pair, actionName, options) {
    let {storyId, pullRequestId} = pair;
    const isPartial = new RegExp(PARTIAL_REGEX).test(storyId);
    const cleanStoryId = isPartial ? storyId.replace(PARTIAL_REGEX, '') : storyId;

    return this.projectClient.handleAction(actionName, cleanStoryId, pullRequestId, isPartial);
  }

  // PIVATE METHODS

  _validateConfig(config) {
    let requiredConfigs = [
      ['projectSource','projectSource'],
      ['projectId','projectId'],
      ['github.owner','github.owner'],
      ['github.repo','github.repo'],
      ['tokens.github', 'GITHUB_TOKEN']
    ];

    if (this.config.projectSource === 'trello') {
      requiredConfigs.push(['tokens.trello', 'TRELLO_TOKEN']);
    }

    if (this.config.projectSource === 'pivotal') {
      requiredConfigs.push(['tokens.pivotal', 'PIVOTAL_TOKEN']);
    }

    const missingConfigs = requiredConfigs.reduce((missing, test) => {
      if (!get(this.config, test[0])){
        missing.push[test[1]];
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
    this.githubClient = new GithubClient(this.config);
    this.projectClient = new (CLIENTS[this.config.projectSource])(this.config);
  }
}

export default MoveTo;
