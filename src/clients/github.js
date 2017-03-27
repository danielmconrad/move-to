'use strict';

import _ from 'lodash';
import GitHubApi from 'github';
import Client from './index';


class GithubClient extends Client {

  setApi() {
    this.api = GitHubApi(this._getApiOptions());

    this.api.authenticate({
      type: 'token',
      token: this.config.tokens.github
    });
  }

  findPrNumbersFromDiff(diff) {
    const [base, head] = diff;
    const {repo, owner} = this.config.github;

    this.api.repos.compareCommits({repo, owner, base, head});
      // .then(({data}) => {
      //   console.log(data.commits)
      // });

    return Promise.reject();
  }

  findPairsFromPrNumbers(prNumbers) {
    return this.findPrs(prNumbers)
      .then(prs => _.flatten(prs.map(pr => this.getPairsFromPr(pr))));
  }

  findPrs(prNumbers) {
    return Promise.all(prNumbers.map(id => this.findPr(id)));
  }

  findPr(number) {
    const {owner, repo} = this.config.github;

    return this.api.pullRequests
      .get({owner, repo, number})
      .then(({data}) => data);
  }

  getPairsFromPr(pr) {
    const {storiesSource, storiesRegex} = this.config;
    const stringContainingStories = _.get(pr, storiesSource);
    const [storiesString] = stringContainingStories.match(storiesRegex);
    const prNumber = pr.number;

    return storiesString
      .replace(/[\(\)\[\]#]/g, '')
      .split(',')
      .map(storyId => ({storyId, prNumber}));
  }

  _getApiOptions() {
    const {apiHost, apiPathPrefix} = this.config.github;

    let apiOptions = Object.assign({}, {
      protocol: 'https',
      headers: {
        'user-agent': 'MoveTo CLI'
      },
      timeout: 5000
    });

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
