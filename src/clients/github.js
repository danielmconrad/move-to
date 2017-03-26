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

class GithubClient {
  constructor({github} = config) {
    this.clientConfig = github;
    this.api = GitHubApi(this._getApiOptions());

    this.api.authenticate({
      type: 'token',
      token: process.env.GITHUB_TOKEN,
    });
  }

  // PUBLIC METHODS

  findStoryIdsFromPullRequestIds(pullRequestIds) {
    return this.findPullRequests(pullRequestIds)
      .then((pullRequests) => {
        return flatten(pullRequests.map((pullRequest) => {
          return this.getStoryIdsFromPullRequest(pullRequest);
        }));
      });
  }

  findPullRequests(pullRequestIds) {
    return Promise.all(pullRequestIds.map(id => this.findPullRequest(id)));
  }

  findPullRequest(number) {
    const {owner, repo} = this.clientConfig;

    return this.api.pullRequests
      .get({owner, repo, number})
      .then(({data}) => data);
  }

  getStoryIdsFromPullRequest(pullRequest) {
    const {storySource, storyExtract} = this.clientConfig;
    const stringContainingStories = get(pullRequest, storySource);
    const [storiesString] = stringContainingStories.match(storyExtract);

    return storiesString
      .replace(/[\(\)]/g, '')
      .split(',')
      .map(str => str.replace('#', '').trim());
  }

  // PRIVATE METHODS

  _getApiOptions() {
    const {apiHost, apiPathPrefix} = this.clientConfig;
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
