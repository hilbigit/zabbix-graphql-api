import {
    DataSourceConfig,
    DataSourceFetchResult,
    DataSourceRequest,
    PostRequest,
    RESTDataSource
} from "@apollo/datasource-rest";
import {logger} from "../logging/logger.js";
import {ParsedArgs, ZabbixErrorResult, ZabbixRequest, ZabbixResult} from "./zabbix-request.js";
import {Config} from "../common_utils.js";

export const zabbixDevelopmentToken = Config.ZABBIX_DEVELOPMENT_TOKEN
export const zabbixPrivilegeEscalationToken = Config.ZABBIX_PRIVILEGE_ESCALATION_TOKEN
export const ZABBIX_EDGE_DEVICE_BASE_GROUP = Config.ZABBIX_EDGE_DEVICE_BASE_GROUP || Config.ZABBIX_ROADWORK_BASE_GROUP || "Roadwork"
export const FIND_ZABBIX_EDGE_DEVICE_BASE_GROUP_PREFIX = new RegExp(`^(${ZABBIX_EDGE_DEVICE_BASE_GROUP})\/`)

/**
 * Data source for interacting with the Zabbix API.
 * Extends RESTDataSource to handle JSON-RPC requests to Zabbix.
 */
export class ZabbixAPI
    extends RESTDataSource {
    private static readonly MAX_LOG_REQUEST_BODY_LIMIT_LENGTH = 500

    /**
     * @param baseURL - The base URL of the Zabbix API.
     * @param config - Optional data source configuration.
     */
    constructor(public baseURL: string, config?: DataSourceConfig) {
        super(config);
        logger.info("Connecting to Zabbix at url=" + this.baseURL)
    }

    override async fetch<Object>(path: string, incomingRequest: DataSourceRequest = {}): Promise<DataSourceFetchResult<Object>> {
        logger.debug(`Zabbix request path=${path}, body=${JSON.stringify(incomingRequest.body).substring(0, ZabbixAPI.MAX_LOG_REQUEST_BODY_LIMIT_LENGTH)} (...)`)

        let response_promise: Promise<DataSourceFetchResult<Object>> = super.fetch("api_jsonrpc.php", incomingRequest);
        try {
            const response = await response_promise;
            const body = response.parsedBody;
            return await new Promise!<DataSourceFetchResult<Object>>((resolve) => {
                if (body && body.hasOwnProperty("result")) {
                    // @ts-ignore
                    let result: any = body["result"];
                    response.parsedBody = result;
                    if (result) {
                        logger.debug(`Found and returned result - length = ${result.length}`);
                        if (!Array.isArray(result) || !result.length) {
                            logger.debug(`Result: ${JSON.stringify(result)}`);
                        } else {
                            result.forEach((entry: any) => {
                                if (entry.hasOwnProperty("tags")) {
                                    entry["tags"].forEach((tag: { tag: string; value: string; }) => {
                                        entry[tag.tag] = tag.value;
                                    });
                                }
                                if (entry.hasOwnProperty("inheritedTags")) {
                                    entry["inheritedTags"].forEach((tag_1: { tag: string; value: string; }) => {
                                        entry[tag_1.tag] = tag_1.value;
                                    });
                                }
                            });
                        }
                    }
                    resolve(response);
                } else {
                    let error_result: any;
                    if (body && body.hasOwnProperty("error")) {
                        // @ts-ignore
                        error_result = body["error"];
                    } else {
                        error_result = body;
                    }
                    logger.error(`No result for Zabbix request body=${JSON.stringify(incomingRequest.body)}: ${JSON.stringify(error_result)}`);
                    resolve(response);
                }
            });
        } catch (reason) {
            let msg = `Unable to retrieve response for request body=${JSON.stringify(incomingRequest.body)}: ${JSON.stringify(reason)}`;
            logger.error(msg);
            return response_promise
        }

    }


    public post<TResult = any>(path: string, request?: PostRequest): Promise<TResult> {
        return super.post(path, request);
    }

    private static version: string | undefined

    /**
     * Retrieves the Zabbix API version.
     * @returns A promise that resolves to the version string.
     */
    async getVersion(): Promise<string> {
        if (!ZabbixAPI.version) {
            const response = await this.requestByPath<string>("apiinfo.version")
            if (typeof response === "string") {
                ZabbixAPI.version = response
            } else {
                return "0.0.0"
            }
        }
        return ZabbixAPI.version
    }

    /**
     * Executes a Zabbix API request.
     * @param zabbixRequest - The request object to execute.
     * @param args - The parsed arguments for the request.
     * @param throwApiError - Whether to throw an error if the request fails (default: true).
     * @param output - The list of fields to return.
     * @returns A promise that resolves to the result or an error result.
     */
    async executeRequest<T extends ZabbixResult, A extends ParsedArgs>(zabbixRequest: ZabbixRequest<T, A>, args?: A, throwApiError: boolean = true, output?: string[]): Promise<T | ZabbixErrorResult> {
        return throwApiError ? zabbixRequest.executeRequestThrowError(this, args, output) : zabbixRequest.executeRequestReturnError(this, args, output);
    }

    /**
     * Executes a Zabbix API request by its method path.
     * @param path - The Zabbix API method path.
     * @param args - The parsed arguments for the request.
     * @param authToken - Optional Zabbix authentication token.
     * @param cookies - Optional session cookies.
     * @param throwApiError - Whether to throw an error if the request fails (default: true).
     * @param output - The list of fields to return.
     * @returns A promise that resolves to the result or an error result.
     */
    async requestByPath<T extends ZabbixResult, A extends ParsedArgs = ParsedArgs>(path: string, args?: A, authToken?: string | null, cookies?: string | null, throwApiError: boolean = true, output?: string[]) {
        return this.executeRequest<T, A>(new ZabbixRequest<T>(path, authToken, cookies), args, throwApiError, output);
    }

    /**
     * Retrieves locations from host inventory.
     * @param args - The parsed arguments for filtering locations.
     * @param authToken - Optional Zabbix authentication token.
     * @param cookies - Optional session cookies.
     * @returns A promise that resolves to an array of location objects.
     */
    async getLocations(args?: ParsedArgs, authToken?: string | null, cookies?: string | null) {
        const hosts_promise = this.requestByPath("host.get", args, authToken, cookies);
        return hosts_promise.then(response => {
            // @ts-ignore
            let locations = response.filter((host) => host.hasOwnProperty("inventory")).map(({inventory: x}) => x);
            if (args?.distinct_by_name || args?.name_pattern) {
                locations = locations.filter((loc: { location: string; }, i: number, arr: any[]) => {
                    return loc.location && (!args.distinct_by_name || arr.indexOf(arr.find(t => t.location === loc.location)) === i)
                        && (!args.name_pattern || new RegExp(args.name_pattern).test(loc.location));
                });
            }
            return locations;
        });
    }
}

export const zabbixAPI = new ZabbixAPI(Config.ZABBIX_BASE_URL)
