# UserApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**userControllerCreate**](#usercontrollercreate) | **POST** /user/create | |
|[**userControllerDelete**](#usercontrollerdelete) | **DELETE** /user/{id} | |
|[**userControllerGetList**](#usercontrollergetlist) | **GET** /user/list | |
|[**userControllerGetSettings**](#usercontrollergetsettings) | **GET** /user/settings | |
|[**userControllerUpdate**](#usercontrollerupdate) | **PATCH** /user/me | |
|[**userControllerUpdateAdmin**](#usercontrollerupdateadmin) | **PATCH** /user/role | |
|[**userControllerUpdateSettings**](#usercontrollerupdatesettings) | **PATCH** /user/settings | |

# **userControllerCreate**
> UserResponseDto userControllerCreate(userDto)


### Example

```typescript
import {
    UserApi,
    Configuration,
    UserDto
} from './api';

const configuration = new Configuration();
const apiInstance = new UserApi(configuration);

let userDto: UserDto; //

const { status, data } = await apiInstance.userControllerCreate(
    userDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **userDto** | **UserDto**|  | |


### Return type

**UserResponseDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | User created |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **userControllerDelete**
> UserResponseDto userControllerDelete()


### Example

```typescript
import {
    UserApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UserApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.userControllerDelete(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**UserResponseDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | User soft-deleted (account disabled, sessions revoked) |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **userControllerGetList**
> UserListResponseDto userControllerGetList()


### Example

```typescript
import {
    UserApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UserApi(configuration);

let take: number; // (optional) (default to undefined)
let skip: number; // (optional) (default to 0)

const { status, data } = await apiInstance.userControllerGetList(
    take,
    skip
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **take** | [**number**] |  | (optional) defaults to undefined|
| **skip** | [**number**] |  | (optional) defaults to 0|


### Return type

**UserListResponseDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | List of users with pagination |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **userControllerGetSettings**
> UserSettingsResponseDto userControllerGetSettings()


### Example

```typescript
import {
    UserApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UserApi(configuration);

const { status, data } = await apiInstance.userControllerGetSettings();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**UserSettingsResponseDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Current user settings |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **userControllerUpdate**
> UserResponseDto userControllerUpdate()


### Example

```typescript
import {
    UserApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new UserApi(configuration);

const { status, data } = await apiInstance.userControllerUpdate();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**UserResponseDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | User updated |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **userControllerUpdateAdmin**
> UserResponseDto userControllerUpdateAdmin(patchUserAdminDto)


### Example

```typescript
import {
    UserApi,
    Configuration,
    PatchUserAdminDto
} from './api';

const configuration = new Configuration();
const apiInstance = new UserApi(configuration);

let id: string; // (default to undefined)
let patchUserAdminDto: PatchUserAdminDto; //

const { status, data } = await apiInstance.userControllerUpdateAdmin(
    id,
    patchUserAdminDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **patchUserAdminDto** | **PatchUserAdminDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**UserResponseDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | User updated |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **userControllerUpdateSettings**
> UserSettingsResponseDto userControllerUpdateSettings(patchUserSettingsDto)


### Example

```typescript
import {
    UserApi,
    Configuration,
    PatchUserSettingsDto
} from './api';

const configuration = new Configuration();
const apiInstance = new UserApi(configuration);

let patchUserSettingsDto: PatchUserSettingsDto; //

const { status, data } = await apiInstance.userControllerUpdateSettings(
    patchUserSettingsDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **patchUserSettingsDto** | **PatchUserSettingsDto**|  | |


### Return type

**UserSettingsResponseDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | User settings updated |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

