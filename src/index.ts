import {startAPi} from "./api/start.js";
import {logger} from "./logging/logger.js";
import {Config} from "./common_utils.js";

// Determine and log the operation mode first:
//  Controller and api share the same code base
//  but may run independently

if (Config.DRY_RUN) {
    logger.info("Dry run mode - exiting directly without starting anything")
    process.exit(0)
}
startAPi()


