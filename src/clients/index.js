'use strict';

import _ from 'lodash';
import mustache from 'mustache';

class Client {
  constructor(config) {
    this.config = config;
    this.setApi();
  }

  // setApi() {
  // }

  // findStory(storyId) {
  // }

  // addComment(storyId, text) {
  // }

  // updateStory(storyId, updateData) {
  // }

  // shouldUpdateStory(story, stateName) {
  // }

  // getUpdateData(story, stateName) {
  // }

  handleStateChange(stateName, storyId, prNumber, isPartial) {
    return this.findStory(storyId).then((story) => {
      if (!this.shouldUpdateStory(story, stateName)) {
        return null;
      }

      const state = this.getState(stateName, isPartial);
      const updateData = this.getUpdateData(story, stateName);

      return this.updateStory(storyId, updateData).then(() => {
        if (!state.comment) {
          return null;
        }

        return this.addStateComment(stateName, storyId, prNumber);
      });
    });
  }

  addStateComment(stateName, storyId, prNumber) {
    const text = this.getStateComment(stateName, storyId, prNumber);
    return this.addComment(storyId, text);
  }

  getState(stateName, isPartial) {
    return _.omit(this.config.states[stateName], isPartial ? 'status' : '');
  }

  getStateLabel(stateName) {
    return `${stateName}-${this.config.github.repo}`;
  }

  getStateLabels() {
    return Object.keys(this.config.states).map(key => this.getStateLabel(key));
  }

  getStateComment(stateName, storyId, prNumber) {
    const state = this.getState(stateName);
    const {url, owner, repo} = this.config;

    const view = Object.assign({
      prNumber: prNumber,
      prUrl: [url, owner, repo, prNumber].join('/')
    }, this.config);

    return mustache.render(state.comment, view);
  }
}

export default Client;
