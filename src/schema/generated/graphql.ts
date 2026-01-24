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

export interface ApiError extends Error {
  __typename?: 'ApiError';
  args?: Maybe<Scalars['JSONObject']['output']>;
  code?: Maybe<Scalars['Int']['output']>;
  data?: Maybe<Scalars['JSONObject']['output']>;
  message?: Maybe<Scalars['String']['output']>;
  path?: Maybe<Scalars['String']['output']>;
}

export interface CreateHost {
  deviceKey: Scalars['String']['input'];
  deviceType: Scalars['String']['input'];
  /**
   * groupNames is used to assign the created object
   * to a host group. It is mandatory but
   * can also be blank. This is usefull in case of
   * passing a groupid instead which is
   * the zabbix internal key for storing the group.
   * If a groupid is provided the passed groupName is ignored
   */
  groupNames: Array<Scalars['String']['input']>;
  /**
   * Optionally the internal groupids can be passed - in this case the
   * groupName is ignored
   */
  groupids?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  location?: InputMaybe<LocationInput>;
  /** Optional display name of the device (must be unique if provided - default is to set display name to deviceKey) */
  name?: InputMaybe<Scalars['String']['input']>;
}

export interface CreateHostGroup {
  /** Name of the host group */
  groupName: Scalars['String']['input'];
  /**
   * Internally used unique id
   * (will be assigned by Zabbix if empty)
   */
  uuid?: InputMaybe<Scalars['String']['input']>;
}

export interface CreateHostGroupResponse {
  __typename?: 'CreateHostGroupResponse';
  error?: Maybe<ApiError>;
  groupName: Scalars['String']['output'];
  groupid?: Maybe<Scalars['Int']['output']>;
  message?: Maybe<Scalars['String']['output']>;
}

export interface CreateHostResponse {
  __typename?: 'CreateHostResponse';
  error?: Maybe<ApiError>;
  hostids?: Maybe<Array<Maybe<Scalars['Int']['output']>>>;
  itemids?: Maybe<Array<Maybe<Scalars['Int']['output']>>>;
}

export interface CreateItemPreprocessing {
  error_handler?: InputMaybe<Scalars['Int']['input']>;
  error_handler_params?: InputMaybe<Scalars['String']['input']>;
  params: Array<Scalars['String']['input']>;
  type: Scalars['Int']['input'];
}

export interface CreateLinkedTemplate {
  name: Scalars['String']['input'];
}

export interface CreateMasterItem {
  key: Scalars['String']['input'];
}

export interface CreateTag {
  tag: Scalars['String']['input'];
  value?: InputMaybe<Scalars['String']['input']>;
}

export interface CreateTemplate {
  /**
   * groupNames is used to assign the created object
   * to a template group.
   */
  groupNames: Array<Scalars['String']['input']>;
  /**
   * Optionally the internal groupids can be passed - in this case the
   * groupName is ignored
   */
  groupids?: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  /** Name of the template */
  host: Scalars['String']['input'];
  /** Template items */
  items?: InputMaybe<Array<CreateTemplateItem>>;
  /** Visible name of the template */
  name?: InputMaybe<Scalars['String']['input']>;
  /** Template tags */
  tags?: InputMaybe<Array<CreateTag>>;
  /** Linked templates */
  templates?: InputMaybe<Array<CreateLinkedTemplate>>;
  /**
   * Internally used unique id
   * (will be assigned by Zabbix if empty)
   */
  uuid?: InputMaybe<Scalars['String']['input']>;
}

export interface CreateTemplateGroup {
  /** Name of the template group */
  groupName: Scalars['String']['input'];
  /**
   * Internally used unique id
   * (will be assigned by Zabbix if empty)
   */
  uuid?: InputMaybe<Scalars['String']['input']>;
}

export interface CreateTemplateGroupResponse {
  __typename?: 'CreateTemplateGroupResponse';
  error?: Maybe<ApiError>;
  groupName: Scalars['String']['output'];
  groupid?: Maybe<Scalars['Int']['output']>;
  message?: Maybe<Scalars['String']['output']>;
}

