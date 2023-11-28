module.exports = {
    // general
    rootDir: '../../',
    preset: 'ts-jest/presets/default-esm',
    modulePaths: ['<rootDir>/src/'],
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
    // coverage
    collectCoverageFrom: ["src/**/*.ts", "!**/__tests__/**/*"],
    coveragePathIgnorePatterns: [
        "<rootDir>/src/index.ts",
        "<rootDir>/src/constants.ts",
        "<rootDir>/src/helpers/cache/migrations/index.ts"
    ],
    // jest
    setupFilesAfterEnv: ['<rootDir>/meta/testing/jest.setup.cjs'],
    maxWorkers: "50%",
    testRegex: '(/__tests__/.*\\.spec)\\.ts?$',
    testTimeout: 25000,
    transform: {
        "^.+\\.[tj]s$": "ts-jest"
    }
};
