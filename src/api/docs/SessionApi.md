# SessionApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**sessionControllerGetAll**](#sessioncontrollergetall) | **GET** /session/all | |
|[**sessionControllerGetAllForUser**](#sessioncontrollergetallforuser) | **GET** /session/my | |
|[**sessionControllerGetAllForUserByAdmin**](#sessioncontrollergetallforuserbyadmin) | **GET** /session/user/{userId} | |
|[**sessionControllerGetCurrent**](#sessioncontrollergetcurrent) | **GET** /session/current | |
|[**sessionControllerRemoveSession**](#sessioncontrollerremovesession) | **POST** /session/logout | |

# **sessionControllerGetAll**
> SessionListResponseDto sessionControllerGetAll()


### Example

```typescript
import {
    SessionApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SessionApi(configuration);

let take: number; // (default to undefined)
let skip: number; // (optional) (default to 0)

const { status, data } = await apiInstance.sessionControllerGetAll(
    take,
    skip
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **take** | [**number**] |  | defaults to undefined|
| **skip** | [**number**] |  | (optional) defaults to 0|


### Return type

**SessionListResponseDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | List of all sessions |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **sessionControllerGetAllForUser**
> SessionListResponseDto sessionControllerGetAllForUser()


### Example

```typescript
import {
    SessionApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SessionApi(configuration);

let take: number; // (default to undefined)
let skip: number; // (optional) (default to 0)

const { status, data } = await apiInstance.sessionControllerGetAllForUser(
    take,
    skip
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **take** | [**number**] |  | defaults to undefined|
| **skip** | [**number**] |  | (optional) defaults to 0|


### Return type

**SessionListResponseDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | List of all sessions for the current user |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **sessionControllerGetAllForUserByAdmin**
> SessionListResponseDto sessionControllerGetAllForUserByAdmin()


### Example

```typescript
import {
    SessionApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SessionApi(configuration);

let userId: string; // (default to undefined)
let take: number; // (default to undefined)
let skip: number; // (optional) (default to 0)

const { status, data } = await apiInstance.sessionControllerGetAllForUserByAdmin(
    userId,
    take,
    skip
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **userId** | [**string**] |  | defaults to undefined|
| **take** | [**number**] |  | defaults to undefined|
| **skip** | [**number**] |  | (optional) defaults to 0|


### Return type

**SessionListResponseDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | List of all sessions for a specific user |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **sessionControllerGetCurrent**
> SessionResponseDto sessionControllerGetCurrent()


### Example

```typescript
import {
    SessionApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SessionApi(configuration);

const { status, data } = await apiInstance.sessionControllerGetCurrent();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**SessionResponseDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Get current session details |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **sessionControllerRemoveSession**
> sessionControllerRemoveSession(sessionDto)


### Example

```typescript
import {
    SessionApi,
    Configuration,
    SessionDto
} from './api';

const configuration = new Configuration();
const apiInstance = new SessionApi(configuration);

let sessionDto: SessionDto; //

const { status, data } = await apiInstance.sessionControllerRemoveSession(
    sessionDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **sessionDto** | **SessionDto**|  | |


### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Session deleted |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

