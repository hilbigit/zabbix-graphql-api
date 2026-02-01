import { DeviceCommunicationType } from '../../model/model_enum_values.js';
import { StorageItemType } from '../../model/model_enum_values.js';
import { DeviceStatus } from '../../model/model_enum_values.js';
import { Permission } from '../../model/model_enum_values.js';
import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type EnumResolverSignature<T, AllowedValues = any> = { [key in keyof T]?: AllowedValues };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export interface Scalars {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: any; output: any; }
  JSONObject: { input: any; output: any; }
  Time: { input: any; output: any; }
}

/** Detailed error information returned by the API. */
export interface ApiError extends Error {
  __typename?: 'ApiError';
  /** Arguments passed to the operation that failed. */
  args?: Maybe<Scalars['JSONObject']['output']>;
  /** Error code. */
  code?: Maybe<Scalars['Int']['output']>;
  /** Additional error data. */
  data?: Maybe<Scalars['JSONObject']['output']>;
  /** Error message. */
  message?: Maybe<Scalars['String']['output']>;
  /** Path to the field that caused the error. */
  path?: Maybe<Scalars['String']['output']>;
}

/** Input for creating a new host. */
export interface CreateHost {
  /** Technical name of the host/device. */
  deviceKey: Scalars['String']['input'];
  /** Classification or category of the device. */
  deviceType: Scalars['String']['input'];
  /** List of host group names to assign the host to. */
  groupNames: Array<Scalars['String']['input']>;
  /** Optionally, internal group IDs can be provided instead of group names. */
  groupids?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** Location information for the host. */
  location?: InputMaybe<LocationInput>;
  /** User macros to assign to the host. */
  macros?: InputMaybe<Array<CreateMacro>>;
  /** Optional display name of the device (must be unique if provided - default is to set display name to deviceKey). */
  name?: InputMaybe<Scalars['String']['input']>;
  /** List of template names to link to the host. */
  templateNames?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  /** List of template IDs to link to the host. */
  templateids?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
}

/** Input for creating or identifying a host group. */
export interface CreateHostGroup {
  /** Name of the host group. */
  groupName: Scalars['String']['input'];
  /** Internally used unique id (will be assigned by Zabbix if empty). */
  uuid?: InputMaybe<Scalars['String']['input']>;
}

/** Response for a host group import operation. */
export interface CreateHostGroupResponse {
  __typename?: 'CreateHostGroupResponse';
  /** Error information if the import failed. */
  error?: Maybe<ApiError>;
  /** Name of the imported host group. */
  groupName: Scalars['String']['output'];
  /** The Zabbix group ID assigned to the group. */
  groupid?: Maybe<Scalars['Int']['output']>;
  /** Status message for the import. */
  message?: Maybe<Scalars['String']['output']>;
}

/** Response for a single host creation operation. */
export interface CreateHostResponse {
  __typename?: 'CreateHostResponse';
  /** Error information if the creation failed. */
  error?: Maybe<ApiError>;
  /** List of created host IDs. */
  hostids?: Maybe<Array<Maybe<Scalars['Int']['output']>>>;
  /** List of created item IDs. */
  itemids?: Maybe<Array<Maybe<Scalars['Int']['output']>>>;
}

/** Input for an item preprocessing step. */
export interface CreateItemPreprocessing {
  /** Error handling behavior. */
  error_handler?: InputMaybe<Scalars['Int']['input']>;
  /** Error handling parameters. */
  error_handler_params?: InputMaybe<Scalars['String']['input']>;
  /** Parameters for the preprocessing step. */
  params: Array<Scalars['String']['input']>;
  /** Type of preprocessing step (e.g. 12 for JSONPath, 21 for JavaScript). */
  type: Scalars['Int']['input'];
}

/** Reference to a template to be linked. */
export interface CreateLinkedTemplate {
  /** The technical name of the template to link. */
  name: Scalars['String']['input'];
}

/** Input for creating a user macro. */
export interface CreateMacro {
  /** Macro name (e.g. '{$LAT}'). */
  macro: Scalars['String']['input'];
  /** Macro value. */
  value: Scalars['String']['input'];
}

/** Reference to a master item for dependent items. */
export interface CreateMasterItem {
  /** The technical key of the master item. */
  key: Scalars['String']['input'];
}

/** Input for a tag. */
export interface CreateTag {
  /** Tag name. */
  tag: Scalars['String']['input'];
  /** Tag value. */
  value?: InputMaybe<Scalars['String']['input']>;
}

/** Input for creating or updating a template. */
export interface CreateTemplate {
  /** List of template group names to assign the template to. */
  groupNames: Array<Scalars['String']['input']>;
  /** Optionally, internal group IDs can be provided instead of group names. */
  groupids?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** Technical name of the template. */
  host: Scalars['String']['input'];
  /** List of items to create within the template. */
  items?: InputMaybe<Array<CreateTemplateItem>>;
  /** User macros to assign to the template. */
  macros?: InputMaybe<Array<CreateMacro>>;
  /** Visible name of the template. */
  name?: InputMaybe<Scalars['String']['input']>;
  /** Tags to assign to the template. */
  tags?: InputMaybe<Array<CreateTag>>;
  /** List of other templates to link to this template. */
  templates?: InputMaybe<Array<CreateLinkedTemplate>>;
  /** Internally used unique id (will be assigned by Zabbix if empty). */
  uuid?: InputMaybe<Scalars['String']['input']>;
}

/** Input for creating or identifying a template group. */
export interface CreateTemplateGroup {
  /** Name of the template group. */
  groupName: Scalars['String']['input'];
  /** Internally used unique id (will be assigned by Zabbix if empty). */
  uuid?: InputMaybe<Scalars['String']['input']>;
}

/** Response for a template group import operation. */
export interface CreateTemplateGroupResponse {
  __typename?: 'CreateTemplateGroupResponse';
  /** Error information if the import failed. */
  error?: Maybe<ApiError>;
  /** Name of the imported template group. */
  groupName: Scalars['String']['output'];
  /** The Zabbix group ID assigned to the group. */
  groupid?: Maybe<Scalars['Int']['output']>;
  /** Status message for the import. */
  message?: Maybe<Scalars['String']['output']>;
}

/** Input for creating an item within a template. */
export interface CreateTemplateItem {
  /** Update interval. */
  delay?: InputMaybe<Scalars['String']['input']>;
  /** Description of the item. */
  description?: InputMaybe<Scalars['String']['input']>;
  /** History storage period (e.g. '2d', '90d'). */
  history?: InputMaybe<Scalars['String']['input']>;
  /** Technical key of the item. */
  key: Scalars['String']['input'];
  /** Reference to a master item if this is a dependent item. */
  master_item?: InputMaybe<CreateMasterItem>;
  /** Name of the item. */
  name: Scalars['String']['input'];
  /** Preprocessing steps for the item values. */
  preprocessing?: InputMaybe<Array<CreateItemPreprocessing>>;
  /** Zabbix item status (0 for Enabled, 1 for Disabled). */
  status?: InputMaybe<Scalars['Int']['input']>;
  /** Tags to assign to the item. */
  tags?: InputMaybe<Array<CreateTag>>;
  /** Zabbix item type (e.g. 0 for Zabbix Agent, 18 for Dependent). */
  type?: InputMaybe<Scalars['Int']['input']>;
  /** Units of the value. */
  units?: InputMaybe<Scalars['String']['input']>;
  /** URL for HTTP Agent items. */
  url?: InputMaybe<Scalars['String']['input']>;
  /** Internally used unique id. */
  uuid?: InputMaybe<Scalars['String']['input']>;
  /** Type of information (e.g. 0 for Float, 3 for Int, 4 for Text). */
  value_type?: InputMaybe<Scalars['Int']['input']>;
}

/** Response object for delete operations. */
export interface DeleteResponse {
  __typename?: 'DeleteResponse';
  /** Error information if the deletion failed. */
  error?: Maybe<ApiError>;
  /** ID of the deleted entity. */
  id: Scalars['Int']['output'];
  /** Status message for the delete operation. */
  message?: Maybe<Scalars['String']['output']>;
}

/**
 * (IoT / Edge - ) Devices are hosts having a state containing the "output" / the business data which is exposed
 * besides monitoring information.
 */
export interface Device {
  /** Classification of the device. */
  deviceType?: Maybe<Scalars['String']['output']>;
  /** Per convention a uuid is used as hostname to identify devices if they do not have a unique hostname. */
  host: Scalars['String']['output'];
  /** List of host groups this device belongs to. */
  hostgroups?: Maybe<Array<HostGroup>>;
  /** Internal Zabbix ID of the device. */
  hostid: Scalars['ID']['output'];
  /** Host inventory data. */
  inventory?: Maybe<Inventory>;
  /** List of monitored items for this host. */
  items?: Maybe<Array<ZabbixItem>>;
  /** Visible name of the device. */
  name?: Maybe<Scalars['String']['output']>;
  /** State of the device. */
  state?: Maybe<DeviceState>;
  /** Device configuration tags. */
  tags?: Maybe<DeviceConfig>;
}

export { DeviceCommunicationType };

/** Configuration settings for a device. */
export interface DeviceConfig {
  __typename?: 'DeviceConfig';
  /** Configuration for the device widget preview in the cockpit. */
  deviceWidgetPreview?: Maybe<WidgetPreview>;
}

/** Common interface for device state. */
export interface DeviceState {
  /** Operational data (telemetry). */
  operational?: Maybe<OperationalDeviceData>;
}

