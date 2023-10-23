module.exports = {
    collectCoverageFrom: ['src/**/*.ts'],
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
    modulePaths: ['<rootDir>/src/'],
    rootDir: '../../',
    setupFilesAfterEnv: ['<rootDir>/meta/testing/jest.setup.cjs'],
    testRegex: '(/__tests__/.*\\.spec)\\.ts?$',
    testTimeout: 10000,
    transform: {
        "^.+\\.ts?$": ["ts-jest", {
            useESM: true,
        }],
        "^.+\\.js?$": ["ts-jest", {
            useESM: true,
        }]
    },
    verbose: false,
};
