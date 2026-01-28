// Import after mocking Config
import {logger, Loglevel} from "../logging/logger.js";

// Mocking Config
jest.mock("../common_utils.js", () => ({
    Config: {
        LOG_LEVELS: "ERROR,INFO"
    }
}));

describe("Logger Config Mocking", () => {
    test("logger levels are initialized from Config", () => {
        expect(logger.levels).toBeDefined();
        expect(logger.levels?.has(Loglevel.ERROR)).toBe(true);
        expect(logger.levels?.has(Loglevel.INFO)).toBe(true);
        expect(logger.levels?.has(Loglevel.DEBUG)).toBe(false);
    });
});
