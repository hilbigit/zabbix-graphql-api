import {GraphQLResolveInfo} from "graphql";
import {getRequestedFields} from "../api/graphql_utils.js";

/**
 * Helper class to map GraphQL request information to the fields needed from Zabbix.
 */
export class GraphqlParamsToNeededZabbixOutput {
    /**
     * Maps the requested fields for allHosts query.
     * @param info - The GraphQL resolve info.
     * @returns An array of field names.
     */
    static mapAllHosts(info: GraphQLResolveInfo): string[] {
        return getRequestedFields(info);
    }

    /**
     * Maps the requested fields for allDevices query.
     * @param info - The GraphQL resolve info.
     * @returns An array of field names.
     */
    static mapAllDevices(info: GraphQLResolveInfo): string[] {
        return getRequestedFields(info);
    }

    /**
     * Maps the requested fields for allHostGroups query.
     * @param info - The GraphQL resolve info.
     * @returns An array of field names.
     */
    static mapAllHostGroups(info: GraphQLResolveInfo): string[] {
        return getRequestedFields(info);
    }

    /**
     * Maps the requested fields for templates query.
     * @param info - The GraphQL resolve info.
     * @returns An array of field names.
     */
    static mapTemplates(info: GraphQLResolveInfo): string[] {
        return getRequestedFields(info);
    }
}
