// Zabbix value enum mappings
export enum DeviceCommunicationType {
    ZABBIX_AGENT = "0",
    ZABBIX_TRAP = "2",
    SIMPLE_CHECK = "3",
    ZABBIX_INTERNAL_ITEM = "5",
    ZABBIX_AGENT_ACTIVE = "7",
    DATABASE_MONITOR = "11",
    IPMI_AGENT = "12",
    SIMULATOR_CALCULATED = "15",
    JMX_AGENT = "16",
    SNMP_TRAP = "17",
    DEPENDANT_ITEM = "18",
    HTTP_AGENT = "19",
    SNMP_AGENT = "20",
    SIMULATOR_JAVASCRIPT = "21",
}

export enum DeviceStatus {
    ENABLED = "0",
    DISABLED = "1"
}

export enum StorageItemType {
    Float = 0,
    Int = 3,
    Text = 4,
}

export enum ApiErrorCode {
    OK = 0,
    ZABBIX_ERROR = 1000,
    ZABBIX_NO_ITEM_PUSH_ITEM = 1001,
    ZABBIX_HOST_NOT_FOUND = 1002,
    ZABBIX_ITEM_NOT_FOUND = 1003,
    ZABBIX_HISTORY_NOT_FOUND = 1004,
    ZABBIX_TEMPLATE_NOT_FOUND = 1005,
    ZABBIX_SCRIPT_NOT_FOUND = 1006,
    ZABBIX_HISTORY_PUSH_FAILED = 1007,
    ZABBIX_TEMPLATEGROUP_NOT_FOUND= 1008,
    ZABBIX_HOSTGROUP_NOT_FOUND = 1009,
    ZABBIX_MULTIPLE_USERGROUPS_FOUND = 1010,
    ZABBIX_MODULE_NOT_FOUND= 1011,
    VALIDATION_ERROR = 2001,
    PERMISSION_ERROR = 2002,
}

export enum ApiErrorMessage {
    OK = "",
    ZABBIX_NO_TRAPPER_ITEMS_FOR_PUSHING_VALUES_FOUND = "Unable to push value to history, didn't find corresponding trapper item",
    ZABBIX_ITEM_NOT_FOUND = "Find a zabbix item with corresponding id",
    UPDATE_SKIPPED_NO_CHANGES = "Update skipped - nothing changed",
    ZABBIX_REQUEST_EXCEPTION = "Unable to access zabbix api",
    ZABBIX_UNABLE_TO_PUSH_VALUE = "Unable to push value to history",
    ZABBIX_UNABLE_TO_RETRIEVE_ITEMS_ACCORDING_TO_FILTER = "Unable to retrieve items for specified filter",
    ZABBIX_UNABLE_TO_RETRIEVE_HISTORY = "Unable to retrieve history"
}


export const enum Permission {
    Read = "2",
    ReadWrite = "3",
    Deny = "0"
}

export const enum PermissionNumber {
    Read = 2,
    ReadWrite = 3,
    Deny = 0
}
