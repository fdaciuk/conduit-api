'use strict'

module.exports = {
  preset: 'ts-jest',
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  moduleNameMapper: {
    '@/(.*)': '<rootDir>/src/$1',
  },
}
