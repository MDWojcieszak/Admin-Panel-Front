# BlogCategoriesApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**categoryControllerCreate**](#categorycontrollercreate) | **POST** /blog/categories | |
|[**categoryControllerDelete**](#categorycontrollerdelete) | **DELETE** /blog/categories/{id} | |
|[**categoryControllerGetById**](#categorycontrollergetbyid) | **GET** /blog/categories/{id} | |
|[**categoryControllerList**](#categorycontrollerlist) | **GET** /blog/categories | |
|[**categoryControllerListPublic**](#categorycontrollerlistpublic) | **GET** /blog/categories/public | |
|[**categoryControllerPatch**](#categorycontrollerpatch) | **PATCH** /blog/categories/{id} | |
|[**categoryControllerUpsertTranslation**](#categorycontrollerupserttranslation) | **PUT** /blog/categories/{id}/translations/{locale} | |

# **categoryControllerCreate**
> CategoryResponse categoryControllerCreate(createBlogCategoryDto)


### Example

```typescript
import {
    BlogCategoriesApi,
    Configuration,
    CreateBlogCategoryDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogCategoriesApi(configuration);

let createBlogCategoryDto: CreateBlogCategoryDto; //

const { status, data } = await apiInstance.categoryControllerCreate(
    createBlogCategoryDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createBlogCategoryDto** | **CreateBlogCategoryDto**|  | |


### Return type

**CategoryResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Created category |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **categoryControllerDelete**
> CategoryResponse categoryControllerDelete()


### Example

```typescript
import {
    BlogCategoriesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogCategoriesApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.categoryControllerDelete(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**CategoryResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Deleted category |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **categoryControllerGetById**
> CategoryResponse categoryControllerGetById()


### Example

```typescript
import {
    BlogCategoriesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogCategoriesApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.categoryControllerGetById(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**CategoryResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Category detail |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **categoryControllerList**
> CategoryListResponse categoryControllerList()


### Example

```typescript
import {
    BlogCategoriesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogCategoriesApi(configuration);

let kind: CategoryKind; // (optional) (default to undefined)
let view: CategoryListView; //ADMIN (default, all locales) or RESOLVED (single label per locale). (optional) (default to undefined)
let locale: string; //Locale used when view=RESOLVED. (optional) (default to undefined)

const { status, data } = await apiInstance.categoryControllerList(
    kind,
    view,
    locale
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **kind** | **CategoryKind** |  | (optional) defaults to undefined|
| **view** | **CategoryListView** | ADMIN (default, all locales) or RESOLVED (single label per locale). | (optional) defaults to undefined|
| **locale** | [**string**] | Locale used when view&#x3D;RESOLVED. | (optional) defaults to undefined|


### Return type

**CategoryListResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | List categories |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **categoryControllerListPublic**
> ResolvedCategoryListResponse categoryControllerListPublic()


### Example

```typescript
import {
    BlogCategoriesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogCategoriesApi(configuration);

let kind: CategoryKind; //Filter by kind: POST (post chips) or ATTRACTION (POI). (optional) (default to undefined)
let locale: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.categoryControllerListPublic(
    kind,
    locale
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **kind** | **CategoryKind** | Filter by kind: POST (post chips) or ATTRACTION (POI). | (optional) defaults to undefined|
| **locale** | [**string**] |  | (optional) defaults to undefined|


### Return type

**ResolvedCategoryListResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Public category catalog (locale-resolved id → key + label) |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **categoryControllerPatch**
> CategoryResponse categoryControllerPatch(patchBlogCategoryDto)


### Example

```typescript
import {
    BlogCategoriesApi,
    Configuration,
    PatchBlogCategoryDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogCategoriesApi(configuration);

let id: string; // (default to undefined)
let patchBlogCategoryDto: PatchBlogCategoryDto; //

const { status, data } = await apiInstance.categoryControllerPatch(
    id,
    patchBlogCategoryDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **patchBlogCategoryDto** | **PatchBlogCategoryDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**CategoryResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Patched category |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **categoryControllerUpsertTranslation**
> CategoryResponse categoryControllerUpsertTranslation(upsertCategoryTranslationDto)


### Example

```typescript
import {
    BlogCategoriesApi,
    Configuration,
    UpsertCategoryTranslationDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogCategoriesApi(configuration);

let id: string; // (default to undefined)
let locale: string; // (default to undefined)
let upsertCategoryTranslationDto: UpsertCategoryTranslationDto; //

const { status, data } = await apiInstance.categoryControllerUpsertTranslation(
    id,
    locale,
    upsertCategoryTranslationDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **upsertCategoryTranslationDto** | **UpsertCategoryTranslationDto**|  | |
| **id** | [**string**] |  | defaults to undefined|
| **locale** | [**string**] |  | defaults to undefined|


### Return type

**CategoryResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Upserted category translation |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