export { DeviceStatus };

/** Marker-interface for device-related data values. */
export interface DeviceValue {
  /** Dummy field to allow for empty interfaces. */
  _empty?: Maybe<Scalars['String']['output']>;
}

/**
 * Represents a message containing information about a specific device and its associated data value.
 * The interface is designed to be extended by other types that define more structured or specialized types
 * of device value messages.
 */
export interface DeviceValueMessage {
  /**
   * Represents the name assigned to a set of values that are submitted together with a single timestamp.
   * This name is associated with a well-defined data structure.
   */
  attributeName?: Maybe<Scalars['String']['output']>;
  /**
   * A unique identifier used to distinguish a specific device within the system.
   * This field is commonly used to associate messages, configurations, or data values
   * with a particular device.
   */
  deviceKey?: Maybe<Scalars['String']['output']>;
  /**
   * Specifies the type or category of the device. Used to define the classification
   * of a device in the system (capabilities, functionalities, or purpose).
   */
  deviceType?: Maybe<Scalars['String']['output']>;
  /**
   * Represents the timestamp at which a specific event, message, or data point was created or recorded.
   * The format should align with standard expectations (e.g. ISO 8601).
   */
  timestamp?: Maybe<Scalars['String']['output']>;
  /**
   * Represents the name of the sub-topic to which the attribute is submitted.
   * Classification or grouping of data within a broader topic structure.
   */
  topicName?: Maybe<Scalars['String']['output']>;
  /** Retrieves the value associated with the current instance of the object. */
  value?: Maybe<DeviceValue>;
}

/** Specification for a display field in a widget. */
export interface DisplayFieldSpec {
  __typename?: 'DisplayFieldSpec';
  /** Value to display if the data is missing. */
  emptyValue?: Maybe<Scalars['String']['output']>;
  /** Optional transformation for the unit. */
  g_unit_transform?: Maybe<Scalars['String']['output']>;
  /** Optional transformation for the value. */
  g_value_transform?: Maybe<Scalars['String']['output']>;
  /** Key of the data to display. */
  key?: Maybe<Scalars['String']['output']>;
  /** Unit string to append to the value. */
  unit?: Maybe<Scalars['String']['output']>;
  /** Font size for the unit. */
  unit_font_size?: Maybe<Scalars['String']['output']>;
  /** Font size for the value. */
  value_font_size?: Maybe<Scalars['String']['output']>;
}

/** Common error interface. */
export interface Error {
  /** Error code. */
  code?: Maybe<Scalars['Int']['output']>;
  /** Additional error data. */
  data?: Maybe<Scalars['JSONObject']['output']>;
  /** Error message. */
  message?: Maybe<Scalars['String']['output']>;
}

/** Payload for a single error or status message. */
export interface ErrorPayload {
  __typename?: 'ErrorPayload';
  /** Additional contextual information about the error. */
  additionalInfo?: Maybe<Scalars['JSONObject']['output']>;
  /** Error code. */
  code: Scalars['Int']['output'];
  /** Human-readable error message. */
  message?: Maybe<Scalars['String']['output']>;
}

/** Device represents generic IoT / Edge - devices providing their state as generic "state.current" - JSON Object. */
export interface GenericDevice extends Device, Host {
  __typename?: 'GenericDevice';
  /** Classification of the device. */
  deviceType?: Maybe<Scalars['String']['output']>;
  /** Per convention a uuid is used as hostname to identify devices if they do not have a unique hostname. */
  host: Scalars['String']['output'];
  /** List of host groups this device belongs to. */
  hostgroups?: Maybe<Array<HostGroup>>;
  /** Internal Zabbix ID of the device. */
  hostid: Scalars['ID']['output'];
  /** Host inventory data. */
  inventory?: Maybe<Inventory>;
  /** List of monitored items for this host. */
  items?: Maybe<Array<ZabbixItem>>;
  /** Visible name of the device. */
  name?: Maybe<Scalars['String']['output']>;
  /** State of the generic device. */
  state?: Maybe<GenericDeviceState>;
  /** Device configuration tags. */
  tags?: Maybe<DeviceConfig>;
}

/** Generic implementation of device state using a JSON object for current values. */
export interface GenericDeviceState extends DeviceState {
  __typename?: 'GenericDeviceState';
  /** Current business data as a generic JSON object. */
  current?: Maybe<Scalars['JSONObject']['output']>;
  /** Operational data (telemetry). */
  operational?: Maybe<OperationalDeviceData>;
}

/** Generic response wrapper containing either the result data or an error. */
export interface GenericResponse {
  __typename?: 'GenericResponse';
  /** Error information if the operation failed. */
  error?: Maybe<ApiError>;
  /** The result data, typically a list of JSON objects. */
  result?: Maybe<Array<Scalars['JSONObject']['output']>>;
}

/**
 * Interface for entities that have GPS coordinates.
 * Hint: WGS84[dd.ddddd] coordinates are used.
 */
export interface GpsPosition {
  /** Latitude coordinate. */
  latitude?: Maybe<Scalars['Float']['output']>;
  /** Longitude coordinate. */
  longitude?: Maybe<Scalars['Float']['output']>;
}

/** Common interface for all host-like entities in Zabbix. */
export interface Host {
  /**
   * Specifies the type or category of the device. Used to define the classification
   * of a device in the system (capabilities, functionalities, or purpose).
   */
  deviceType?: Maybe<Scalars['String']['output']>;
  /** Technical name of the host (the 'hostname' in Zabbix). */
  host: Scalars['String']['output'];
  /** List of host groups this host belongs to. */
  hostgroups?: Maybe<Array<HostGroup>>;
  /** Internal Zabbix ID of the host. */
  hostid: Scalars['ID']['output'];
  /** Host inventory data. */
  inventory?: Maybe<Inventory>;
  /** List of monitored items for this host. */
  items?: Maybe<Array<ZabbixItem>>;
  /** Visible name of the host. */
  name?: Maybe<Scalars['String']['output']>;
}

/** Represents a host group in Zabbix. */
export interface HostGroup {
  __typename?: 'HostGroup';
  /** Internal Zabbix ID of the host group. */
  groupid: Scalars['ID']['output'];
  /** Name of the host group. */
  name?: Maybe<Scalars['String']['output']>;
}

/** Response for a host import operation. */
export interface ImportHostResponse {
  __typename?: 'ImportHostResponse';
  /** The device key (technical name) of the imported host. */
  deviceKey: Scalars['String']['output'];
  /** Error information if the import failed. */
  error?: Maybe<ApiError>;
  /** The Zabbix host ID assigned to the host. */
  hostid?: Maybe<Scalars['String']['output']>;
  /** Status message for the import. */
  message?: Maybe<Scalars['String']['output']>;
}

/** Response for a template import operation. */
export interface ImportTemplateResponse {
  __typename?: 'ImportTemplateResponse';
  /** Error information if the import failed. */
  error?: Maybe<ApiError>;
  /** The technical name of the imported template. */
  host: Scalars['String']['output'];
  /** Status message for the import. */
  message?: Maybe<Scalars['String']['output']>;
  /** The Zabbix template ID assigned to the template. */
  templateid?: Maybe<Scalars['String']['output']>;
}

/** Result of a single user right (role or group) import. */
export interface ImportUserRightResult {
  __typename?: 'ImportUserRightResult';
  /** List of errors encountered during import. */
  errors?: Maybe<Array<ApiError>>;
  /** The ID of the imported/updated entity. */
  id?: Maybe<Scalars['String']['output']>;
  /** Status message for the import. */
  message?: Maybe<Scalars['String']['output']>;
  /** The name of the entity. */
  name?: Maybe<Scalars['String']['output']>;
}

/** Result of a user rights import operation. */
export interface ImportUserRightsResult {
  __typename?: 'ImportUserRightsResult';
  /** Results for the imported user groups. */
  userGroups?: Maybe<Array<ImportUserRightResult>>;
  /** Results for the imported user roles. */
  userRoles?: Maybe<Array<ImportUserRightResult>>;
}

/** Represents host inventory information. */
export interface Inventory {
  __typename?: 'Inventory';
  /** Location data for the host. */
  location?: Maybe<Location>;
}

/** Represents a geographical location. */
export interface Location extends GpsPosition {
  __typename?: 'Location';
  /** Latitude coordinate. */
  latitude?: Maybe<Scalars['Float']['output']>;
  /** Longitude coordinate. */
  longitude?: Maybe<Scalars['Float']['output']>;
  /** Name of the location. */
  name?: Maybe<Scalars['String']['output']>;
}

/** Input for host location information. */
export interface LocationInput {
  /** Latitude coordinate. */
  location_lat?: InputMaybe<Scalars['String']['input']>;
  /** Longitude coordinate. */
  location_lon?: InputMaybe<Scalars['String']['input']>;
  /** Name of the location. */
  name?: InputMaybe<Scalars['String']['input']>;
}

