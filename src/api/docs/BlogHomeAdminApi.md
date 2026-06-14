# BlogHomeAdminApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**homeControllerGetConfig**](#homecontrollergetconfig) | **GET** /blog/home/config | |
|[**homeControllerGetPins**](#homecontrollergetpins) | **GET** /blog/home/pins | |
|[**homeControllerPatchConfig**](#homecontrollerpatchconfig) | **PATCH** /blog/home/config | |
|[**homeControllerSetPins**](#homecontrollersetpins) | **PUT** /blog/home/pins | |

# **homeControllerGetConfig**
> HomeConfigResponse homeControllerGetConfig()


### Example

```typescript
import {
    BlogHomeAdminApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogHomeAdminApi(configuration);

const { status, data } = await apiInstance.homeControllerGetConfig();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**HomeConfigResponse**

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

# **homeControllerGetPins**
> HomePinsResponse homeControllerGetPins()


### Example

```typescript
import {
    BlogHomeAdminApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogHomeAdminApi(configuration);

const { status, data } = await apiInstance.homeControllerGetPins();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**HomePinsResponse**

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

# **homeControllerPatchConfig**
> HomeConfigResponse homeControllerPatchConfig(patchHomeConfigDto)


### Example

```typescript
import {
    BlogHomeAdminApi,
    Configuration,
    PatchHomeConfigDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogHomeAdminApi(configuration);

let patchHomeConfigDto: PatchHomeConfigDto; //

const { status, data } = await apiInstance.homeControllerPatchConfig(
    patchHomeConfigDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **patchHomeConfigDto** | **PatchHomeConfigDto**|  | |


### Return type

**HomeConfigResponse**

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

# **homeControllerSetPins**
> HomePinsResponse homeControllerSetPins(setHomePinsDto)


### Example

```typescript
import {
    BlogHomeAdminApi,
    Configuration,
    SetHomePinsDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogHomeAdminApi(configuration);

let setHomePinsDto: SetHomePinsDto; //

const { status, data } = await apiInstance.homeControllerSetPins(
    setHomePinsDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **setHomePinsDto** | **SetHomePinsDto**|  | |


### Return type

**HomePinsResponse**

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

