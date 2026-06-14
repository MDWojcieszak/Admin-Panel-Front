# BlogCountriesAdminApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**countryControllerCreate**](#countrycontrollercreate) | **POST** /blog/countries/manage | |
|[**countryControllerDelete**](#countrycontrollerdelete) | **DELETE** /blog/countries/manage/{id} | |
|[**countryControllerGetById**](#countrycontrollergetbyid) | **GET** /blog/countries/manage/{id} | |
|[**countryControllerList**](#countrycontrollerlist) | **GET** /blog/countries/manage | |
|[**countryControllerPatch**](#countrycontrollerpatch) | **PATCH** /blog/countries/manage/{id} | |
|[**countryControllerUpsertTranslation**](#countrycontrollerupserttranslation) | **PUT** /blog/countries/manage/{id}/translations/{locale} | |

# **countryControllerCreate**
> BlogCountryAdminResponse countryControllerCreate(createBlogCountryDto)


### Example

```typescript
import {
    BlogCountriesAdminApi,
    Configuration,
    CreateBlogCountryDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogCountriesAdminApi(configuration);

let createBlogCountryDto: CreateBlogCountryDto; //

const { status, data } = await apiInstance.countryControllerCreate(
    createBlogCountryDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createBlogCountryDto** | **CreateBlogCountryDto**|  | |


### Return type

**BlogCountryAdminResponse**

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

# **countryControllerDelete**
> BlogCountryAdminResponse countryControllerDelete()


### Example

```typescript
import {
    BlogCountriesAdminApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogCountriesAdminApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.countryControllerDelete(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**BlogCountryAdminResponse**

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

# **countryControllerGetById**
> BlogCountryAdminResponse countryControllerGetById()


### Example

```typescript
import {
    BlogCountriesAdminApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogCountriesAdminApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.countryControllerGetById(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**BlogCountryAdminResponse**

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

# **countryControllerList**
> BlogCountryListResponse countryControllerList()


### Example

```typescript
import {
    BlogCountriesAdminApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogCountriesAdminApi(configuration);

const { status, data } = await apiInstance.countryControllerList();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**BlogCountryListResponse**

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

# **countryControllerPatch**
> BlogCountryAdminResponse countryControllerPatch(patchBlogCountryDto)


### Example

```typescript
import {
    BlogCountriesAdminApi,
    Configuration,
    PatchBlogCountryDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogCountriesAdminApi(configuration);

let id: string; // (default to undefined)
let patchBlogCountryDto: PatchBlogCountryDto; //

const { status, data } = await apiInstance.countryControllerPatch(
    id,
    patchBlogCountryDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **patchBlogCountryDto** | **PatchBlogCountryDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**BlogCountryAdminResponse**

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

# **countryControllerUpsertTranslation**
> BlogCountryAdminResponse countryControllerUpsertTranslation(upsertCountryTranslationDto)


### Example

```typescript
import {
    BlogCountriesAdminApi,
    Configuration,
    UpsertCountryTranslationDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogCountriesAdminApi(configuration);

let id: string; // (default to undefined)
let locale: string; // (default to undefined)
let upsertCountryTranslationDto: UpsertCountryTranslationDto; //

const { status, data } = await apiInstance.countryControllerUpsertTranslation(
    id,
    locale,
    upsertCountryTranslationDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **upsertCountryTranslationDto** | **UpsertCountryTranslationDto**|  | |
| **id** | [**string**] |  | defaults to undefined|
| **locale** | [**string**] |  | defaults to undefined|


### Return type

**BlogCountryAdminResponse**

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

