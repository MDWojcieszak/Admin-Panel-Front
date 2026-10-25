# SharedApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**sharedControllerToggle**](#sharedcontrollertoggle) | **POST** /shared/{token}/tasks/{taskId}/toggle | |
|[**sharedControllerView**](#sharedcontrollerview) | **GET** /shared/{token} | |

# **sharedControllerToggle**
> SharedProjectResponse sharedControllerToggle()


### Example

```typescript
import {
    SharedApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SharedApi(configuration);

let token: string; // (default to undefined)
let taskId: string; // (default to undefined)
let xSharePassword: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.sharedControllerToggle(
    token,
    taskId,
    xSharePassword
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **token** | [**string**] |  | defaults to undefined|
| **taskId** | [**string**] |  | defaults to undefined|
| **xSharePassword** | [**string**] |  | (optional) defaults to undefined|


### Return type

**SharedProjectResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **sharedControllerView**
> SharedProjectResponse sharedControllerView()


### Example

```typescript
import {
    SharedApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SharedApi(configuration);

let token: string; // (default to undefined)
let xSharePassword: string; // (optional) (default to undefined)
let reload: boolean; //A refresh after a live change; not counted as a visit. (optional) (default to undefined)

const { status, data } = await apiInstance.sharedControllerView(
    token,
    xSharePassword,
    reload
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **token** | [**string**] |  | defaults to undefined|
| **xSharePassword** | [**string**] |  | (optional) defaults to undefined|
| **reload** | [**boolean**] | A refresh after a live change; not counted as a visit. | (optional) defaults to undefined|


### Return type

**SharedProjectResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

