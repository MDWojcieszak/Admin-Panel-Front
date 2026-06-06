# ACLApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**aclControllerCreateGroup**](#aclcontrollercreategroup) | **POST** /acl/groups | |
|[**aclControllerDeleteGroup**](#aclcontrollerdeletegroup) | **DELETE** /acl/groups/{id} | |
|[**aclControllerGetCatalog**](#aclcontrollergetcatalog) | **GET** /acl/permissions | |
|[**aclControllerGetGroup**](#aclcontrollergetgroup) | **GET** /acl/groups/{id} | |
|[**aclControllerGetMyPermissions**](#aclcontrollergetmypermissions) | **GET** /acl/me | |
|[**aclControllerGetUserGroups**](#aclcontrollergetusergroups) | **GET** /acl/users/{userId}/groups | |
|[**aclControllerListGroups**](#aclcontrollerlistgroups) | **GET** /acl/groups | |
|[**aclControllerSetUserGroups**](#aclcontrollersetusergroups) | **PUT** /acl/users/{userId}/groups | |
|[**aclControllerUpdateGroup**](#aclcontrollerupdategroup) | **PATCH** /acl/groups/{id} | |

# **aclControllerCreateGroup**
> PermissionGroupResponseDto aclControllerCreateGroup(createPermissionGroupDto)


### Example

```typescript
import {
    ACLApi,
    Configuration,
    CreatePermissionGroupDto
} from './api';

const configuration = new Configuration();
const apiInstance = new ACLApi(configuration);

let createPermissionGroupDto: CreatePermissionGroupDto; //

const { status, data } = await apiInstance.aclControllerCreateGroup(
    createPermissionGroupDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createPermissionGroupDto** | **CreatePermissionGroupDto**|  | |


### Return type

**PermissionGroupResponseDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **aclControllerDeleteGroup**
> aclControllerDeleteGroup()


### Example

```typescript
import {
    ACLApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ACLApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.aclControllerDeleteGroup(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Group deleted |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **aclControllerGetCatalog**
> PermissionCatalogResponseDto aclControllerGetCatalog()


### Example

```typescript
import {
    ACLApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ACLApi(configuration);

const { status, data } = await apiInstance.aclControllerGetCatalog();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**PermissionCatalogResponseDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **aclControllerGetGroup**
> PermissionGroupResponseDto aclControllerGetGroup()


### Example

```typescript
import {
    ACLApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ACLApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.aclControllerGetGroup(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**PermissionGroupResponseDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **aclControllerGetMyPermissions**
> MyPermissionsResponseDto aclControllerGetMyPermissions()


### Example

```typescript
import {
    ACLApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ACLApi(configuration);

const { status, data } = await apiInstance.aclControllerGetMyPermissions();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**MyPermissionsResponseDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **aclControllerGetUserGroups**
> PermissionGroupListResponseDto aclControllerGetUserGroups()


### Example

```typescript
import {
    ACLApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ACLApi(configuration);

let userId: string; // (default to undefined)

const { status, data } = await apiInstance.aclControllerGetUserGroups(
    userId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **userId** | [**string**] |  | defaults to undefined|


### Return type

**PermissionGroupListResponseDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **aclControllerListGroups**
> PermissionGroupListResponseDto aclControllerListGroups()


### Example

```typescript
import {
    ACLApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ACLApi(configuration);

const { status, data } = await apiInstance.aclControllerListGroups();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**PermissionGroupListResponseDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **aclControllerSetUserGroups**
> PermissionGroupListResponseDto aclControllerSetUserGroups(setUserGroupsDto)


### Example

```typescript
import {
    ACLApi,
    Configuration,
    SetUserGroupsDto
} from './api';

const configuration = new Configuration();
const apiInstance = new ACLApi(configuration);

let userId: string; // (default to undefined)
let setUserGroupsDto: SetUserGroupsDto; //

const { status, data } = await apiInstance.aclControllerSetUserGroups(
    userId,
    setUserGroupsDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **setUserGroupsDto** | **SetUserGroupsDto**|  | |
| **userId** | [**string**] |  | defaults to undefined|


### Return type

**PermissionGroupListResponseDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **aclControllerUpdateGroup**
> PermissionGroupResponseDto aclControllerUpdateGroup(updatePermissionGroupDto)


### Example

```typescript
import {
    ACLApi,
    Configuration,
    UpdatePermissionGroupDto
} from './api';

const configuration = new Configuration();
const apiInstance = new ACLApi(configuration);

let id: string; // (default to undefined)
let updatePermissionGroupDto: UpdatePermissionGroupDto; //

const { status, data } = await apiInstance.aclControllerUpdateGroup(
    id,
    updatePermissionGroupDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updatePermissionGroupDto** | **UpdatePermissionGroupDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**PermissionGroupResponseDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

