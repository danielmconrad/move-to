'use strict';

import _ from 'lodash';
import PivotalApi from 'pivotaltracker';

import Client from './index';

class PivotalClient extends Client {
  setApi() {
    this.api = new PivotalApi
      .Client(this.config.tokens.pivotal)
      .project(this.config.projectId);
  }

  findStory(storyId) {
    return new Promise((resolve, reject) => {
      this.api.story(storyId).get((error, story) => {
        return error ? reject(error) : resolve(story);
      });
    });
  }

  updateStory(storyId, updateData) {
    return new Promise((resolve, reject) => {
      this.api.story(storyId).update(updateData, (error, story) => {
        return error ? reject(error) : resolve(story);
      });
    });
  }

  addComment(storyId, text) {
    return new Promise((resolve, reject) => {
      this.api.story(storyId).comments.create({text}, (error) => {
        return error ? reject(error) : resolve();
      });
    });
  }

  shouldUpdateStory(story, stateName) {
    return !_.find(story.labels, {name: this.getStateLabel(stateName)});
  }

  getUpdateData(story, stateName) {
    const state = this.getState(stateName);
    const stateLabel = this.getStateLabel(stateName);
    const stateLabels = this.getStateLabels();

    let updateData = {};
    let labels = [].concat(story.labels);

    // Remove labels
    labels = _.reject(labels, ({name}) => {
      const inRemoveLabels = (state.removeLabels || []).includes(name);
      const inStateNames = stateLabels.includes(name);
      return inRemoveLabels || inStateNames;
    });

    // Add labels
    labels = labels.concat((state.addLabels || []).map(name => ({name})));
    labels.push(stateLabel);
    labels = _.uniqBy(labels, 'name');

    updateData.labels = labels;

    if (state.moveTo) {
      updateData.currentState = state.moveTo;
    }

    return updateData;
  }
}

export default PivotalClient;
