module.exports = {
    collectCoverageFrom: ['src/**/*.ts'],
    coveragePathIgnorePatterns : [
        "<rootDir>/src/constants.ts"
    ],
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
    modulePaths: ['<rootDir>/src/'],
    rootDir: '../../',
    setupFilesAfterEnv: ['<rootDir>/meta/testing/jest.setup.cjs'],
    testRegex: '(/__tests__/.*\\.spec)\\.ts?$',
    testTimeout: 10000,
    preset: "ts-jest/presets/default-esm",
    verbose: false,
    maxWorkers: "50%",
    transformIgnorePatterns: []
};
