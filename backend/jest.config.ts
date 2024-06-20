// jest.config.ts
import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
	preset: "ts-jest",
	testEnvironment: "node",
	moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
	rootDir: "./", // Base directory
	testMatch: ["<rootDir>/src/tests/**/*.test.ts"], // Path to test files
	moduleDirectories: ["node_modules", "src"], // Allow imports from src directory
	moduleNameMapper: {
		"^@models/(.*)$": "<rootDir>/src/models/$1", // Map @models alias to src/models directory
		"^@services/(.*)$": "<rootDir>/src/services/$1", // Map @services alias to src/services directory
		"^@utils/(.*)$": "<rootDir>/src/utils/$1", // Map @utils alias to src/utils directory
	},
	verbose: true,
	collectCoverageFrom: [
		"<rootDir>/src/**/*.ts",
		"!src/**/*.d.ts", // Exclude type declaration files
		"!src/**/index.ts", // Optionally exclude index files
		"!src/**/*.test.ts", // Exclude test files
		"!src/validations/*",
		"!src/app.ts",
		"!src/routes/*",
		"!src/util/*",
	],
	coverageDirectory: "coverage",
	coverageReporters: ["text", "lcov", "html"],
	transform: {
		"^.+\\.ts$": [
			"ts-jest",
			{
				// Transform TypeScript files using ts-jest
				tsconfig: "<rootDir>/tsconfig.json", // Path to your tsconfig.json
			},
		],
	},
};

export default config;
