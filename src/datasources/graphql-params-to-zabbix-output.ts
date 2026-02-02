import {GraphQLResolveInfo} from "graphql";
import {getRequestedFields} from "../api/graphql_utils.js";
import {
    QueryAllDevicesArgs,
    QueryAllHostGroupsArgs,
    QueryAllHostsArgs,
    QueryTemplatesArgs
} from "../schema/generated/graphql.js";

export class GraphqlParamsToNeededZabbixOutput {
    static mapAllHosts(args: QueryAllHostsArgs, info: GraphQLResolveInfo): string[] {
        return getRequestedFields(info);
    }

    static mapAllDevices(args: QueryAllDevicesArgs, info: GraphQLResolveInfo): string[] {
        return getRequestedFields(info);
    }

    static mapAllHostGroups(args: QueryAllHostGroupsArgs, info: GraphQLResolveInfo): string[] {
        return getRequestedFields(info);
    }

    static mapTemplates(args: QueryTemplatesArgs, info: GraphQLResolveInfo): string[] {
        return getRequestedFields(info);
    }
}
