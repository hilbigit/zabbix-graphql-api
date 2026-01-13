import {
    createHierarchicalValueFieldResolver,
    zabbixItemValueSourceFieldMapper,
    zabbixTagsValueSourceFieldMapper
} from "./resolver_helpers.js";
import {makeExecutableSchema, mergeSchemas} from "@graphql-tools/schema";
import {readFileSync} from "fs";
import {GraphQLSchema} from "graphql/type";
import {createResolvers} from "./resolvers.js";
import {readdirSync} from "node:fs";


const createZabbixHierarchicalDeviceFieldResolver =
    (typename: string, schema: any, additionalMappings: { [p: string]: any } = {}) => {
        return {
            ...createHierarchicalValueFieldResolver(schema, typename, zabbixItemValueSourceFieldMapper),
            ...additionalMappings
        }
    }
const createZabbixHierarchicalDeviceTagsResolver =
    (typename: string, schema: any, additionalMappings: { [p: string]: any } = {}) => {
        return {
            ...createHierarchicalValueFieldResolver(schema, typename, zabbixTagsValueSourceFieldMapper),
            ...additionalMappings
        }
    }
export async function schema_loader(): Promise<GraphQLSchema> {
    const resolvers = createResolvers();
    const schemaPath = process.env.SCHEMA_PATH || './src/schema/';
    var schemaFiles = readdirSync(schemaPath).filter(fn => fn.endsWith('.graphql'));
    let typeDefs: string = "";
    for (const schemaFile of schemaFiles) {
        typeDefs += readFileSync(schemaPath + schemaFile, {encoding: 'utf-8'});
    }
    if (process.env.ADDITIONAL_SCHEMAS) {
        for (const schema of process.env.ADDITIONAL_SCHEMAS.split(",")){
            typeDefs += readFileSync(schema, {encoding: 'utf-8'});
        }
    }

    let originalSchema =
        makeExecutableSchema({
            typeDefs,
            resolvers,
        });
    let additionalMappings = {
        tags: (parent: { tags: any; inheritedTags: any }) => {
            return (parent.tags || []).concat(parent.inheritedTags || [])
        }
    }
    let genericResolvers: Record<string, any> = {
        Device: createZabbixHierarchicalDeviceFieldResolver("Device", originalSchema,additionalMappings ),
        GenericDevice: createZabbixHierarchicalDeviceFieldResolver("GenericDevice", originalSchema, additionalMappings),
    }
    if (process.env.ADDITIONAL_RESOLVERS) {
        for (const resolver of process.env.ADDITIONAL_RESOLVERS.split(",")){
            genericResolvers[resolver] = createZabbixHierarchicalDeviceFieldResolver(resolver, originalSchema, additionalMappings)
        }
    }
    return mergeSchemas({
        schemas: [originalSchema],
        // TODO Generate resolvers for all schema types with @generateZabbix directive automatically
        resolvers: genericResolvers
    });
}
