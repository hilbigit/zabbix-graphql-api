import {isObjectType} from "graphql";
import {logger} from "../logging/logger.js";
import {Device, Host} from "../schema/generated/graphql.js";

export const isDevice = (value: Host | undefined): value is Device => !!(value as Device)?.deviceType;
/*
    As a default all . - seperators within a key shall be replaced by a Capital letter of the following word
 */
function defaultKeyMappingFunction(key: string): string {
    let words = key.split(".")
    for (let i = 1; i < words.length; i++) {
        if (words[i]) {
            words[i] = words[i][0].toUpperCase() + words[i].substring(1);
        }
    }
    return words.join("")
}

export function createHierarchicalValueFieldResolver(
    schema: any, typename: string,
    sourceFieldMapper: (fieldname: string, parent: any, objectTypeRequested: boolean) => { [p: string]: any } | null): {
    [fieldname: string]: any
} {
    let resolver: { [fieldname: string]: any } = {}

    let type = schema.getType(typename)
    if (isObjectType(type)) {
        let fields = type.getFields();
        for (let fieldsKey in fields) {
            let field = fields[fieldsKey];
            resolver[field.name] = (parent: any) => sourceFieldMapper(field.name, parent, isObjectType(field.type));
        }
    }
    return resolver
}

export function zabbixItemValueSourceFieldMapper(
    fieldname: string,
    parent: {
        items: [{ itemid: string, key_: string; name: string, lastvalue: any }],
        [key: string]: any
    },
    objectTypeRequested: boolean
) {
    let result: { [p: string]: any; } | any = parent[fieldname]
    if (!parent.items) {
        logger.debug(`No parent.items found: ${JSON.stringify(parent)}`)
        return result
    }
    parent.items.forEach(
        item => {
            result = mapAttributeListToGraphQlType(result, objectTypeRequested, fieldname, {
                    key: item.key_,
                    value: item.lastvalue
                }
            )
        }
    )
    logger.info(`Device data mapped:  ${JSON.stringify(result)}`)

    return result;
}

export function zabbixTagsValueSourceFieldMapper(
    fieldname: string,
    tags:  [{ tag: string, value: any }],
    objectTypeRequested: boolean
) {
    let result: { [p: string]: any; } | any = {}
    if (!tags) {
        logger.debug(`No parent.tags or parent.inheritedTags found: ${JSON.stringify(tags)}`)
        return result
    }
    tags.forEach(
        tag => {
            result = mapAttributeListToGraphQlType(result, objectTypeRequested, fieldname, {
                    key: tag.tag,
                    value: tag.value
                }
            )
        }
    )
    logger.info(`Device tags mapped:  ${JSON.stringify(result)}`)

    return result;
}

