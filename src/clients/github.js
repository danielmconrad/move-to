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

    return this.api.repos.compareCommits({repo, owner, base, head})
      .then(({data}) => this.getPrNumbersFromCommits(data.commits));
  }

  findPairsFromPrNumbers(prNumbers) {
    return this.findPrs(prNumbers)
      .then(prs => _.flatten(_.compact(prs.map(pr => this.getPairsFromPr(pr)))));
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

  getPrNumbersFromCommits(commits) {
    return _.compact(commits.map(commit => this.getPrNumbersFromCommit(commit)));
  }

  getPrNumbersFromCommit(commit) {
    const {message} = commit.commit;
    const regexMethods = this.config.prInCommitRegexes;

    const regexKey = _.findKey(regexMethods, ({test}) => {
      return new RegExp(test).test(message);
    });

    if (!regexKey) {
      return null;
    }

    const regexMethod = regexMethods[regexKey];
    return message.match(regexMethod.test)[regexMethod.index];
  }

  getPairsFromPr(pr) {
    const prNumber = pr.number;
    const {storiesSource, storiesRegex, storiesRegexIndex} = this.config;
    const stringContainingStories = _.get(pr, storiesSource);
    const matches = stringContainingStories.match(storiesRegex);

    if (!matches) {
      return null;
    }

    const storiesString = matches[storiesRegexIndex];

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