export interface Mutation {
  __typename?: 'Mutation';
  /**
   * Creates a single host in Zabbix.
   *
   * Authentication: Requires `zbx_session` cookie or `zabbix-auth-token` header.
   */
  createHost?: Maybe<CreateHostResponse>;
  /**
   * Delete host groups by their IDs or by a name pattern.
   *
   * Authentication: Requires `zbx_session` cookie or `zabbix-auth-token` header.
   */
  deleteHostGroups?: Maybe<Array<DeleteResponse>>;
  /**
   * Delete hosts by their IDs or by a name pattern.
   *
   * Authentication: Requires `zbx_session` cookie or `zabbix-auth-token` header.
   */
  deleteHosts?: Maybe<Array<DeleteResponse>>;
  /**
   * Delete template groups by their IDs or by a name pattern.
   *
   * Authentication: Requires `zbx_session` cookie or `zabbix-auth-token` header.
   */
  deleteTemplateGroups?: Maybe<Array<DeleteResponse>>;
  /**
   * Delete templates by their IDs or by a name pattern.
   *
   * Authentication: Requires `zbx_session` cookie or `zabbix-auth-token` header.
   */
  deleteTemplates?: Maybe<Array<DeleteResponse>>;
  /**
   * (Mass) Import Zabbix host groups and assign them to the corresponding hosts by groupid or groupName.
   *
   * Return value: If no error occurs, a groupid is returned for each created group; otherwise, the return object contains an error message.
   *
   * Authentication: Requires `zbx_session` cookie or `zabbix-auth-token` header.
   */
  importHostGroups?: Maybe<Array<CreateHostGroupResponse>>;
  /**
   * (Mass) Import hosts and assign them to host groups by groupid or groupName.
   *
   * Return value: If no error occurs, a hostid is returned for each created host; otherwise, the return object contains an error message.
   *
   * Authentication: Requires `zbx_session` cookie or `zabbix-auth-token` header.
   */
  importHosts?: Maybe<Array<ImportHostResponse>>;
  /**
   * (Mass) Import template groups and assign them by groupid or name.
   *
   * Return value: If no error occurs, a groupid is returned for each created group; otherwise, the return object contains an error message.
   *
   * Authentication: Requires `zbx_session` cookie or `zabbix-auth-token` header.
   */
  importTemplateGroups?: Maybe<Array<CreateTemplateGroupResponse>>;
  /**
   * (Mass) Import templates.
   *
   * Return value: If no error occurs, a templateid is returned for each created template; otherwise, the return object contains an error message.
   *
   * Authentication: Requires `zbx_session` cookie or `zabbix-auth-token` header.
   */
  importTemplates?: Maybe<Array<ImportTemplateResponse>>;
  /**
   * Import user rights (roles and groups) into Zabbix.
   *
   * Authentication: Requires `zbx_session` cookie or `zabbix-auth-token` header.
   */
  importUserRights?: Maybe<ImportUserRightsResult>;
  /** Runs all regression tests. */
  runAllRegressionTests: SmoketestResponse;
  /** Runs a smoketest: creates a template, links a host, verifies it, and cleans up. */
  runSmoketest: SmoketestResponse;
}


export interface MutationCreateHostArgs {
  host: Scalars['String']['input'];
  hostgroupids: Array<Scalars['Int']['input']>;
  location?: InputMaybe<LocationInput>;
  templateNames?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  templateids?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
}


export interface MutationDeleteHostGroupsArgs {
  groupids?: InputMaybe<Array<Scalars['Int']['input']>>;
  name_pattern?: InputMaybe<Scalars['String']['input']>;
}


export interface MutationDeleteHostsArgs {
  hostids?: InputMaybe<Array<Scalars['Int']['input']>>;
  name_pattern?: InputMaybe<Scalars['String']['input']>;
}


export interface MutationDeleteTemplateGroupsArgs {
  groupids?: InputMaybe<Array<Scalars['Int']['input']>>;
  name_pattern?: InputMaybe<Scalars['String']['input']>;
}


export interface MutationDeleteTemplatesArgs {
  name_pattern?: InputMaybe<Scalars['String']['input']>;
  templateids?: InputMaybe<Array<Scalars['Int']['input']>>;
}


export interface MutationImportHostGroupsArgs {
  hostGroups: Array<CreateHostGroup>;
}


export interface MutationImportHostsArgs {
  hosts: Array<CreateHost>;
}


export interface MutationImportTemplateGroupsArgs {
  templateGroups: Array<CreateTemplateGroup>;
}


export interface MutationImportTemplatesArgs {
  templates: Array<CreateTemplate>;
}


export interface MutationImportUserRightsArgs {
  dryRun?: Scalars['Boolean']['input'];
  input: UserRightsInput;
}


export interface MutationRunAllRegressionTestsArgs {
  groupName: Scalars['String']['input'];
  hostName: Scalars['String']['input'];
}


export interface MutationRunSmoketestArgs {
  groupName: Scalars['String']['input'];
  hostName: Scalars['String']['input'];
  templateName: Scalars['String']['input'];
}

/** Operational data common to most devices. */
export interface OperationalDeviceData {
  __typename?: 'OperationalDeviceData';
  /** List of active errors or status messages. */
  error?: Maybe<Array<ErrorPayload>>;
  /** Current location of the device. */
  location?: Maybe<Location>;
  /** Signal strength (e.g. WiFi or GSM). */
  signalstrength?: Maybe<Scalars['Float']['output']>;
  /** Device temperature. */
  temperature?: Maybe<Scalars['Float']['output']>;
  /** Timestamp of the operational data. */
  timestamp?: Maybe<Scalars['DateTime']['output']>;
  /** Device voltage. */
  voltage?: Maybe<Scalars['Float']['output']>;
}

export { Permission };

/** Request for checking specific user permissions. */
export interface PermissionRequest {
  /**
   * objectName maps to name / path suffix of the template group representing the permission in Zabbix:
   * Permissions/{objectName}
   */
  objectName: Scalars['String']['input'];
  /** The required permission level (DENY, READ, or READ_WRITE). */
  permission: Permission;
}

export interface Query {
  __typename?: 'Query';
  /**
   * Returns all devices and their items. Devices are hosts with a `deviceType` and a state.
   *
   * Authentication: Requires `zbx_session` cookie or `zabbix-auth-token` header.
   */
  allDevices?: Maybe<Array<Maybe<Device>>>;
  /**
   * Returns all host groups.
   *
   * Authentication: Requires `zbx_session` cookie or `zabbix-auth-token` header.
   */
  allHostGroups?: Maybe<Array<Maybe<HostGroup>>>;
  /**
   * Returns all hosts and their items.
   *
   * Authentication: Requires `zbx_session` cookie or `zabbix-auth-token` header.
   */
  allHosts?: Maybe<Array<Maybe<Host>>>;
  /** Returns all template groups. */
  allTemplateGroups?: Maybe<Array<Maybe<HostGroup>>>;
  /** Returns the API build version. */
  apiVersion: Scalars['String']['output'];
  /**
   * Exports value history for Zabbix items.
   *
   * Authentication: Requires `zbx_session` cookie or `zabbix-auth-token` header.
   */
  exportHostValueHistory?: Maybe<GenericResponse>;
  /** Exports user rights (roles and groups). */
  exportUserRights?: Maybe<UserRights>;
  /** Checks if the current user has the requested permissions. */
  hasPermissions?: Maybe<Scalars['Boolean']['output']>;
  /**
   * Returns all locations used by hosts.
   *
   * Authentication: Requires `zbx_session` cookie or `zabbix-auth-token` header.
   */
  locations?: Maybe<Array<Maybe<Location>>>;
  /**
   * Logs in to Zabbix. This is primarily for debugging and testing.
   * The returned authentication token can be passed in the `zabbix-auth-token` header for future requests.
   * Alternatively, the `zbx_session` cookie can be used for authentication.
   */
  login?: Maybe<Scalars['String']['output']>;
  /** Logs out from Zabbix, invalidating the current session/token. */
  logout?: Maybe<Scalars['Boolean']['output']>;
  /** Returns templates. */
  templates?: Maybe<Array<Maybe<Template>>>;
  /**
   * Returns all user permissions.
   * If `objectNames` is provided, returns only the permissions related to those objects.
   */
  userPermissions?: Maybe<Array<UserPermission>>;
  /** Returns the version of the connected Zabbix instance. */
  zabbixVersion?: Maybe<Scalars['String']['output']>;
}


export interface QueryAllDevicesArgs {
  filter_host?: InputMaybe<Scalars['String']['input']>;
  groupids?: InputMaybe<Array<Scalars['Int']['input']>>;
  hostids?: InputMaybe<Scalars['Int']['input']>;
  name_pattern?: InputMaybe<Scalars['String']['input']>;
  tag_deviceType?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  tag_hostType?: InputMaybe<Array<Scalars['String']['input']>>;
  with_items?: InputMaybe<Scalars['Boolean']['input']>;
}


export interface QueryAllHostGroupsArgs {
  search_name?: InputMaybe<Scalars['String']['input']>;
  with_hosts?: InputMaybe<Scalars['Boolean']['input']>;
}


export interface QueryAllHostsArgs {
  filter_host?: InputMaybe<Scalars['String']['input']>;
  groupids?: InputMaybe<Array<Scalars['Int']['input']>>;
  hostids?: InputMaybe<Scalars['Int']['input']>;
  name_pattern?: InputMaybe<Scalars['String']['input']>;
  tag_deviceType?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  tag_hostType?: InputMaybe<Array<Scalars['String']['input']>>;
  with_items?: InputMaybe<Scalars['Boolean']['input']>;
}


