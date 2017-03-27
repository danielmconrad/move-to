'use strict';

import Client from './index';

class TrelloClient extends Client {

  setApi() {
    // Must implement
  }

  findStory(storyId) {
    // Must implement
  }

  addComment(storyId, text) {
    // Must implement
  }

  updateStory(storyId, updateData) {
    // Must implement
  }

  shouldUpdateStory(story, stateName) {
    // Must implement
  }

  getUpdateData(story, stateName) {
    // Must implement
  }
}

export default TrelloClient;
