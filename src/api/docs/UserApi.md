# UserApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**userControllerCreate**](#usercontrollercreate) | **POST** /user/create | |
|[**userControllerGetList**](#usercontrollergetlist) | **GET** /user/list | |
|[**userControllerUpdate**](#usercontrollerupdate) | **PATCH** /user/me | |
|[**userControllerUpdateAdmin**](#usercontrollerupdateadmin) | **PATCH** /user/role | |

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

