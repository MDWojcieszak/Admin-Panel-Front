# BlogPostsApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**postControllerCreate**](#postcontrollercreate) | **POST** /blog/posts | |
|[**postControllerGetById**](#postcontrollergetbyid) | **GET** /blog/posts/{id} | |
|[**postControllerGetDraft**](#postcontrollergetdraft) | **GET** /blog/posts/{id}/draft | |
|[**postControllerGetDraftCategories**](#postcontrollergetdraftcategories) | **GET** /blog/posts/{id}/categories/draft | |
|[**postControllerGetPublic**](#postcontrollergetpublic) | **GET** /blog/posts/public/{slug} | |
|[**postControllerList**](#postcontrollerlist) | **GET** /blog/posts | |
|[**postControllerListPublic**](#postcontrollerlistpublic) | **GET** /blog/posts/public | |
|[**postControllerPatch**](#postcontrollerpatch) | **PATCH** /blog/posts/{id} | |
|[**postControllerReorder**](#postcontrollerreorder) | **PATCH** /blog/posts/reorder | |
|[**postControllerSetAuthors**](#postcontrollersetauthors) | **PUT** /blog/posts/{id}/authors | |
|[**postControllerSetCategories**](#postcontrollersetcategories) | **PUT** /blog/posts/{id}/categories | |
|[**postControllerUpsertTranslation**](#postcontrollerupserttranslation) | **PUT** /blog/posts/{id}/translations/{locale} | |

# **postControllerCreate**
> PostResponse postControllerCreate(createPostDto)


### Example

```typescript
import {
    BlogPostsApi,
    Configuration,
    CreatePostDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogPostsApi(configuration);

let createPostDto: CreatePostDto; //

const { status, data } = await apiInstance.postControllerCreate(
    createPostDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createPostDto** | **CreatePostDto**|  | |


### Return type

**PostResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Created post |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **postControllerGetById**
> PostResponse postControllerGetById()


### Example

```typescript
import {
    BlogPostsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogPostsApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.postControllerGetById(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**PostResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Post summary |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **postControllerGetDraft**
> PostDraftResponse postControllerGetDraft()


### Example

```typescript
import {
    BlogPostsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogPostsApi(configuration);

let id: string; // (default to undefined)
let locale: string; // (default to undefined)

const { status, data } = await apiInstance.postControllerGetDraft(
    id,
    locale
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|
| **locale** | [**string**] |  | defaults to undefined|


### Return type

**PostDraftResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Full draft version resolved to a locale (staff preview) |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **postControllerGetDraftCategories**
> PostCategoriesResponse postControllerGetDraftCategories()


### Example

```typescript
import {
    BlogPostsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogPostsApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.postControllerGetDraftCategories(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**PostCategoriesResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Editable draft post categories |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **postControllerGetPublic**
> PublicPostResponse postControllerGetPublic()


### Example

```typescript
import {
    BlogPostsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogPostsApi(configuration);

let slug: string; // (default to undefined)
let locale: string; // (default to undefined)

const { status, data } = await apiInstance.postControllerGetPublic(
    slug,
    locale
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **slug** | [**string**] |  | defaults to undefined|
| **locale** | [**string**] |  | defaults to undefined|


### Return type

**PublicPostResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Public post read (paywall-gated) |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **postControllerList**
> PostListResponse postControllerList()


### Example

```typescript
import {
    BlogPostsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogPostsApi(configuration);

let take: number; // (optional) (default to undefined)
let skip: number; // (optional) (default to 0)
let status: BlogPostStatus; // (optional) (default to undefined)
let search: string; //Filter by slug (contains, case-insensitive). (optional) (default to undefined)

const { status, data } = await apiInstance.postControllerList(
    take,
    skip,
    status,
    search
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **take** | [**number**] |  | (optional) defaults to undefined|
| **skip** | [**number**] |  | (optional) defaults to 0|
| **status** | **BlogPostStatus** |  | (optional) defaults to undefined|
| **search** | [**string**] | Filter by slug (contains, case-insensitive). | (optional) defaults to undefined|


### Return type

**PostListResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | List posts |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **postControllerListPublic**
> PublicPostListResponse postControllerListPublic()


### Example

```typescript
import {
    BlogPostsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogPostsApi(configuration);

let take: number; // (optional) (default to undefined)
let skip: number; // (optional) (default to 0)
let locale: string; // (optional) (default to undefined)
let category: string; //Category id or key. (optional) (default to undefined)
let region: string; // (optional) (default to undefined)
let country: string; //Country (language-neutral). (optional) (default to undefined)
let series: string; //Series slug or id. (optional) (default to undefined)

const { status, data } = await apiInstance.postControllerListPublic(
    take,
    skip,
    locale,
    category,
    region,
    country,
    series
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **take** | [**number**] |  | (optional) defaults to undefined|
| **skip** | [**number**] |  | (optional) defaults to 0|
| **locale** | [**string**] |  | (optional) defaults to undefined|
| **category** | [**string**] | Category id or key. | (optional) defaults to undefined|
| **region** | [**string**] |  | (optional) defaults to undefined|
| **country** | [**string**] | Country (language-neutral). | (optional) defaults to undefined|
| **series** | [**string**] | Series slug or id. | (optional) defaults to undefined|


### Return type

**PublicPostListResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Public post feed |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **postControllerPatch**
> PostResponse postControllerPatch(patchPostDto)


### Example

```typescript
import {
    BlogPostsApi,
    Configuration,
    PatchPostDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogPostsApi(configuration);

let id: string; // (default to undefined)
let patchPostDto: PatchPostDto; //

const { status, data } = await apiInstance.postControllerPatch(
    id,
    patchPostDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **patchPostDto** | **PatchPostDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**PostResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Patched post |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **postControllerReorder**
> PostListResponse postControllerReorder(reorderPostsDto)


### Example

```typescript
import {
    BlogPostsApi,
    Configuration,
    ReorderPostsDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogPostsApi(configuration);

let reorderPostsDto: ReorderPostsDto; //

const { status, data } = await apiInstance.postControllerReorder(
    reorderPostsDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **reorderPostsDto** | **ReorderPostsDto**|  | |


### Return type

**PostListResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Reordered posts |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **postControllerSetAuthors**
> PostResponse postControllerSetAuthors(setPostAuthorsDto)


### Example

```typescript
import {
    BlogPostsApi,
    Configuration,
    SetPostAuthorsDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogPostsApi(configuration);

let id: string; // (default to undefined)
let setPostAuthorsDto: SetPostAuthorsDto; //

const { status, data } = await apiInstance.postControllerSetAuthors(
    id,
    setPostAuthorsDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **setPostAuthorsDto** | **SetPostAuthorsDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**PostResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Set post byline |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **postControllerSetCategories**
> PostCategoriesResponse postControllerSetCategories(setPostCategoriesDto)


### Example

```typescript
import {
    BlogPostsApi,
    Configuration,
    SetPostCategoriesDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogPostsApi(configuration);

let id: string; // (default to undefined)
let setPostCategoriesDto: SetPostCategoriesDto; //

const { status, data } = await apiInstance.postControllerSetCategories(
    id,
    setPostCategoriesDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **setPostCategoriesDto** | **SetPostCategoriesDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**PostCategoriesResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Set draft post categories (SET semantics) |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **postControllerUpsertTranslation**
> PostResponse postControllerUpsertTranslation(upsertPostTranslationDto)


### Example

```typescript
import {
    BlogPostsApi,
    Configuration,
    UpsertPostTranslationDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogPostsApi(configuration);

let id: string; // (default to undefined)
let locale: string; // (default to undefined)
let upsertPostTranslationDto: UpsertPostTranslationDto; //

const { status, data } = await apiInstance.postControllerUpsertTranslation(
    id,
    locale,
    upsertPostTranslationDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **upsertPostTranslationDto** | **UpsertPostTranslationDto**|  | |
| **id** | [**string**] |  | defaults to undefined|
| **locale** | [**string**] |  | defaults to undefined|


### Return type

**PostResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Upserted draft version translation |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

