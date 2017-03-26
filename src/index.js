'use strict';

import PivotalClient from './clients/pivotal';
import TrelloClient from './clients/trello';
import GithubClient from './clients/github';

class MoveTo {
  constructor(config) {
    this._setGithubClient(config);
    this._setProjectClient(config);
    this.config = config;
  }

  // PUBLIC METHODS

  handleAction(actionName, options) {
    if (options.prIds) {
      return this.githubClient
        .findStoryIdsFromPullRequestIds(options.prIds)
        .then(storyIds => this.updateStories(storyIds, actionName, options));
    }
  }

  updateStories(storyIds, actionName, options) {
    return Promise.all(storyIds.map(storyId => this.updateStory(storyId, actionName, options)));
  }

  updateStory(storyId, actionName, options) {
    let action = Object.assign({}, this.config[actionName]);

    const isPartial = new RegExp(this.config.partialRegex).test(storyId);

    this.projectClient.handleAction(actionName, storyId, isPartial);
  }

  // PIVATE METHODS

  _setGithubClient(config) {
    this.githubClient = new GithubClient(config);
  }

  _setProjectClient(config) {
    switch (config.projectSource) {
      case 'trello':
        this.projectClient = new TrelloClient(config);
        break;
      case 'pivotal':
      default:
        this.projectClient = new PivotalClient(config);
        break;
    }
  }
}

export default MoveTo;