function mapAttributeListToGraphQlType(result: {
    [p: string]: any;
} | any, objectTypeRequested: boolean, fieldname: string, item: { value: any, key: string }) {

    logger.debug(`Resolving ${objectTypeRequested ? "attributes of object" : "value of scalar"} field parent.${fieldname} (${result}), looking up key from item ${JSON.stringify(item)}`)
    if (item.key) {
        if (objectTypeRequested) {
            function addRecursive(
                result: { [x: string]: any; } | null,
                fieldHierarchy: string[],
                value: any
            ) {
                if (!fieldHierarchy || fieldHierarchy.length == 0) {
                    return result

                } else {
                    if (!result) {
                        result = {}
                    }
                    if (fieldHierarchy.length == 1) {
                        let fieldTokenName = fieldHierarchy[0];
                        const TOKEN_SEPERATOR = "_";

                        // As value is not typed we must parse the type in order to transform it to a strongly
                        // typed value which is expected by  Graphql
                        // Example: Graphql does not accept a string "true" and empty string as false as boolean
                        // In order to facilitate this it is possible (but not mandatory) to provide typehints
                        // to item keys by prepending the fieldTokenName with a typehint, following by an underscore.
                        // I.e. if a key is prefixed with str_, bool_, float_ or json_ this will be stripped
                        // and the value will be cast to the appropriate type.
                        // If no typeHint is provided and the type is string it will be tried to create a float
                        // or a boolean out of it.
                        let typeHintToken = fieldTokenName.split(TOKEN_SEPERATOR);
                        let typeHint = undefined;
                        if (typeHintToken.length > 0) {
                            switch (typeHintToken[0]) {
                                case "str":
                                case "bool":
                                case "float":
                                case "json":
                                    typeHint = typeHintToken[0];
                                    // Remove typehint + token separator from field name - if the typehint
                                    // is followed by another token. If not (e.g. fieldTokenName="str" only) the
                                    // token is considered to be a valid typehint, but it is not stripped from the
                                    // fieldTokenName (i.e. nothing happens to the fieldTokenName in that case)
                                    if (typeHintToken.length > 1) {
                                        fieldTokenName = fieldTokenName.substring(typeHint.length + 1);
                                    }
                            }
                        }
                        let fieldValue = undefined;

                        if (typeof value === 'string' && (typeHint == "bool" || value.toLowerCase() === 'true' || value.toLowerCase() === 'false')) {
                            fieldValue = (value.toLowerCase() === 'true');
                            // logger.debug("Parsing attribute '" + fieldTokenName + "' as true/false string, type=" + typeof fieldValue + ", value=" + fieldValue);
                        } else if (typeof value === 'string' && value !== '' && !isNaN(Number(value))) {
                            fieldValue = Number(value);
                            // logger.debug("Parsing attribute '" + fieldTokenName + "' as number, type=" + typeof fieldValue + ", value=" + fieldValue);
                        } else if (typeof value === 'string' && typeHint == "json") {
                            logger.debug("Trying to parse attribute value as json, typeHint=" + typeHint + ", type=" + typeof value + ", value=" + value);
                            if (!value) {
                                // Empty string values will be considered to be an unset JSON-Object if there is a typeHin=="json"
                                fieldValue = undefined;
                            } else {
                                try {
                                    fieldValue = JSON.parse(value);
                                    // logger.debug("Parsing attribute '" + fieldTokenName + "' as json, type=" + typeof fieldValue + ", value=" + value);
                                } catch (e) {
                                    logger.debug("Unable to parse attribute value as json, passing unmodified, type=" + typeof value + ", value=" + value);
                                    fieldValue = value;
                                }
                            }
                        } else {
                            fieldValue = value;
                            // logger.debug("Passing attribute '" + fieldTokenName + "' unmodified, type=" + typeof fieldValue + ", value=" + fieldValue);
                        }
                        if (fieldValue !== undefined) {
                            // logger.debug(`length of parsed field hierarchy is 1: Setting fieldTokenName=${fieldTokenName} to ${value}`);
                            result[fieldTokenName] = fieldValue;
                        } /*else {
                            // logger.debug(`length of parsed field hierarchy is 1: Skipping to set fieldHierarchy=${fieldHierarchy} to ${value} (empty value)`);
                        }*/
                    } else {
                        result[fieldHierarchy[0]] = addRecursive(result[fieldHierarchy[0]], fieldHierarchy.slice(1), value)
                    }
                }
                logger.debug(`Adding attribute ${fieldHierarchy[0]}, result:  ${JSON.stringify(result)}`)

                return result
            }

            let fieldHierarchy = item.key.split(".");
            if (fieldHierarchy[0] == fieldname) {
                result = addRecursive(result, fieldHierarchy.slice(1), item.value);
                logger.debug(`Detected matching item key ${fieldname} in item , result:  ${JSON.stringify(result)}`)
            } else {
                logger.debug(`Item key ${fieldHierarchy[0]} not matched fieldname=${fieldname}, result:  ${JSON.stringify(result)}`)
            }

        } else {
            let keyInCamel = defaultKeyMappingFunction(item.key);
            if (keyInCamel == fieldname) {
                result = item.value
                logger.debug(`Detected matching item key ${keyInCamel} in item , result:  ${JSON.stringify(result)}`)
            }
        }
    }
    return result;
}
