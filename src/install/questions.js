export default [{
  name: 'projectSource',
  message: 'What are you using to manage your stories?',
  type: 'list',
  choices: [
    {name: 'Pivotal Tracker', value: 'pivotal'}
    // {name: 'Trello', value: 'trello'}
  ]
}, {
  when: (a => a.projectSource === 'pivotal'),
  name: 'projectId',
  message: 'What is your Pivotal Project ID? (123456)',
  validate: input => /^[0-9]{6,}/.test(input)
}, {
  when: (a => a.projectSource === 'trello'),
  name: 'projectId',
  message: 'What is your Trello Project ID? (abcd1234)',
  validate: input => /^[0-9a-zA-Z]{8}/.test(input)
}, {
  name: 'isEnterprise',
  message: 'Do you have a self-hosted Enterprise Github?',
  type: 'confirm',
  default: false
}, {
  when: (a => a.isEnterprise),
  name: 'githubUrl',
  message: 'What is your Github url?',
  default: 'http://www.github.com'
}, {
  when: (a => a.isEnterprise),
  name: 'githubApiHost',
  message: 'What is your Github API domain?',
  default: 'api.github.com'
}, {
  when: (a => a.isEnterprise),
  name: 'githubApiPath',
  message: 'What is your Github API path prefix?',
  default: 'null'
}, {
  name: 'storiesSource',
  message: 'Where in your PRs do you place your story ids?',
  type: 'list',
  choices: [
    {name: 'Title', value: 'title'},
    {name: 'Milestone', value: 'milestone.title'},
    {name: 'Body', value: 'body'}
  ]
}];