export interface QueryAllTemplateGroupsArgs {
  name_pattern?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryExportHostValueHistoryArgs {
  host_filter?: InputMaybe<Array<Scalars['String']['input']>>;
  itemKey_filter?: InputMaybe<Array<Scalars['String']['input']>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  sortOrder?: InputMaybe<SortOrder>;
  time_from?: InputMaybe<Scalars['DateTime']['input']>;
  time_until?: InputMaybe<Scalars['DateTime']['input']>;
  type?: InputMaybe<StorageItemType>;
}


export interface QueryExportUserRightsArgs {
  exclude_hostgroups_pattern?: InputMaybe<Scalars['String']['input']>;
  name_pattern?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryHasPermissionsArgs {
  permissions: Array<PermissionRequest>;
}


export interface QueryLocationsArgs {
  distinct_by_name?: InputMaybe<Scalars['Boolean']['input']>;
  name_pattern?: InputMaybe<Scalars['String']['input']>;
  templateids?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
}


export interface QueryLoginArgs {
  password: Scalars['String']['input'];
  username: Scalars['String']['input'];
}


export interface QueryTemplatesArgs {
  hostids?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  name_pattern?: InputMaybe<Scalars['String']['input']>;
}


export interface QueryUserPermissionsArgs {
  objectNames?: InputMaybe<Array<Scalars['String']['input']>>;
}

/** Response object for the smoketest operation. */
export interface SmoketestResponse {
  __typename?: 'SmoketestResponse';
  /** Overall status message. */
  message?: Maybe<Scalars['String']['output']>;
  /** Detailed results for each step. */
  steps: Array<SmoketestStep>;
  /** True if all steps of the smoketest succeeded. */
  success: Scalars['Boolean']['output'];
}

/** Results for a single step in the smoketest. */
export interface SmoketestStep {
  __typename?: 'SmoketestStep';
  /** Status message or error message for the step. */
  message?: Maybe<Scalars['String']['output']>;
  /** Name of the step (e.g. 'Create Template'). */
  name: Scalars['String']['output'];
  /** True if the step succeeded. */
  success: Scalars['Boolean']['output'];
}

export enum SortOrder {
  /** Deliver values in ascending order */
  Asc = 'asc',
  /** Deliver values in descending order */
  Desc = 'desc'
}

export { StorageItemType };

/** Represents a Zabbix template. */
export interface Template {
  __typename?: 'Template';
  /** Technical name of the template. */
  host: Scalars['String']['output'];
  /** List of items for this template. */
  items?: Maybe<Array<ZabbixItem>>;
  /** Name of the template. */
  name?: Maybe<Scalars['String']['output']>;
  /** Internal Zabbix ID of the template. */
  templateid: Scalars['String']['output'];
}

/** Represents a Zabbix user group. */
export interface UserGroup {
  __typename?: 'UserGroup';
  /** Frontend access level. */
  gui_access?: Maybe<Scalars['Int']['output']>;
  /** Permissions for host groups. */
  hostgroup_rights?: Maybe<Array<ZabbixGroupRight>>;
  /** Name of the user group. */
  name: Scalars['String']['output'];
  /** Permissions for template groups. */
  templategroup_rights?: Maybe<Array<ZabbixGroupRight>>;
  /** Status of users in the group. */
  users_status?: Maybe<Scalars['Int']['output']>;
  /** Internal Zabbix ID of the user group. */
  usrgrpid: Scalars['Int']['output'];
}

/** Input for a user group. */
export interface UserGroupInput {
  /** Frontend access level. */
  gui_access?: InputMaybe<Scalars['Int']['input']>;
  /** Permissions for host groups. */
  hostgroup_rights?: InputMaybe<Array<ZabbixGroupRightInput>>;
  /** Name of the user group. */
  name: Scalars['String']['input'];
  /** Permissions for template groups. */
  templategroup_rights?: InputMaybe<Array<ZabbixGroupRightInput>>;
  /** Status of the users in the group. */
  users_status?: InputMaybe<Scalars['Int']['input']>;
}

/** Represents a permission assigned to a user for a specific object. */
export interface UserPermission {
  __typename?: 'UserPermission';
  /**
   * objectName maps to name / path suffix of the template group representing the permission in Zabbix:
   * Permissions/{objectName}
   */
  objectName: Scalars['String']['output'];
  /** The assigned permission level. */
  permission: Permission;
}

/** Represents the combined user rights (groups and roles). */
export interface UserRights {
  __typename?: 'UserRights';
  /** List of user groups. */
  userGroups?: Maybe<Array<UserGroup>>;
  /** List of user roles. */
  userRoles?: Maybe<Array<UserRole>>;
}

/** Input for importing user rights. */
export interface UserRightsInput {
  /** List of user groups to import. */
  userGroups?: InputMaybe<Array<UserGroupInput>>;
  /** List of user roles to import. */
  userRoles?: InputMaybe<Array<UserRoleInput>>;
}

/** Represents a Zabbix user role. */
export interface UserRole {
  __typename?: 'UserRole';
  /** Name of the role. */
  name?: Maybe<Scalars['String']['output']>;
  /** Whether the role is read-only. */
  readonly?: Maybe<Scalars['Int']['output']>;
  /** Internal Zabbix ID of the role. */
  roleid: Scalars['Int']['output'];
  /** Rules assigned to the role. */
  rules?: Maybe<UserRoleRules>;
  /** Type of the role. */
  type?: Maybe<Scalars['Int']['output']>;
}

/** Input for a user role. */
export interface UserRoleInput {
  /** Name of the role. */
  name?: InputMaybe<Scalars['String']['input']>;
  /** Whether the role is read-only (1) or not (0). */
  readonly?: InputMaybe<Scalars['Int']['input']>;
  /** Specific rules for the role. */
  rules?: InputMaybe<UserRoleRulesInput>;
  /** Type of role (e.g. 1 for User, 2 for Admin, 3 for Super Admin). */
  type?: InputMaybe<Scalars['Int']['input']>;
}

/** Represents a module assigned to a user role. */
export interface UserRoleModule {
  __typename?: 'UserRoleModule';
  /** Technical ID of the module. */
  id?: Maybe<Scalars['String']['output']>;
  /** Internal Zabbix module ID. */
  moduleid?: Maybe<Scalars['String']['output']>;
  /** Relative path to the module. */
  relative_path?: Maybe<Scalars['String']['output']>;
  /** Status of the module. */
  status?: Maybe<Scalars['Int']['output']>;
}

/** Input for user role module access. */
export interface UserRoleModuleInput {
  /** Technical ID of the module. */
  id?: InputMaybe<Scalars['String']['input']>;
  /** The internal Zabbix module ID. */
  moduleid?: InputMaybe<Scalars['String']['input']>;
  /** Status of the module. */
  status?: InputMaybe<Scalars['Int']['input']>;
}

/** Represents a single rule within a user role. */
export interface UserRoleRule {
  __typename?: 'UserRoleRule';
  /** Name of the rule. */
  name?: Maybe<Scalars['String']['output']>;
  /** Status of the rule. */
  status?: Maybe<Scalars['Int']['output']>;
}

/** Input for a single user role rule. */
export interface UserRoleRuleInput {
  /** Name of the rule/element. */
  name?: InputMaybe<Scalars['String']['input']>;
  /** Status (e.g. 1 for enabled, 0 for disabled). */
  status?: InputMaybe<Scalars['Int']['input']>;
}

/** Represents the rules assigned to a user role. */
export interface UserRoleRules {
  __typename?: 'UserRoleRules';
  /** Action rules. */
  actions?: Maybe<Array<UserRoleRule>>;
  /** Default access for actions. */
  actions_default_access?: Maybe<Scalars['Int']['output']>;
  /** List of API methods allowed/denied. */
  api?: Maybe<Array<Scalars['String']['output']>>;
  /** Whether API access is enabled. */
  api_access?: Maybe<Scalars['Int']['output']>;
  /** API mode. */
  api_mode?: Maybe<Scalars['Int']['output']>;
  /** Module access rules. */
  modules?: Maybe<Array<UserRoleModule>>;
  /** Default access for modules. */
  modules_default_access?: Maybe<Scalars['Int']['output']>;
  /** UI access rules. */
  ui?: Maybe<Array<UserRoleRule>>;
  /** Default access for UI elements. */
  ui_default_access?: Maybe<Scalars['Int']['output']>;
}

/** Input for user role rules. */
export interface UserRoleRulesInput {
  /** Action rules. */
  actions?: InputMaybe<Array<UserRoleRuleInput>>;
  /** Default access for actions. */
  actions_default_access?: InputMaybe<Scalars['Int']['input']>;
  /** List of API methods allowed/denied. */
  api?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Whether API access is enabled (1) or not (0). */
  api_access?: InputMaybe<Scalars['Int']['input']>;
  /** API mode (e.g. 0 for white-list, 1 for black-list). */
  api_mode?: InputMaybe<Scalars['Int']['input']>;
  /** Module access rules. */
  modules?: InputMaybe<Array<UserRoleModuleInput>>;
  /** Default access for modules. */
  modules_default_access?: InputMaybe<Scalars['Int']['input']>;
  /** UI access rules. */
  ui?: InputMaybe<Array<UserRoleRuleInput>>;
  /** Default access for UI elements. */
  ui_default_access?: InputMaybe<Scalars['Int']['input']>;
}

/** Represents the configuration for a 4-field widget preview. */
export interface WidgetPreview {
  __typename?: 'WidgetPreview';
  /** Bottom-left field specification. */
  BOTTOM_LEFT?: Maybe<DisplayFieldSpec>;
  /** Bottom-right field specification. */
  BOTTOM_RIGHT?: Maybe<DisplayFieldSpec>;
  /** Top-left field specification. */
  TOP_LEFT?: Maybe<DisplayFieldSpec>;
  /** Top-right field specification. */
  TOP_RIGHT?: Maybe<DisplayFieldSpec>;
}

/** Represents a specific permission right for a group. */
export interface ZabbixGroupRight {
  __typename?: 'ZabbixGroupRight';
  /** ID of the group the right applies to. */
  id: Scalars['Int']['output'];
  /** Name of the group. */
  name?: Maybe<Scalars['String']['output']>;
  /** Assigned permission level. */
  permission?: Maybe<Permission>;
  /** Unique ID of the group. */
  uuid?: Maybe<Scalars['String']['output']>;
}

/** Input for a Zabbix group permission right. */
export interface ZabbixGroupRightInput {
  /**
   * Name may optionally be specified for documentation purpose,
   * but the master for setting the user right is the uuid.
   */
  name?: InputMaybe<Scalars['String']['input']>;
  /** The permission level to assign. */
  permission?: InputMaybe<Permission>;
  /** The unique ID of the group. */
  uuid?: InputMaybe<Scalars['String']['input']>;
}

/** Concrete implementation of a Zabbix host. */
export interface ZabbixHost extends Host {
  __typename?: 'ZabbixHost';
  /**
   * Specifies the type or category of the device. Used to define the classification
   * of a device in the system (capabilities, functionalities, or purpose).
   */
  deviceType?: Maybe<Scalars['String']['output']>;
  /** Technical name of the host. */
  host: Scalars['String']['output'];
  /** List of host groups this host belongs to. */
  hostgroups?: Maybe<Array<HostGroup>>;
  /** Internal Zabbix ID of the host. */
  hostid: Scalars['ID']['output'];
  /** Host inventory data. */
  inventory?: Maybe<Inventory>;
  /** List of monitored items for this host. */
  items?: Maybe<Array<ZabbixItem>>;
  /** Visible name of the host. */
  name?: Maybe<Scalars['String']['output']>;
  /** List of templates linked to this host. */
  parentTemplates?: Maybe<Array<Template>>;
  /** Tags assigned to the host as a JSON object. */
  tags?: Maybe<Scalars['JSONObject']['output']>;
}

/** Represents a Zabbix item (a single data point being monitored). */
export interface ZabbixItem {
  __typename?: 'ZabbixItem';
  /** Attribute name if this item is part of a hierarchical mapping. */
  attributeName?: Maybe<Scalars['String']['output']>;
  /** Update interval. */
  delay?: Maybe<Scalars['String']['output']>;
  /** Description of the item. */
  description?: Maybe<Scalars['String']['output']>;
  /** History storage period (e.g. '2d', '90d'). */
  history?: Maybe<Scalars['String']['output']>;
  /** Internal Zabbix ID of the host this item belongs to. */
  hostid?: Maybe<Scalars['Int']['output']>;
  /** Hosts that this item is linked to. */
  hosts?: Maybe<Array<Host>>;
  /** Internal Zabbix ID of the item. */
  itemid: Scalars['Int']['output'];
  /** Technical key of the item. */
  key_: Scalars['String']['output'];
  /** Unix timestamp of the last time the item value was updated. */
  lastclock?: Maybe<Scalars['Int']['output']>;
  /** Last value retrieved for this item. */
  lastvalue?: Maybe<Scalars['String']['output']>;
  /** Master item for dependent items. */
  master_item?: Maybe<ZabbixItem>;
  /** Master item ID for dependent items. */
  master_itemid?: Maybe<Scalars['Int']['output']>;
  /** Visible name of the item. */
  name: Scalars['String']['output'];
  /** Preprocessing steps for the item. */
  preprocessing?: Maybe<Array<Scalars['JSONObject']['output']>>;
  /** Status of the item (ENABLED or DISABLED). */
  status?: Maybe<DeviceStatus>;
  /** Raw Zabbix item status as integer. */
  status_int?: Maybe<Scalars['Int']['output']>;
  /** Tags assigned to the item. */
  tags?: Maybe<Array<Scalars['JSONObject']['output']>>;
  /** Communication type used by the item. */
  type?: Maybe<DeviceCommunicationType>;
  /** Raw Zabbix item type as integer. */
  type_int?: Maybe<Scalars['Int']['output']>;
  /** Units of the value. */
  units?: Maybe<Scalars['String']['output']>;
  /** Type of information (e.g. 0 for Float, 3 for Int, 4 for Text). */
  value_type: Scalars['Int']['output'];
}



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;


/** Mapping of interface types */
export type ResolversInterfaceTypes<_RefType extends Record<string, unknown>> = {
  Device: ( Omit<GenericDevice, 'items'> & { items?: Maybe<Array<_RefType['ZabbixItem']>> } );
  DeviceState: ( GenericDeviceState );
  DeviceValue: never;
  DeviceValueMessage: never;
  Error: ( ApiError );
  GpsPosition: ( Location );
  Host: ( Omit<GenericDevice, 'items'> & { items?: Maybe<Array<_RefType['ZabbixItem']>> } ) | ( Omit<ZabbixHost, 'items' | 'parentTemplates'> & { items?: Maybe<Array<_RefType['ZabbixItem']>>, parentTemplates?: Maybe<Array<_RefType['Template']>> } );
};

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  ApiError: ResolverTypeWrapper<ApiError>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  CreateHost: CreateHost;
  CreateHostGroup: CreateHostGroup;
  CreateHostGroupResponse: ResolverTypeWrapper<CreateHostGroupResponse>;
  CreateHostResponse: ResolverTypeWrapper<CreateHostResponse>;
  CreateItemPreprocessing: CreateItemPreprocessing;
  CreateLinkedTemplate: CreateLinkedTemplate;
  CreateMacro: CreateMacro;
  CreateMasterItem: CreateMasterItem;
  CreateTag: CreateTag;
  CreateTemplate: CreateTemplate;
  CreateTemplateGroup: CreateTemplateGroup;
  CreateTemplateGroupResponse: ResolverTypeWrapper<CreateTemplateGroupResponse>;
  CreateTemplateItem: CreateTemplateItem;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']['output']>;
  DeleteResponse: ResolverTypeWrapper<DeleteResponse>;
  Device: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['Device']>;
  DeviceCommunicationType: DeviceCommunicationType;
  DeviceConfig: ResolverTypeWrapper<DeviceConfig>;
  DeviceState: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['DeviceState']>;
  DeviceStatus: DeviceStatus;
  DeviceValue: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['DeviceValue']>;
  DeviceValueMessage: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['DeviceValueMessage']>;
  DisplayFieldSpec: ResolverTypeWrapper<DisplayFieldSpec>;
  Error: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['Error']>;
  ErrorPayload: ResolverTypeWrapper<ErrorPayload>;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  GenericDevice: ResolverTypeWrapper<Omit<GenericDevice, 'items'> & { items?: Maybe<Array<ResolversTypes['ZabbixItem']>> }>;
  GenericDeviceState: ResolverTypeWrapper<GenericDeviceState>;
  GenericResponse: ResolverTypeWrapper<GenericResponse>;
  GpsPosition: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['GpsPosition']>;
  Host: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['Host']>;
  HostGroup: ResolverTypeWrapper<HostGroup>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  ImportHostResponse: ResolverTypeWrapper<ImportHostResponse>;
  ImportTemplateResponse: ResolverTypeWrapper<ImportTemplateResponse>;
  ImportUserRightResult: ResolverTypeWrapper<ImportUserRightResult>;
  ImportUserRightsResult: ResolverTypeWrapper<ImportUserRightsResult>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  Inventory: ResolverTypeWrapper<Inventory>;
  JSONObject: ResolverTypeWrapper<Scalars['JSONObject']['output']>;
  Location: ResolverTypeWrapper<Location>;
  LocationInput: LocationInput;
  Mutation: ResolverTypeWrapper<{}>;
  OperationalDeviceData: ResolverTypeWrapper<OperationalDeviceData>;
  Permission: Permission;
  PermissionRequest: PermissionRequest;
  Query: ResolverTypeWrapper<{}>;
  SmoketestResponse: ResolverTypeWrapper<SmoketestResponse>;
  SmoketestStep: ResolverTypeWrapper<SmoketestStep>;
  SortOrder: SortOrder;
  StorageItemType: StorageItemType;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  Template: ResolverTypeWrapper<Omit<Template, 'items'> & { items?: Maybe<Array<ResolversTypes['ZabbixItem']>> }>;
  Time: ResolverTypeWrapper<Scalars['Time']['output']>;
  UserGroup: ResolverTypeWrapper<UserGroup>;
  UserGroupInput: UserGroupInput;
  UserPermission: ResolverTypeWrapper<UserPermission>;
  UserRights: ResolverTypeWrapper<UserRights>;
  UserRightsInput: UserRightsInput;
  UserRole: ResolverTypeWrapper<UserRole>;
  UserRoleInput: UserRoleInput;
  UserRoleModule: ResolverTypeWrapper<UserRoleModule>;
  UserRoleModuleInput: UserRoleModuleInput;
  UserRoleRule: ResolverTypeWrapper<UserRoleRule>;
  UserRoleRuleInput: UserRoleRuleInput;
  UserRoleRules: ResolverTypeWrapper<UserRoleRules>;
  UserRoleRulesInput: UserRoleRulesInput;
  WidgetPreview: ResolverTypeWrapper<WidgetPreview>;
  ZabbixGroupRight: ResolverTypeWrapper<ZabbixGroupRight>;
  ZabbixGroupRightInput: ZabbixGroupRightInput;
  ZabbixHost: ResolverTypeWrapper<Omit<ZabbixHost, 'items' | 'parentTemplates'> & { items?: Maybe<Array<ResolversTypes['ZabbixItem']>>, parentTemplates?: Maybe<Array<ResolversTypes['Template']>> }>;
  ZabbixItem: ResolverTypeWrapper<Omit<ZabbixItem, 'hosts' | 'master_item'> & { hosts?: Maybe<Array<ResolversTypes['Host']>>, master_item?: Maybe<ResolversTypes['ZabbixItem']> }>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  ApiError: ApiError;
  Boolean: Scalars['Boolean']['output'];
  CreateHost: CreateHost;
  CreateHostGroup: CreateHostGroup;
  CreateHostGroupResponse: CreateHostGroupResponse;
  CreateHostResponse: CreateHostResponse;
  CreateItemPreprocessing: CreateItemPreprocessing;
  CreateLinkedTemplate: CreateLinkedTemplate;
  CreateMacro: CreateMacro;
  CreateMasterItem: CreateMasterItem;
  CreateTag: CreateTag;
  CreateTemplate: CreateTemplate;
  CreateTemplateGroup: CreateTemplateGroup;
  CreateTemplateGroupResponse: CreateTemplateGroupResponse;
  CreateTemplateItem: CreateTemplateItem;
  DateTime: Scalars['DateTime']['output'];
  DeleteResponse: DeleteResponse;
  Device: ResolversInterfaceTypes<ResolversParentTypes>['Device'];
  DeviceConfig: DeviceConfig;
  DeviceState: ResolversInterfaceTypes<ResolversParentTypes>['DeviceState'];
  DeviceValue: ResolversInterfaceTypes<ResolversParentTypes>['DeviceValue'];
  DeviceValueMessage: ResolversInterfaceTypes<ResolversParentTypes>['DeviceValueMessage'];
  DisplayFieldSpec: DisplayFieldSpec;
  Error: ResolversInterfaceTypes<ResolversParentTypes>['Error'];
  ErrorPayload: ErrorPayload;
  Float: Scalars['Float']['output'];
  GenericDevice: Omit<GenericDevice, 'items'> & { items?: Maybe<Array<ResolversParentTypes['ZabbixItem']>> };
  GenericDeviceState: GenericDeviceState;
  GenericResponse: GenericResponse;
  GpsPosition: ResolversInterfaceTypes<ResolversParentTypes>['GpsPosition'];
  Host: ResolversInterfaceTypes<ResolversParentTypes>['Host'];
  HostGroup: HostGroup;
  ID: Scalars['ID']['output'];
  ImportHostResponse: ImportHostResponse;
  ImportTemplateResponse: ImportTemplateResponse;
  ImportUserRightResult: ImportUserRightResult;
  ImportUserRightsResult: ImportUserRightsResult;
  Int: Scalars['Int']['output'];
  Inventory: Inventory;
  JSONObject: Scalars['JSONObject']['output'];
  Location: Location;
  LocationInput: LocationInput;
  Mutation: {};
  OperationalDeviceData: OperationalDeviceData;
  PermissionRequest: PermissionRequest;
  Query: {};
  SmoketestResponse: SmoketestResponse;
  SmoketestStep: SmoketestStep;
  String: Scalars['String']['output'];
  Template: Omit<Template, 'items'> & { items?: Maybe<Array<ResolversParentTypes['ZabbixItem']>> };
  Time: Scalars['Time']['output'];
  UserGroup: UserGroup;
  UserGroupInput: UserGroupInput;
  UserPermission: UserPermission;
  UserRights: UserRights;
  UserRightsInput: UserRightsInput;
  UserRole: UserRole;
  UserRoleInput: UserRoleInput;
  UserRoleModule: UserRoleModule;
  UserRoleModuleInput: UserRoleModuleInput;
  UserRoleRule: UserRoleRule;
  UserRoleRuleInput: UserRoleRuleInput;
  UserRoleRules: UserRoleRules;
  UserRoleRulesInput: UserRoleRulesInput;
  WidgetPreview: WidgetPreview;
  ZabbixGroupRight: ZabbixGroupRight;
  ZabbixGroupRightInput: ZabbixGroupRightInput;
  ZabbixHost: Omit<ZabbixHost, 'items' | 'parentTemplates'> & { items?: Maybe<Array<ResolversParentTypes['ZabbixItem']>>, parentTemplates?: Maybe<Array<ResolversParentTypes['Template']>> };
  ZabbixItem: Omit<ZabbixItem, 'hosts' | 'master_item'> & { hosts?: Maybe<Array<ResolversParentTypes['Host']>>, master_item?: Maybe<ResolversParentTypes['ZabbixItem']> };
};

export type ApiErrorResolvers<ContextType = any, ParentType extends ResolversParentTypes['ApiError'] = ResolversParentTypes['ApiError']> = {
  args?: Resolver<Maybe<ResolversTypes['JSONObject']>, ParentType, ContextType>;
  code?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  data?: Resolver<Maybe<ResolversTypes['JSONObject']>, ParentType, ContextType>;
  message?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  path?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CreateHostGroupResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['CreateHostGroupResponse'] = ResolversParentTypes['CreateHostGroupResponse']> = {
  error?: Resolver<Maybe<ResolversTypes['ApiError']>, ParentType, ContextType>;
  groupName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  groupid?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  message?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CreateHostResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['CreateHostResponse'] = ResolversParentTypes['CreateHostResponse']> = {
  error?: Resolver<Maybe<ResolversTypes['ApiError']>, ParentType, ContextType>;
  hostids?: Resolver<Maybe<Array<Maybe<ResolversTypes['Int']>>>, ParentType, ContextType>;
  itemids?: Resolver<Maybe<Array<Maybe<ResolversTypes['Int']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CreateTemplateGroupResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['CreateTemplateGroupResponse'] = ResolversParentTypes['CreateTemplateGroupResponse']> = {
  error?: Resolver<Maybe<ResolversTypes['ApiError']>, ParentType, ContextType>;
  groupName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  groupid?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  message?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type DeleteResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['DeleteResponse'] = ResolversParentTypes['DeleteResponse']> = {
  error?: Resolver<Maybe<ResolversTypes['ApiError']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  message?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DeviceResolvers<ContextType = any, ParentType extends ResolversParentTypes['Device'] = ResolversParentTypes['Device']> = {
  __resolveType: TypeResolveFn<'GenericDevice', ParentType, ContextType>;
  deviceType?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  host?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  hostgroups?: Resolver<Maybe<Array<ResolversTypes['HostGroup']>>, ParentType, ContextType>;
  hostid?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  inventory?: Resolver<Maybe<ResolversTypes['Inventory']>, ParentType, ContextType>;
  items?: Resolver<Maybe<Array<ResolversTypes['ZabbixItem']>>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  state?: Resolver<Maybe<ResolversTypes['DeviceState']>, ParentType, ContextType>;
  tags?: Resolver<Maybe<ResolversTypes['DeviceConfig']>, ParentType, ContextType>;
};

export type DeviceCommunicationTypeResolvers = EnumResolverSignature<{ DATABASE_MONITOR?: any, DEPENDANT_ITEM?: any, HTTP_AGENT?: any, IPMI_AGENT?: any, JMX_AGENT?: any, SIMPLE_CHECK?: any, SIMULATOR_CALCULATED?: any, SIMULATOR_JAVASCRIPT?: any, SNMP_AGENT?: any, SNMP_TRAP?: any, ZABBIX_AGENT?: any, ZABBIX_AGENT_ACTIVE?: any, ZABBIX_INTERNAL_ITEM?: any, ZABBIX_TRAP?: any }, ResolversTypes['DeviceCommunicationType']>;

export type DeviceConfigResolvers<ContextType = any, ParentType extends ResolversParentTypes['DeviceConfig'] = ResolversParentTypes['DeviceConfig']> = {
  deviceWidgetPreview?: Resolver<Maybe<ResolversTypes['WidgetPreview']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DeviceStateResolvers<ContextType = any, ParentType extends ResolversParentTypes['DeviceState'] = ResolversParentTypes['DeviceState']> = {
  __resolveType: TypeResolveFn<'GenericDeviceState', ParentType, ContextType>;
  operational?: Resolver<Maybe<ResolversTypes['OperationalDeviceData']>, ParentType, ContextType>;
};

export type DeviceStatusResolvers = EnumResolverSignature<{ DISABLED?: any, ENABLED?: any }, ResolversTypes['DeviceStatus']>;

export type DeviceValueResolvers<ContextType = any, ParentType extends ResolversParentTypes['DeviceValue'] = ResolversParentTypes['DeviceValue']> = {
  __resolveType: TypeResolveFn<null, ParentType, ContextType>;
  _empty?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
};

export type DeviceValueMessageResolvers<ContextType = any, ParentType extends ResolversParentTypes['DeviceValueMessage'] = ResolversParentTypes['DeviceValueMessage']> = {
  __resolveType: TypeResolveFn<null, ParentType, ContextType>;
  attributeName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  deviceKey?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  deviceType?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  timestamp?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  topicName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  value?: Resolver<Maybe<ResolversTypes['DeviceValue']>, ParentType, ContextType>;
};

export type DisplayFieldSpecResolvers<ContextType = any, ParentType extends ResolversParentTypes['DisplayFieldSpec'] = ResolversParentTypes['DisplayFieldSpec']> = {
  emptyValue?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  g_unit_transform?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  g_value_transform?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  key?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  unit?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  unit_font_size?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  value_font_size?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ErrorResolvers<ContextType = any, ParentType extends ResolversParentTypes['Error'] = ResolversParentTypes['Error']> = {
  __resolveType: TypeResolveFn<'ApiError', ParentType, ContextType>;
  code?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  data?: Resolver<Maybe<ResolversTypes['JSONObject']>, ParentType, ContextType>;
  message?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
};

export type ErrorPayloadResolvers<ContextType = any, ParentType extends ResolversParentTypes['ErrorPayload'] = ResolversParentTypes['ErrorPayload']> = {
  additionalInfo?: Resolver<Maybe<ResolversTypes['JSONObject']>, ParentType, ContextType>;
  code?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  message?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GenericDeviceResolvers<ContextType = any, ParentType extends ResolversParentTypes['GenericDevice'] = ResolversParentTypes['GenericDevice']> = {
  deviceType?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  host?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  hostgroups?: Resolver<Maybe<Array<ResolversTypes['HostGroup']>>, ParentType, ContextType>;
  hostid?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  inventory?: Resolver<Maybe<ResolversTypes['Inventory']>, ParentType, ContextType>;
  items?: Resolver<Maybe<Array<ResolversTypes['ZabbixItem']>>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  state?: Resolver<Maybe<ResolversTypes['GenericDeviceState']>, ParentType, ContextType>;
  tags?: Resolver<Maybe<ResolversTypes['DeviceConfig']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GenericDeviceStateResolvers<ContextType = any, ParentType extends ResolversParentTypes['GenericDeviceState'] = ResolversParentTypes['GenericDeviceState']> = {
  current?: Resolver<Maybe<ResolversTypes['JSONObject']>, ParentType, ContextType>;
  operational?: Resolver<Maybe<ResolversTypes['OperationalDeviceData']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GenericResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['GenericResponse'] = ResolversParentTypes['GenericResponse']> = {
  error?: Resolver<Maybe<ResolversTypes['ApiError']>, ParentType, ContextType>;
  result?: Resolver<Maybe<Array<ResolversTypes['JSONObject']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GpsPositionResolvers<ContextType = any, ParentType extends ResolversParentTypes['GpsPosition'] = ResolversParentTypes['GpsPosition']> = {
  __resolveType: TypeResolveFn<'Location', ParentType, ContextType>;
  latitude?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  longitude?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
};

export type HostResolvers<ContextType = any, ParentType extends ResolversParentTypes['Host'] = ResolversParentTypes['Host']> = {
  __resolveType: TypeResolveFn<'GenericDevice' | 'ZabbixHost', ParentType, ContextType>;
  deviceType?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  host?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  hostgroups?: Resolver<Maybe<Array<ResolversTypes['HostGroup']>>, ParentType, ContextType>;
  hostid?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  inventory?: Resolver<Maybe<ResolversTypes['Inventory']>, ParentType, ContextType>;
  items?: Resolver<Maybe<Array<ResolversTypes['ZabbixItem']>>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
};

export type HostGroupResolvers<ContextType = any, ParentType extends ResolversParentTypes['HostGroup'] = ResolversParentTypes['HostGroup']> = {
  groupid?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ImportHostResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['ImportHostResponse'] = ResolversParentTypes['ImportHostResponse']> = {
  deviceKey?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  error?: Resolver<Maybe<ResolversTypes['ApiError']>, ParentType, ContextType>;
  hostid?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  message?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ImportTemplateResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['ImportTemplateResponse'] = ResolversParentTypes['ImportTemplateResponse']> = {
  error?: Resolver<Maybe<ResolversTypes['ApiError']>, ParentType, ContextType>;
  host?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  message?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  templateid?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ImportUserRightResultResolvers<ContextType = any, ParentType extends ResolversParentTypes['ImportUserRightResult'] = ResolversParentTypes['ImportUserRightResult']> = {
  errors?: Resolver<Maybe<Array<ResolversTypes['ApiError']>>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  message?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ImportUserRightsResultResolvers<ContextType = any, ParentType extends ResolversParentTypes['ImportUserRightsResult'] = ResolversParentTypes['ImportUserRightsResult']> = {
  userGroups?: Resolver<Maybe<Array<ResolversTypes['ImportUserRightResult']>>, ParentType, ContextType>;
  userRoles?: Resolver<Maybe<Array<ResolversTypes['ImportUserRightResult']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type InventoryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Inventory'] = ResolversParentTypes['Inventory']> = {
  location?: Resolver<Maybe<ResolversTypes['Location']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface JsonObjectScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['JSONObject'], any> {
  name: 'JSONObject';
}

export type LocationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Location'] = ResolversParentTypes['Location']> = {
  latitude?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  longitude?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  createHost?: Resolver<Maybe<ResolversTypes['CreateHostResponse']>, ParentType, ContextType, RequireFields<MutationCreateHostArgs, 'host' | 'hostgroupids'>>;
  deleteHostGroups?: Resolver<Maybe<Array<ResolversTypes['DeleteResponse']>>, ParentType, ContextType, Partial<MutationDeleteHostGroupsArgs>>;
  deleteHosts?: Resolver<Maybe<Array<ResolversTypes['DeleteResponse']>>, ParentType, ContextType, Partial<MutationDeleteHostsArgs>>;
  deleteTemplateGroups?: Resolver<Maybe<Array<ResolversTypes['DeleteResponse']>>, ParentType, ContextType, Partial<MutationDeleteTemplateGroupsArgs>>;
  deleteTemplates?: Resolver<Maybe<Array<ResolversTypes['DeleteResponse']>>, ParentType, ContextType, Partial<MutationDeleteTemplatesArgs>>;
  importHostGroups?: Resolver<Maybe<Array<ResolversTypes['CreateHostGroupResponse']>>, ParentType, ContextType, RequireFields<MutationImportHostGroupsArgs, 'hostGroups'>>;
  importHosts?: Resolver<Maybe<Array<ResolversTypes['ImportHostResponse']>>, ParentType, ContextType, RequireFields<MutationImportHostsArgs, 'hosts'>>;
  importTemplateGroups?: Resolver<Maybe<Array<ResolversTypes['CreateTemplateGroupResponse']>>, ParentType, ContextType, RequireFields<MutationImportTemplateGroupsArgs, 'templateGroups'>>;
  importTemplates?: Resolver<Maybe<Array<ResolversTypes['ImportTemplateResponse']>>, ParentType, ContextType, RequireFields<MutationImportTemplatesArgs, 'templates'>>;
  importUserRights?: Resolver<Maybe<ResolversTypes['ImportUserRightsResult']>, ParentType, ContextType, RequireFields<MutationImportUserRightsArgs, 'dryRun' | 'input'>>;
  runAllRegressionTests?: Resolver<ResolversTypes['SmoketestResponse'], ParentType, ContextType, RequireFields<MutationRunAllRegressionTestsArgs, 'groupName' | 'hostName'>>;
  runSmoketest?: Resolver<ResolversTypes['SmoketestResponse'], ParentType, ContextType, RequireFields<MutationRunSmoketestArgs, 'groupName' | 'hostName' | 'templateName'>>;
};

export type OperationalDeviceDataResolvers<ContextType = any, ParentType extends ResolversParentTypes['OperationalDeviceData'] = ResolversParentTypes['OperationalDeviceData']> = {
  error?: Resolver<Maybe<Array<ResolversTypes['ErrorPayload']>>, ParentType, ContextType>;
  location?: Resolver<Maybe<ResolversTypes['Location']>, ParentType, ContextType>;
  signalstrength?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  temperature?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  timestamp?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  voltage?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PermissionResolvers = EnumResolverSignature<{ DENY?: any, READ?: any, READ_WRITE?: any }, ResolversTypes['Permission']>;

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  allDevices?: Resolver<Maybe<Array<Maybe<ResolversTypes['Device']>>>, ParentType, ContextType, RequireFields<QueryAllDevicesArgs, 'filter_host' | 'groupids' | 'name_pattern' | 'tag_deviceType' | 'with_items'>>;
  allHostGroups?: Resolver<Maybe<Array<Maybe<ResolversTypes['HostGroup']>>>, ParentType, ContextType, RequireFields<QueryAllHostGroupsArgs, 'with_hosts'>>;
  allHosts?: Resolver<Maybe<Array<Maybe<ResolversTypes['Host']>>>, ParentType, ContextType, RequireFields<QueryAllHostsArgs, 'filter_host' | 'groupids' | 'name_pattern' | 'tag_deviceType' | 'with_items'>>;
  allTemplateGroups?: Resolver<Maybe<Array<Maybe<ResolversTypes['HostGroup']>>>, ParentType, ContextType, Partial<QueryAllTemplateGroupsArgs>>;
  apiVersion?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  exportHostValueHistory?: Resolver<Maybe<ResolversTypes['GenericResponse']>, ParentType, ContextType, RequireFields<QueryExportHostValueHistoryArgs, 'sortOrder' | 'type'>>;
  exportUserRights?: Resolver<Maybe<ResolversTypes['UserRights']>, ParentType, ContextType, RequireFields<QueryExportUserRightsArgs, 'exclude_hostgroups_pattern' | 'name_pattern'>>;
  hasPermissions?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<QueryHasPermissionsArgs, 'permissions'>>;
  locations?: Resolver<Maybe<Array<Maybe<ResolversTypes['Location']>>>, ParentType, ContextType, RequireFields<QueryLocationsArgs, 'distinct_by_name' | 'name_pattern' | 'templateids'>>;
  login?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<QueryLoginArgs, 'password' | 'username'>>;
  logout?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  templates?: Resolver<Maybe<Array<Maybe<ResolversTypes['Template']>>>, ParentType, ContextType, Partial<QueryTemplatesArgs>>;
  userPermissions?: Resolver<Maybe<Array<ResolversTypes['UserPermission']>>, ParentType, ContextType, Partial<QueryUserPermissionsArgs>>;
  zabbixVersion?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
};

export type SmoketestResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['SmoketestResponse'] = ResolversParentTypes['SmoketestResponse']> = {
  message?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  steps?: Resolver<Array<ResolversTypes['SmoketestStep']>, ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SmoketestStepResolvers<ContextType = any, ParentType extends ResolversParentTypes['SmoketestStep'] = ResolversParentTypes['SmoketestStep']> = {
  message?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type StorageItemTypeResolvers = EnumResolverSignature<{ FLOAT?: any, INT?: any, TEXT?: any }, ResolversTypes['StorageItemType']>;

export type TemplateResolvers<ContextType = any, ParentType extends ResolversParentTypes['Template'] = ResolversParentTypes['Template']> = {
  host?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  items?: Resolver<Maybe<Array<ResolversTypes['ZabbixItem']>>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  templateid?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface TimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Time'], any> {
  name: 'Time';
}

export type UserGroupResolvers<ContextType = any, ParentType extends ResolversParentTypes['UserGroup'] = ResolversParentTypes['UserGroup']> = {
  gui_access?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  hostgroup_rights?: Resolver<Maybe<Array<ResolversTypes['ZabbixGroupRight']>>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  templategroup_rights?: Resolver<Maybe<Array<ResolversTypes['ZabbixGroupRight']>>, ParentType, ContextType>;
  users_status?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  usrgrpid?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserPermissionResolvers<ContextType = any, ParentType extends ResolversParentTypes['UserPermission'] = ResolversParentTypes['UserPermission']> = {
  objectName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  permission?: Resolver<ResolversTypes['Permission'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserRightsResolvers<ContextType = any, ParentType extends ResolversParentTypes['UserRights'] = ResolversParentTypes['UserRights']> = {
  userGroups?: Resolver<Maybe<Array<ResolversTypes['UserGroup']>>, ParentType, ContextType>;
  userRoles?: Resolver<Maybe<Array<ResolversTypes['UserRole']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserRoleResolvers<ContextType = any, ParentType extends ResolversParentTypes['UserRole'] = ResolversParentTypes['UserRole']> = {
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  readonly?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  roleid?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  rules?: Resolver<Maybe<ResolversTypes['UserRoleRules']>, ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserRoleModuleResolvers<ContextType = any, ParentType extends ResolversParentTypes['UserRoleModule'] = ResolversParentTypes['UserRoleModule']> = {
  id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  moduleid?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  relative_path?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserRoleRuleResolvers<ContextType = any, ParentType extends ResolversParentTypes['UserRoleRule'] = ResolversParentTypes['UserRoleRule']> = {
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserRoleRulesResolvers<ContextType = any, ParentType extends ResolversParentTypes['UserRoleRules'] = ResolversParentTypes['UserRoleRules']> = {
  actions?: Resolver<Maybe<Array<ResolversTypes['UserRoleRule']>>, ParentType, ContextType>;
  actions_default_access?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  api?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  api_access?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  api_mode?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  modules?: Resolver<Maybe<Array<ResolversTypes['UserRoleModule']>>, ParentType, ContextType>;
  modules_default_access?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  ui?: Resolver<Maybe<Array<ResolversTypes['UserRoleRule']>>, ParentType, ContextType>;
  ui_default_access?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type WidgetPreviewResolvers<ContextType = any, ParentType extends ResolversParentTypes['WidgetPreview'] = ResolversParentTypes['WidgetPreview']> = {
  BOTTOM_LEFT?: Resolver<Maybe<ResolversTypes['DisplayFieldSpec']>, ParentType, ContextType>;
  BOTTOM_RIGHT?: Resolver<Maybe<ResolversTypes['DisplayFieldSpec']>, ParentType, ContextType>;
  TOP_LEFT?: Resolver<Maybe<ResolversTypes['DisplayFieldSpec']>, ParentType, ContextType>;
  TOP_RIGHT?: Resolver<Maybe<ResolversTypes['DisplayFieldSpec']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ZabbixGroupRightResolvers<ContextType = any, ParentType extends ResolversParentTypes['ZabbixGroupRight'] = ResolversParentTypes['ZabbixGroupRight']> = {
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  permission?: Resolver<Maybe<ResolversTypes['Permission']>, ParentType, ContextType>;
  uuid?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ZabbixHostResolvers<ContextType = any, ParentType extends ResolversParentTypes['ZabbixHost'] = ResolversParentTypes['ZabbixHost']> = {
  deviceType?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  host?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  hostgroups?: Resolver<Maybe<Array<ResolversTypes['HostGroup']>>, ParentType, ContextType>;
  hostid?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  inventory?: Resolver<Maybe<ResolversTypes['Inventory']>, ParentType, ContextType>;
  items?: Resolver<Maybe<Array<ResolversTypes['ZabbixItem']>>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  parentTemplates?: Resolver<Maybe<Array<ResolversTypes['Template']>>, ParentType, ContextType>;
  tags?: Resolver<Maybe<ResolversTypes['JSONObject']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ZabbixItemResolvers<ContextType = any, ParentType extends ResolversParentTypes['ZabbixItem'] = ResolversParentTypes['ZabbixItem']> = {
  attributeName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  delay?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  history?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  hostid?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  hosts?: Resolver<Maybe<Array<ResolversTypes['Host']>>, ParentType, ContextType>;
  itemid?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  key_?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  lastclock?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  lastvalue?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  master_item?: Resolver<Maybe<ResolversTypes['ZabbixItem']>, ParentType, ContextType>;
  master_itemid?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  preprocessing?: Resolver<Maybe<Array<ResolversTypes['JSONObject']>>, ParentType, ContextType>;
  status?: Resolver<Maybe<ResolversTypes['DeviceStatus']>, ParentType, ContextType>;
  status_int?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  tags?: Resolver<Maybe<Array<ResolversTypes['JSONObject']>>, ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['DeviceCommunicationType']>, ParentType, ContextType>;
  type_int?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  units?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  value_type?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  ApiError?: ApiErrorResolvers<ContextType>;
  CreateHostGroupResponse?: CreateHostGroupResponseResolvers<ContextType>;
  CreateHostResponse?: CreateHostResponseResolvers<ContextType>;
  CreateTemplateGroupResponse?: CreateTemplateGroupResponseResolvers<ContextType>;
  DateTime?: GraphQLScalarType;
  DeleteResponse?: DeleteResponseResolvers<ContextType>;
  Device?: DeviceResolvers<ContextType>;
  DeviceCommunicationType?: DeviceCommunicationTypeResolvers;
  DeviceConfig?: DeviceConfigResolvers<ContextType>;
  DeviceState?: DeviceStateResolvers<ContextType>;
  DeviceStatus?: DeviceStatusResolvers;
  DeviceValue?: DeviceValueResolvers<ContextType>;
  DeviceValueMessage?: DeviceValueMessageResolvers<ContextType>;
  DisplayFieldSpec?: DisplayFieldSpecResolvers<ContextType>;
  Error?: ErrorResolvers<ContextType>;
  ErrorPayload?: ErrorPayloadResolvers<ContextType>;
  GenericDevice?: GenericDeviceResolvers<ContextType>;
  GenericDeviceState?: GenericDeviceStateResolvers<ContextType>;
  GenericResponse?: GenericResponseResolvers<ContextType>;
  GpsPosition?: GpsPositionResolvers<ContextType>;
  Host?: HostResolvers<ContextType>;
  HostGroup?: HostGroupResolvers<ContextType>;
  ImportHostResponse?: ImportHostResponseResolvers<ContextType>;
  ImportTemplateResponse?: ImportTemplateResponseResolvers<ContextType>;
  ImportUserRightResult?: ImportUserRightResultResolvers<ContextType>;
  ImportUserRightsResult?: ImportUserRightsResultResolvers<ContextType>;
  Inventory?: InventoryResolvers<ContextType>;
  JSONObject?: GraphQLScalarType;
  Location?: LocationResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  OperationalDeviceData?: OperationalDeviceDataResolvers<ContextType>;
  Permission?: PermissionResolvers;
  Query?: QueryResolvers<ContextType>;
  SmoketestResponse?: SmoketestResponseResolvers<ContextType>;
  SmoketestStep?: SmoketestStepResolvers<ContextType>;
  StorageItemType?: StorageItemTypeResolvers;
  Template?: TemplateResolvers<ContextType>;
  Time?: GraphQLScalarType;
  UserGroup?: UserGroupResolvers<ContextType>;
  UserPermission?: UserPermissionResolvers<ContextType>;
  UserRights?: UserRightsResolvers<ContextType>;
  UserRole?: UserRoleResolvers<ContextType>;
  UserRoleModule?: UserRoleModuleResolvers<ContextType>;
  UserRoleRule?: UserRoleRuleResolvers<ContextType>;
  UserRoleRules?: UserRoleRulesResolvers<ContextType>;
  WidgetPreview?: WidgetPreviewResolvers<ContextType>;
  ZabbixGroupRight?: ZabbixGroupRightResolvers<ContextType>;
  ZabbixHost?: ZabbixHostResolvers<ContextType>;
  ZabbixItem?: ZabbixItemResolvers<ContextType>;
};

