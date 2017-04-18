'use strict';

import yml from 'js-yaml';
import fs from 'fs';
import path from 'path';

const packagePath = path.join(process.cwd(), 'package.json');
const travisPath = path.join(process.cwd(), '.travis.yml');

export function addTravisTask() {
  console.log('Adding task to your .travis.yml file.');

  let travisContent = yml.safeLoad(fs.readFileSync(travisPath, 'utf8'));
  travisContent.before_script = travisContent.before_script || [];
  travisContent.before_script.push('npm run move-to-ci');
  fs.writeFileSync(travisPath, yml.dump(travisContent));

  const packageJson = require(packagePath);
  packageJson.scripts = Object.assign(packageJson.scripts, {
    'move-to-ci': 'move-to ci'
  });
  fs.writeFileSync(travisPath, yml.dump(travisContent));
}