export interface CreateTemplateItem {
  delay?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  history?: InputMaybe<Scalars['String']['input']>;
  key: Scalars['String']['input'];
  master_item?: InputMaybe<CreateMasterItem>;
  name: Scalars['String']['input'];
  preprocessing?: InputMaybe<Array<CreateItemPreprocessing>>;
  tags?: InputMaybe<Array<CreateTag>>;
  type?: InputMaybe<Scalars['Int']['input']>;
  units?: InputMaybe<Scalars['String']['input']>;
  uuid?: InputMaybe<Scalars['String']['input']>;
  value_type?: InputMaybe<Scalars['Int']['input']>;
}

export interface DeleteResponse {
  __typename?: 'DeleteResponse';
  error?: Maybe<ApiError>;
  id: Scalars['Int']['output'];
  message?: Maybe<Scalars['String']['output']>;
}

/**
 * (IoT / Edge - ) Devices are hosts having a state containing the "output" / the business data which is exposed
 * besides monitoring information.
 */
export interface Device {
  deviceType?: Maybe<Scalars['String']['output']>;
  /** Per convention a uuid is used as hostname to identify devices if they do not have a unique hostname */
  host: Scalars['String']['output'];
  hostgroups?: Maybe<Array<HostGroup>>;
  hostid: Scalars['ID']['output'];
  name?: Maybe<Scalars['String']['output']>;
  state?: Maybe<DeviceState>;
  tags?: Maybe<DeviceConfig>;
}

export { DeviceCommunicationType };

export interface DeviceConfig {
  __typename?: 'DeviceConfig';
  deviceWidgetPreview?: Maybe<WidgetPreview>;
}

export interface DeviceState {
  operational?: Maybe<OperationalDeviceData>;
}

export { DeviceStatus };

