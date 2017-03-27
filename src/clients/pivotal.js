'use strict';

import PivotalApi from 'pivotaltracker';
import mustache from 'mustache';
import {
  concat,
  defaultsDeep,
  find,
  reject,
  omit,
  uniqBy
} from 'lodash';


class PivotalClient {
  constructor(config) {
    this.config = config;
    this._setApi();
  }

  // PUBLIC METHODS

  handleAction(actionName, storyId, pullRequestId, isPartial) {
    return this.updateStory(storyId, actionName, isPartial);
  }

  findStory(storyId) {
    return new Promise((resolve, reject) => {
      this.api.story(storyId).get(function(error, story) {
        return error ? reject(error) : resolve(story);
      });
    });
  }

  updateStory(storyId, actionName, isPartial) {
    const action = this._getAction(actionName, isPartial);

    return new Promise((resolve, reject) => {
      return this.findStory(storyId).then((story) => {
        if (!this._shouldUpdateStory(story, actionName)) {
          return resolve();
        }

        const updateData = this._getUpdateData(story, actionName);

        this.api.story(storyId).update(updateData, function(error, story) {
          if (error) {
            return reject(error);
          }

          if(!action.comment) {
            return resolve();
          }

          this.addActionComment(actionName, storyId, pullRequestId, story)
            .then(resolve)
            .catch(reject);
        });
      });
    });
  }

  addActionComment(actionName, storyId, pullRequestId, story) {
    const text = this._getActionComment(actionName, storyId, pullRequestId);
    return this.addComment(storyId, text);
  }

  addComment(storyId, text) {
    return new Promise((resolve, reject) => {
      this.api.story(storyId).comments.create({text}, function(error) {
        return error ? reject(error) : resolve();
      });
    });
  }

  // PRIVATE METHODS

  _setApi() {
    this.api = new PivotalApi
      .Client(this.config.tokens.pivotal)
      .project(this.config.projectId);
  }

  _getAction(actionName, isPartial) {
    return omit(this.config.actions[actionName], isPartial ? 'state' : '');
  }

  _shouldUpdateStory(story, actionName) {
    return !find(story.labels, {name: this._getActionLabel()});
  }

  _getActionLabel(actionName) {
    return `${actionName}-${this.config.github.repo}`
  }

  _getActionLabels() {
    return Object.keys(this.config.actions).map(key => this._getActionLabel(key));
  }

  _getUpdateData(story, actionName) {
    const action = this._getAction(actionName);
    const actionLabel = this._getActionLabel(actionName);
    const actionLabels = this._getActionLabels();

    let updateData = {};
    let labels = [].concat(story.labels);

    // Remove labels
    labels = reject(labels, ({name}) => {
      const inRemoveLabels = (action.removeLabels || []).includes(name);
      const inActionNames = actionLabels.includes(name);
      return inRemoveLabels || inActionNames;
    });

    // Add labels
    labels = labels.concat((action.addLabels || []).map(name => ({name})));
    labels.push(actionLabel);
    labels = uniqBy(labels, 'name');

    updateData.labels = labels;

    if (action.state) {
      updateData.currentState = action.state;
    }

    return updateData;
  }

  _getActionComment(actionName, storyId, pullRequestId) {
    const action = this._getAction(actionName);
    const view = Object.assign({pullRequestId}, this.config);
    return mustache.render(action.comment, view);
  }
}

export default PivotalClient;
