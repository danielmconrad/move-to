'use strict';

export function parseArray(str) {
  return (str || '').split(',').map(item => item.trim());
}

export function parseDiff(str) {
  return (str || '').split('...').map(item => item.trim());
}
