const nextJest = require('next/jest')

const createJestConfig = nextJest({
  	dir: './',
})

module.exports = createJestConfig({
	preset: 'ts-jest',
	testEnvironment: 'jest-environment-jsdom',
	setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
	transform: {
    	'^.+\\.(ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  	},
	moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
	collectCoverage: true,
	collectCoverageFrom: [
		'**/*.{js,jsx,ts,tsx}',
		'!**/node_modules/**',
		'!**/.next/**',
		'!**/out/**',
  	],
  	coveragePathIgnorePatterns: [
		'/node_modules/',
		'babel.config.js',
		'jest.config.js',
		'tailwind.config.ts',
		'coverage/lcov-report/block-navigation.js',
		'coverage/lcov-report/prettify.js',
		'coverage/lcov-report/sorter.js',
		'testingHelpers/renderWithProviders.tsx',
		'testingHelpers/testUtils.tsx',
		'src/app/layout.tsx'
  	],
	modulePathIgnorePatterns: ['<rootDir>/.next/'],
	moduleNameMapper: {
		'^@/components/(.*)$': '<rootDir>/components/$1',
		'^@/pages/(.*)$': '<rootDir>/pages/$1',
  	},
	resetMocks: true,
	restoreMocks: true,
	clearMocks: true,
})