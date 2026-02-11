import {FieldNode, GraphQLResolveInfo, InlineFragmentNode} from "graphql";

/**
 * Extracts the requested fields from a GraphQL resolve info object, including nested fields and fragments.
 * @param info - The GraphQL resolve info.
 * @returns An array of strings representing the full paths of the requested fields.
 */
export function getRequestedFields(info: GraphQLResolveInfo): string[] {
    if (!info || !info.fieldNodes) return [];
    const fields: string[] = [];
    const fieldNode = info.fieldNodes[0];

    function extractFields(selectionSet: any, prefix: string = "") {
        if (!selectionSet) return;
        for (const selection of selectionSet.selections) {
            if (selection.kind === 'Field') {
                const fieldName = (selection as FieldNode).name.value;
                const fullPath = prefix ? `${prefix}.${fieldName}` : fieldName;
                fields.push(fullPath);
                if (selection.selectionSet) {
                    extractFields(selection.selectionSet, fullPath);
                }
            } else if (selection.kind === 'InlineFragment') {
                extractFields((selection as InlineFragmentNode).selectionSet, prefix);
            } else if (selection.kind === 'FragmentSpread') {
                const fragment = info.fragments[selection.name.value];
                if (fragment) {
                    extractFields(fragment.selectionSet, prefix);
                }
            }
        }
    }

    extractFields(fieldNode.selectionSet);
    return fields;
}
