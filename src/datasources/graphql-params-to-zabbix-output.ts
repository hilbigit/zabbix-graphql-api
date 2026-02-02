import {GraphQLResolveInfo} from "graphql";
import {getRequestedFields} from "../api/graphql_utils.js";

export class GraphqlParamsToNeededZabbixOutput {
    static mapAllHosts(info: GraphQLResolveInfo): string[] {
        return getRequestedFields(info);
    }

    static mapAllDevices(info: GraphQLResolveInfo): string[] {
        return getRequestedFields(info);
    }

    static mapAllHostGroups(info: GraphQLResolveInfo): string[] {
        return getRequestedFields(info);
    }

    static mapTemplates(info: GraphQLResolveInfo): string[] {
        return getRequestedFields(info);
    }
}
