import type {CodegenConfig} from '@graphql-codegen/cli';

const config: CodegenConfig = {
    overwrite: true,
    schema: 'schema/*.graphql',
    generates: {
        "src/schema/generated/graphql.ts": {
            plugins: ["typescript", "typescript-resolvers"],
            config: {
                enumValues: {
                    DeviceCommunicationType: "../../model/model_enum_values.js#DeviceCommunicationType",
                    StorageItemType: "../../model/model_enum_values.js#StorageItemType",
                    DeviceStatus: "../../model/model_enum_values.js#DeviceStatus",
                    Permission: "../../model/model_enum_values.js#Permission",
                },
                declarationKind: 'interface'
            }
        }
    }
};

export default config;
