'use strict'

const jestConfig = require('./jest.config')

module.exports = {
  ...jestConfig,
  testMatch: ['**/?(*.)+(spec|test).integration.[tj]s?(x)'],
}
