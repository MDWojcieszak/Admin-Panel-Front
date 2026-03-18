# AstroObjectApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**astroObjectControllerCreate**](#astroobjectcontrollercreate) | **POST** /astro-object | |
|[**astroObjectControllerGetById**](#astroobjectcontrollergetbyid) | **GET** /astro-object/{id} | |
|[**astroObjectControllerList**](#astroobjectcontrollerlist) | **GET** /astro-object | |
|[**astroObjectControllerPatch**](#astroobjectcontrollerpatch) | **PATCH** /astro-object/{id} | |

# **astroObjectControllerCreate**
> AstroObjectResponse astroObjectControllerCreate(createAstroObjectDto)


### Example

```typescript
import {
    AstroObjectApi,
    Configuration,
    CreateAstroObjectDto
} from './api';

const configuration = new Configuration();
const apiInstance = new AstroObjectApi(configuration);

let createAstroObjectDto: CreateAstroObjectDto; //

const { status, data } = await apiInstance.astroObjectControllerCreate(
    createAstroObjectDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createAstroObjectDto** | **CreateAstroObjectDto**|  | |


### Return type

**AstroObjectResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Created astro object |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **astroObjectControllerGetById**
> AstroObjectDetailsResponse astroObjectControllerGetById()


### Example

```typescript
import {
    AstroObjectApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AstroObjectApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.astroObjectControllerGetById(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**AstroObjectDetailsResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Astro object details |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **astroObjectControllerList**
> AstroObjectListResponse astroObjectControllerList()


### Example

```typescript
import {
    AstroObjectApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AstroObjectApi(configuration);

let search: string; // (optional) (default to undefined)
let take: number; // (optional) (default to undefined)
let skip: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.astroObjectControllerList(
    search,
    take,
    skip
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **search** | [**string**] |  | (optional) defaults to undefined|
| **take** | [**number**] |  | (optional) defaults to undefined|
| **skip** | [**number**] |  | (optional) defaults to undefined|


### Return type

**AstroObjectListResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | List astro objects |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **astroObjectControllerPatch**
> AstroObjectResponse astroObjectControllerPatch(patchAstroObjectDto)


### Example

```typescript
import {
    AstroObjectApi,
    Configuration,
    PatchAstroObjectDto
} from './api';

const configuration = new Configuration();
const apiInstance = new AstroObjectApi(configuration);

let id: string; // (default to undefined)
let patchAstroObjectDto: PatchAstroObjectDto; //

const { status, data } = await apiInstance.astroObjectControllerPatch(
    id,
    patchAstroObjectDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **patchAstroObjectDto** | **PatchAstroObjectDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**AstroObjectResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Patched astro object |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

