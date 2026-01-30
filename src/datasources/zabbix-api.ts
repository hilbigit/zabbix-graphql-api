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

export class ZabbixAPI
    extends RESTDataSource {
    private static readonly MAX_LOG_REQUEST_BODY_LIMIT_LENGTH = 500

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

    async executeRequest<T extends ZabbixResult, A extends ParsedArgs>(zabbixRequest: ZabbixRequest<T, A>, args?: A, throwApiError: boolean = true): Promise<T | ZabbixErrorResult> {
        return throwApiError ? zabbixRequest.executeRequestThrowError(this, args) : zabbixRequest.executeRequestReturnError(this, args);
    }

    async requestByPath<T extends ZabbixResult, A extends ParsedArgs = ParsedArgs>(path: string, args?: A, authToken?: string | null, cookies?: string, throwApiError: boolean = true) {
        return this.executeRequest<T, A>(new ZabbixRequest<T>(path, authToken, cookies), args, throwApiError);
    }

    async getLocations(args?: ParsedArgs, authToken?: string, cookies?: string) {
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
