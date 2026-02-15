export default {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/?(*.)+(spec|test).ts'],
    moduleFileExtensions: ['ts', 'js'],
    transform: {
        '^.+\\.ts$': ['ts-jest', {
            tsconfig: './tsconfig.json'
        }]
    },
    collectCoverage: true,
    coverageDirectory: 'coverage',
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    }
}; 