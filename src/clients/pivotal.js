'use strict';

import PivotalApi from 'pivotaltracker';
import {concat, reject, omit} from 'lodash';



class PivotalClient {
  constructor({pivotal, projectId} = config) {
    this.clientConfig = pivotal;

    this.api = new PivotalApi
      .Client(process.env.PIVOTAL_TOKEN)
      .project(projectId);
  }

  // PUBLIC METHODS

  handleAction(actionName, storyId, pullRequest, isPartial) {
    const action = this._getAction(actionName, isPartial);

    this.findStory(storyId)
      .then(story => this.updateStory(story, action));
  }

  findStory(storyId) {
    return new Promise((resolve, reject) => {
      this.api.story(storyId).get(function(error, story) {
        return error ? reject(error) : resolve(story);
      });
    });
  }

  updateStory(story, action) {
    if (action.removeLabels) {
      story.labels = _.reject(story.labels, action.removeLabels);
    }

    if (action.addLabels) {
      story.labels = _.concat(story.labels, action.addLabels);
    }

    if (action.state) {
      story.currentState = action.state;
    }

    return new Promise((resolve, reject) => {
      this.api.story(storyId).update(newStoryData, function(error, story) {
        return error ? reject(error) : resolve(story);
      });
    });

    console.log({story, action});
  }

  // PRIVATE METHODS

  _getApiToken() {

  }

  _getAction(actionName, isPartial) {
    return omit(this.clientConfig[actionName], isPartial ? 'state' : '');
  }
}

export default PivotalClient;