/** Marker-interface for device-related data values. */
export interface DeviceValue {
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
   * The format should align with standard expectations (e.g., ISO 8601).
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

export interface DisplayFieldSpec {
  __typename?: 'DisplayFieldSpec';
  emptyValue?: Maybe<Scalars['String']['output']>;
  g_unit_transform?: Maybe<Scalars['String']['output']>;
  g_value_transform?: Maybe<Scalars['String']['output']>;
  key?: Maybe<Scalars['String']['output']>;
  unit?: Maybe<Scalars['String']['output']>;
  unit_font_size?: Maybe<Scalars['String']['output']>;
  value_font_size?: Maybe<Scalars['String']['output']>;
}

export interface Error {
  code?: Maybe<Scalars['Int']['output']>;
  data?: Maybe<Scalars['JSONObject']['output']>;
  message?: Maybe<Scalars['String']['output']>;
}

export interface ErrorPayload {
  __typename?: 'ErrorPayload';
  additionalInfo?: Maybe<Scalars['JSONObject']['output']>;
  code: Scalars['Int']['output'];
  message?: Maybe<Scalars['String']['output']>;
}

/** Device represents generic IoT / Edge - devices providing their state as generic "state.current" - JSON Object */
export interface GenericDevice extends Device, Host {
  __typename?: 'GenericDevice';
  deviceType?: Maybe<Scalars['String']['output']>;
  /** Per convention a uuid is used as hostname to identify devices if they do not have a unique hostname */
  host: Scalars['String']['output'];
  hostgroups?: Maybe<Array<HostGroup>>;
  hostid: Scalars['ID']['output'];
  name?: Maybe<Scalars['String']['output']>;
  state?: Maybe<GenericDeviceState>;
  tags?: Maybe<DeviceConfig>;
}

export interface GenericDeviceState extends DeviceState {
  __typename?: 'GenericDeviceState';
  current?: Maybe<Scalars['JSONObject']['output']>;
  operational?: Maybe<OperationalDeviceData>;
}

export interface GenericResponse {
  __typename?: 'GenericResponse';
  error?: Maybe<ApiError>;
  result?: Maybe<Array<Scalars['JSONObject']['output']>>;
}

/** Hint: WGS84[dd.ddddd] coordinates are used */
export interface GpsPosition {
  latitude?: Maybe<Scalars['Float']['output']>;
  longitude?: Maybe<Scalars['Float']['output']>;
}

export interface Host {
  /**
   * Specifies the type or category of the device. Used to define the classification
   * of a device in the system (capabilities, functionalities, or purpose).
   */
  deviceType?: Maybe<Scalars['String']['output']>;
  /** The host field contains the "hostname" in Zabbix */
  host: Scalars['String']['output'];
  hostgroups?: Maybe<Array<HostGroup>>;
  hostid: Scalars['ID']['output'];
  name?: Maybe<Scalars['String']['output']>;
}

export interface HostGroup {
  __typename?: 'HostGroup';
  groupid: Scalars['ID']['output'];
  name?: Maybe<Scalars['String']['output']>;
}

export interface ImportHostResponse {
  __typename?: 'ImportHostResponse';
  deviceKey: Scalars['String']['output'];
  error?: Maybe<ApiError>;
  hostid?: Maybe<Scalars['String']['output']>;
  message?: Maybe<Scalars['String']['output']>;
}

export interface ImportTemplateResponse {
  __typename?: 'ImportTemplateResponse';
  error?: Maybe<ApiError>;
  host: Scalars['String']['output'];
  message?: Maybe<Scalars['String']['output']>;
  templateid?: Maybe<Scalars['String']['output']>;
}

export interface ImportUserRightResult {
  __typename?: 'ImportUserRightResult';
  errors?: Maybe<Array<ApiError>>;
  id?: Maybe<Scalars['String']['output']>;
  message?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
}

export interface ImportUserRightsResult {
  __typename?: 'ImportUserRightsResult';
  userGroups?: Maybe<Array<ImportUserRightResult>>;
  userRoles?: Maybe<Array<ImportUserRightResult>>;
}

export interface Inventory {
  __typename?: 'Inventory';
  location?: Maybe<Location>;
}

export interface Location extends GpsPosition {
  __typename?: 'Location';
  latitude?: Maybe<Scalars['Float']['output']>;
  longitude?: Maybe<Scalars['Float']['output']>;
  name?: Maybe<Scalars['String']['output']>;
}

export interface LocationInput {
  location_lat?: InputMaybe<Scalars['String']['input']>;
  location_lon?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
}

export interface Mutation {
  __typename?: 'Mutation';
  /** Authentication: By zbx_session - cookie or zabbix-auth-token - header */
  createHost?: Maybe<CreateHostResponse>;
  /**
   * Delete template groups.
   *
   * Authentication: By zbx_session - cookie or zabbix-auth-token - header
   */
  deleteTemplateGroups?: Maybe<Array<DeleteResponse>>;
  /**
   * Delete templates.
   *
   * Authentication: By zbx_session - cookie or zabbix-auth-token - header
   */
  deleteTemplates?: Maybe<Array<DeleteResponse>>;
  /**
   * (Mass) Import zabbix groups
   * and assign them to the corresponding hosts by groupid or groupName.
   *
   * Return value: If no error occurs a groupid be returned for each created group,
   * otherwise the return object will contain an error message
   *
   * Authentication: By zbx_session - cookie or zabbix-auth-token - header
   */
  importHostGroups?: Maybe<Array<CreateHostGroupResponse>>;
  /**
   * (Mass) Import hosts and assign them to host groups by groupid or groupName.
   *
   * Return value: If no error occurs a hostid will be returned for each created host,
   * otherwise the return object will contain an error message.
   *
   * Authentication: By zbx_session - cookie or zabbix-auth-token - header
   */
  importHosts?: Maybe<Array<ImportHostResponse>>;
  /**
   * (Mass) Import template groups
   * and assign them by groupid or name.
   *
   * Return value: If no error occurs a groupid be returned for each created group,
   * otherwise the return object will contain an error message
   *
   * Authentication: By zbx_session - cookie or zabbix-auth-token - header
   */
  importTemplateGroups?: Maybe<Array<CreateTemplateGroupResponse>>;
  /**
   * (Mass) Import templates.
   *
   * Return value: If no error occurs a templateid will be returned for each created template,
   * otherwise the return object will contain an error message.
   *
   * Authentication: By zbx_session - cookie or zabbix-auth-token - header
   */
  importTemplates?: Maybe<Array<ImportTemplateResponse>>;
  importUserRights?: Maybe<ImportUserRightsResult>;
}


export interface MutationCreateHostArgs {
  host: Scalars['String']['input'];
  hostgroupids: Array<Scalars['Int']['input']>;
  location?: InputMaybe<LocationInput>;
  templateids: Array<Scalars['Int']['input']>;
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

export interface OperationalDeviceData {
  __typename?: 'OperationalDeviceData';
  error?: Maybe<Array<ErrorPayload>>;
  location?: Maybe<Location>;
  signalstrength?: Maybe<Scalars['Float']['output']>;
  temperature?: Maybe<Scalars['Float']['output']>;
  timestamp?: Maybe<Scalars['DateTime']['output']>;
  voltage?: Maybe<Scalars['Float']['output']>;
}

export { Permission };

export interface PermissionRequest {
  /**
   * objectName maps to name / path suffix of the template group representing the permission in Zabbix:
   * Permissions/{objectName}
   */
  objectName: Scalars['String']['input'];
  permission: Permission;
}

export interface Query {
  __typename?: 'Query';
  /**
   * Get all devices + corresponding items. Devices are modelled as hosts having a device type + a state.
   * If with_items==true only hosts with attached items are delivered
   * name_pattern: If provided this will perform a  LIKE "%…%" search on the name attribute within the database.
   *
   * Authentication: By zbx_session - cookie or zabbix-auth-token - header
   */
  allDevices?: Maybe<Array<Maybe<Device>>>;
  /**
   * Get all host groups.
   * If with_hosts==true only groups with attached hosts are delivered.
   *
   * Authentication: By zbx_session - cookie or zabbix-auth-token - header
   */
  allHostGroups?: Maybe<Array<Maybe<HostGroup>>>;
  /**
   * Get all hosts + corresponding items. If with_items==true only hosts with attached items are delivered
   * name_pattern: If provided this will perform a  LIKE "%…%" search on the name attribute within the database.
   *
   * Authentication: By zbx_session - cookie or zabbix-auth-token - header
   */
  allHosts?: Maybe<Array<Maybe<Host>>>;
  /** Get template groups. */
  allTemplateGroups?: Maybe<Array<Maybe<HostGroup>>>;
  /** Get api (build) version */
  apiVersion: Scalars['String']['output'];
  /**
   * Export history from Zabbix items
   *
   * Authentication: By zbx_session - cookie or zabbix-auth-token - header
   */
  exportHostValueHistory?: Maybe<GenericResponse>;
  /**
   * name_pattern: If provided this will perform a  LIKE "%…%" search on the name attribute within the database.
   * exclude_groups_pattern: Regex allowing to exclude all matching hostgroups from group permissions
   */
  exportUserRights?: Maybe<UserRights>;
  /**
   * Return true if and only if the current user (identified by token / cookie)
   * has all requested permissions (minimum - if READ is requested and the user has READ_WRITE
   * the response will be true)
   */
  hasPermissions?: Maybe<Scalars['Boolean']['output']>;
  /**
   * Get all locations used by hosts.
   * distinct_by_name=true means that the result is filtered for distinct names (default)
   * name_pattern: If provided this will perform a Regex search on the name attribute within the database.
   *
   * Authentication: By zbx_session - cookie or zabbix-auth-token - header
   */
  locations?: Maybe<Array<Maybe<Location>>>;
  /**
   * Login to zabbix - provided for debugging and testing purpose. The result of the login operation is
   * authentication token returned may be passed as
   * header 'zabbix-auth-token' for authenticating future API requests.
   * As an alternative to the cookie 'zbx_session' may be set which is automatically set after login to
   * the cockpit - this is the standard way to authenticate api calls initiated by the cockpit frontend
   * because the frontend is always embedded into the Zabbix portal which is only accessible after logging in and
   * obtainind the zbx_session - cookie.
   */
  login?: Maybe<Scalars['String']['output']>;
  /**
   * Logout from  zabbix - provided for debugging and testing purpose. This invalidates the token received by the login
   * operation. Returns true on success
   */
  logout?: Maybe<Scalars['Boolean']['output']>;
  /** Get templates. */
  templates?: Maybe<Array<Maybe<Template>>>;
  /**
   * Return all user permissions. If objectNames is provided return only the permissions related to the objects within
   * the objectNames - list
   */
  userPermissions?: Maybe<Array<UserPermission>>;
  /** Get zabbix version */
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

export enum SortOrder {
  /** Deliver values in ascending order */
  Asc = 'asc',
  /** Deliver values in descending order */
  Desc = 'desc'
}

export { StorageItemType };

export interface Template {
  __typename?: 'Template';
  name?: Maybe<Scalars['String']['output']>;
  templateid: Scalars['String']['output'];
}

export interface UserGroup {
  __typename?: 'UserGroup';
  gui_access?: Maybe<Scalars['Int']['output']>;
  hostgroup_rights?: Maybe<Array<ZabbixGroupRight>>;
  name: Scalars['String']['output'];
  templategroup_rights?: Maybe<Array<ZabbixGroupRight>>;
  users_status?: Maybe<Scalars['Int']['output']>;
  usrgrpid: Scalars['Int']['output'];
}

export interface UserGroupInput {
  gui_access?: InputMaybe<Scalars['Int']['input']>;
  hostgroup_rights?: InputMaybe<Array<ZabbixGroupRightInput>>;
  name: Scalars['String']['input'];
  templategroup_rights?: InputMaybe<Array<ZabbixGroupRightInput>>;
  users_status?: InputMaybe<Scalars['Int']['input']>;
}

export interface UserPermission {
  __typename?: 'UserPermission';
  /**
   * objectName maps to name / path suffix of the template group representing the permission in Zabbix:
   * Permissions/{objectName}
   */
  objectName: Scalars['String']['output'];
  permission: Permission;
}

export interface UserRights {
  __typename?: 'UserRights';
  userGroups?: Maybe<Array<UserGroup>>;
  userRoles?: Maybe<Array<UserRole>>;
}

export interface UserRightsInput {
  userGroups?: InputMaybe<Array<UserGroupInput>>;
  userRoles?: InputMaybe<Array<UserRoleInput>>;
}

export interface UserRole {
  __typename?: 'UserRole';
  name?: Maybe<Scalars['String']['output']>;
  readonly?: Maybe<Scalars['Int']['output']>;
  roleid: Scalars['Int']['output'];
  rules?: Maybe<UserRoleRules>;
  type?: Maybe<Scalars['Int']['output']>;
}

export interface UserRoleInput {
  name?: InputMaybe<Scalars['String']['input']>;
  readonly?: InputMaybe<Scalars['Int']['input']>;
  rules?: InputMaybe<UserRoleRulesInput>;
  type?: InputMaybe<Scalars['Int']['input']>;
}

export interface UserRoleModule {
  __typename?: 'UserRoleModule';
  id?: Maybe<Scalars['String']['output']>;
  moduleid?: Maybe<Scalars['String']['output']>;
  relative_path?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['Int']['output']>;
}

export interface UserRoleModuleInput {
  id?: InputMaybe<Scalars['String']['input']>;
  moduleid?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['Int']['input']>;
}

export interface UserRoleRule {
  __typename?: 'UserRoleRule';
  name?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['Int']['output']>;
}

export interface UserRoleRuleInput {
  name?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['Int']['input']>;
}

export interface UserRoleRules {
  __typename?: 'UserRoleRules';
  actions?: Maybe<Array<UserRoleRule>>;
  actions_default_access?: Maybe<Scalars['Int']['output']>;
  api?: Maybe<Array<Scalars['String']['output']>>;
  api_access?: Maybe<Scalars['Int']['output']>;
  api_mode?: Maybe<Scalars['Int']['output']>;
  modules?: Maybe<Array<UserRoleModule>>;
  modules_default_access?: Maybe<Scalars['Int']['output']>;
  ui?: Maybe<Array<UserRoleRule>>;
  ui_default_access?: Maybe<Scalars['Int']['output']>;
}

export interface UserRoleRulesInput {
  actions?: InputMaybe<Array<UserRoleRuleInput>>;
  actions_default_access?: InputMaybe<Scalars['Int']['input']>;
  api?: InputMaybe<Array<Scalars['String']['input']>>;
  api_access?: InputMaybe<Scalars['Int']['input']>;
  api_mode?: InputMaybe<Scalars['Int']['input']>;
  modules?: InputMaybe<Array<UserRoleModuleInput>>;
  modules_default_access?: InputMaybe<Scalars['Int']['input']>;
  ui?: InputMaybe<Array<UserRoleRuleInput>>;
  ui_default_access?: InputMaybe<Scalars['Int']['input']>;
}

export interface WidgetPreview {
  __typename?: 'WidgetPreview';
  BOTTOM_LEFT?: Maybe<DisplayFieldSpec>;
  BOTTOM_RIGHT?: Maybe<DisplayFieldSpec>;
  TOP_LEFT?: Maybe<DisplayFieldSpec>;
  TOP_RIGHT?: Maybe<DisplayFieldSpec>;
}

export interface ZabbixGroupRight {
  __typename?: 'ZabbixGroupRight';
  id: Scalars['Int']['output'];
  name?: Maybe<Scalars['String']['output']>;
  permission?: Maybe<Permission>;
  uuid?: Maybe<Scalars['String']['output']>;
}

export interface ZabbixGroupRightInput {
  /**
   * name may optionally be specified for documentation purpose,
   * but the master for setting the user right is the uuid.
   * If a uuid is found and the corresponding group
   * has a deviating name this will be documented within a message
   * with errorcode = 0 (OK) but the permission will be set (
   * the reason is that names for groups may deviate between several
   * instances of the control center although the semantic is the same -
   * while the semantic is identified by uuid.
   */
  name?: InputMaybe<Scalars['String']['input']>;
  permission?: InputMaybe<Permission>;
  uuid?: InputMaybe<Scalars['String']['input']>;
}

export interface ZabbixHost extends Host {
  __typename?: 'ZabbixHost';
  /**
   * Specifies the type or category of the device. Used to define the classification
   * of a device in the system (capabilities, functionalities, or purpose).
   */
  deviceType?: Maybe<Scalars['String']['output']>;
  host: Scalars['String']['output'];
  hostgroups?: Maybe<Array<HostGroup>>;
  hostid: Scalars['ID']['output'];
  inventory?: Maybe<Inventory>;
  items?: Maybe<Array<ZabbixItem>>;
  name?: Maybe<Scalars['String']['output']>;
  parentTemplates?: Maybe<Array<Template>>;
  tags?: Maybe<Scalars['JSONObject']['output']>;
}

export interface ZabbixItem {
  __typename?: 'ZabbixItem';
  attributeName?: Maybe<Scalars['String']['output']>;
  hostid?: Maybe<Scalars['Int']['output']>;
  hosts?: Maybe<Array<Host>>;
  itemid: Scalars['Int']['output'];
  key_: Scalars['String']['output'];
  lastclock?: Maybe<Scalars['Int']['output']>;
  lastvalue?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  status?: Maybe<DeviceStatus>;
  type?: Maybe<DeviceCommunicationType>;
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
  Device: ( GenericDevice );
  DeviceState: ( GenericDeviceState );
  DeviceValue: never;
  DeviceValueMessage: never;
  Error: ( ApiError );
  GpsPosition: ( Location );
  Host: ( GenericDevice ) | ( Omit<ZabbixHost, 'items'> & { items?: Maybe<Array<_RefType['ZabbixItem']>> } );
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
  GenericDevice: ResolverTypeWrapper<GenericDevice>;
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
  SortOrder: SortOrder;
  StorageItemType: StorageItemType;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  Template: ResolverTypeWrapper<Template>;
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
  ZabbixHost: ResolverTypeWrapper<Omit<ZabbixHost, 'items'> & { items?: Maybe<Array<ResolversTypes['ZabbixItem']>> }>;
  ZabbixItem: ResolverTypeWrapper<Omit<ZabbixItem, 'hosts'> & { hosts?: Maybe<Array<ResolversTypes['Host']>> }>;
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
  GenericDevice: GenericDevice;
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
  String: Scalars['String']['output'];
  Template: Template;
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
  ZabbixHost: Omit<ZabbixHost, 'items'> & { items?: Maybe<Array<ResolversParentTypes['ZabbixItem']>> };
  ZabbixItem: Omit<ZabbixItem, 'hosts'> & { hosts?: Maybe<Array<ResolversParentTypes['Host']>> };
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
  createHost?: Resolver<Maybe<ResolversTypes['CreateHostResponse']>, ParentType, ContextType, RequireFields<MutationCreateHostArgs, 'host' | 'hostgroupids' | 'templateids'>>;
  deleteTemplateGroups?: Resolver<Maybe<Array<ResolversTypes['DeleteResponse']>>, ParentType, ContextType, Partial<MutationDeleteTemplateGroupsArgs>>;
  deleteTemplates?: Resolver<Maybe<Array<ResolversTypes['DeleteResponse']>>, ParentType, ContextType, Partial<MutationDeleteTemplatesArgs>>;
  importHostGroups?: Resolver<Maybe<Array<ResolversTypes['CreateHostGroupResponse']>>, ParentType, ContextType, RequireFields<MutationImportHostGroupsArgs, 'hostGroups'>>;
  importHosts?: Resolver<Maybe<Array<ResolversTypes['ImportHostResponse']>>, ParentType, ContextType, RequireFields<MutationImportHostsArgs, 'hosts'>>;
  importTemplateGroups?: Resolver<Maybe<Array<ResolversTypes['CreateTemplateGroupResponse']>>, ParentType, ContextType, RequireFields<MutationImportTemplateGroupsArgs, 'templateGroups'>>;
  importTemplates?: Resolver<Maybe<Array<ResolversTypes['ImportTemplateResponse']>>, ParentType, ContextType, RequireFields<MutationImportTemplatesArgs, 'templates'>>;
  importUserRights?: Resolver<Maybe<ResolversTypes['ImportUserRightsResult']>, ParentType, ContextType, RequireFields<MutationImportUserRightsArgs, 'dryRun' | 'input'>>;
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

export type StorageItemTypeResolvers = EnumResolverSignature<{ FLOAT?: any, INT?: any, TEXT?: any }, ResolversTypes['StorageItemType']>;

export type TemplateResolvers<ContextType = any, ParentType extends ResolversParentTypes['Template'] = ResolversParentTypes['Template']> = {
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
  hostid?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  hosts?: Resolver<Maybe<Array<ResolversTypes['Host']>>, ParentType, ContextType>;
  itemid?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  key_?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  lastclock?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  lastvalue?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  status?: Resolver<Maybe<ResolversTypes['DeviceStatus']>, ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['DeviceCommunicationType']>, ParentType, ContextType>;
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

