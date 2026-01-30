import {configDotenv} from "dotenv";

configDotenv();

export class Config {
    static readonly ZABBIX_BASE_URL = process.env.ZABBIX_BASE_URL || ""
static readonly DRY_RUN = process.env.DRY_RUN
    static readonly API_VERSION = process.env.API_VERSION
    static readonly SCHEMA_PATH = process.env.SCHEMA_PATH || './schema/'
    static readonly ADDITIONAL_SCHEMAS = process.env.ADDITIONAL_SCHEMAS
    static readonly ADDITIONAL_RESOLVERS = process.env.ADDITIONAL_RESOLVERS
    static readonly ZABBIX_DEVELOPMENT_TOKEN = process.env.ZABBIX_DEVELOPMENT_TOKEN
    static readonly ZABBIX_PRIVILEGE_ESCALATION_TOKEN = process.env.ZABBIX_PRIVILEGE_ESCALATION_TOKEN
    static readonly ZABBIX_EDGE_DEVICE_BASE_GROUP = process.env.ZABBIX_EDGE_DEVICE_BASE_GROUP
    static readonly ZABBIX_ROADWORK_BASE_GROUP = process.env.ZABBIX_ROADWORK_BASE_GROUP
    static readonly ZABBIX_PERMISSION_TEMPLATE_GROUP_NAME_PREFIX = process.env.ZABBIX_PERMISSION_TEMPLATE_GROUP_NAME_PREFIX || "Permissions"
    static readonly LOG_LEVELS = process.env.LOG_LEVELS
    static readonly HOST_TYPE_FILTER_DEFAULT = process.env.HOST_TYPE_FILTER_DEFAULT;
    static readonly HOST_GROUP_FILTER_DEFAULT = process.env.HOST_GROUP_FILTER_DEFAULT;
}