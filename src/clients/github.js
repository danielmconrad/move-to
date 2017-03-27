'use strict';

import GitHubApi from 'github';
import {flatten, get} from 'lodash';

const API_OPTIONS = {
  protocol: 'https',
  headers: {
    'user-agent': 'MoveTo CLI'
  },
  timeout: 5000
};

const STORIES_REGEX = /\((#[a-zA-Z0-9-]+,? ?)+\)/;

class GithubClient {
  constructor(config) {
    this.config = config;
    this._setApi();
  }

  // PUBLIC METHODS

  findPairsFromPullRequestIds(pullRequestIds) {
    return this.findPullRequests(pullRequestIds)
      .then((pullRequests) => {
        return flatten(pullRequests.map((pullRequest) => {
          return this.getPairsFromPullRequest(pullRequest);
        }));
      });
  }

  findPullRequests(pullRequestIds) {
    return Promise.all(pullRequestIds.map(id => this.findPullRequest(id)));
  }

  findPullRequest(number) {
    const {owner, repo} = this.config.github;

    return this.api.pullRequests
      .get({owner, repo, number})
      .then(({data}) => data);
  }

  getPairsFromPullRequest(pullRequest) {
    const {storiesSource} = this.config.github;
    const stringContainingStories = get(pullRequest, storiesSource);
    const [storiesString] = stringContainingStories.match(STORIES_REGEX);

    return storiesString
      .replace(/[\(\)]/g, '')
      .split(',')
      .map((str) => {
        const storyId = str.replace('#', '').trim();
        return {pullRequestId: pullRequest.number, storyId: storyId};
      });
  }

  // PRIVATE METHODS

  _setApi() {
    this.api = GitHubApi(this._getApiOptions());

    this.api.authenticate({
      type: 'token',
      token: this.config.tokens.github
    });
  }

  _getApiOptions() {
    const {apiHost, apiPathPrefix} = this.config.github;
    let apiOptions = Object.assign({}, API_OPTIONS);

    if (apiHost) {
      apiOptions.host = apiHost;
    }

    if (apiPathPrefix) {
      apiOptions.pathPrefix = apiPathPrefix;
    }

    return apiOptions;
  }
}

export default GithubClient;
