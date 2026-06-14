# BlogCollectionsApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**collectionControllerAddItem**](#collectioncontrolleradditem) | **POST** /blog/collections/{id}/items | |
|[**collectionControllerCreate**](#collectioncontrollercreate) | **POST** /blog/collections | |
|[**collectionControllerDelete**](#collectioncontrollerdelete) | **DELETE** /blog/collections/{id} | |
|[**collectionControllerDeleteItem**](#collectioncontrollerdeleteitem) | **DELETE** /blog/collections/{id}/items/{itemId} | |
|[**collectionControllerGetById**](#collectioncontrollergetbyid) | **GET** /blog/collections/{id} | |
|[**collectionControllerGetPublic**](#collectioncontrollergetpublic) | **GET** /blog/collections/by-slug/{slug} | |
|[**collectionControllerList**](#collectioncontrollerlist) | **GET** /blog/collections | |
|[**collectionControllerListPublic**](#collectioncontrollerlistpublic) | **GET** /blog/collections/public | |
|[**collectionControllerPatch**](#collectioncontrollerpatch) | **PATCH** /blog/collections/{id} | |
|[**collectionControllerPatchItem**](#collectioncontrollerpatchitem) | **PATCH** /blog/collections/{id}/items/{itemId} | |
|[**collectionControllerReorderItems**](#collectioncontrollerreorderitems) | **PATCH** /blog/collections/{id}/items/reorder | |
|[**collectionControllerUpsertTranslation**](#collectioncontrollerupserttranslation) | **PUT** /blog/collections/{id}/translations/{locale} | |

# **collectionControllerAddItem**
> CollectionResponse collectionControllerAddItem(addCollectionItemDto)


### Example

```typescript
import {
    BlogCollectionsApi,
    Configuration,
    AddCollectionItemDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogCollectionsApi(configuration);

let id: string; // (default to undefined)
let addCollectionItemDto: AddCollectionItemDto; //

const { status, data } = await apiInstance.collectionControllerAddItem(
    id,
    addCollectionItemDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **addCollectionItemDto** | **AddCollectionItemDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**CollectionResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Added collection item |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **collectionControllerCreate**
> CollectionResponse collectionControllerCreate(createCollectionDto)


### Example

```typescript
import {
    BlogCollectionsApi,
    Configuration,
    CreateCollectionDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogCollectionsApi(configuration);

let createCollectionDto: CreateCollectionDto; //

const { status, data } = await apiInstance.collectionControllerCreate(
    createCollectionDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createCollectionDto** | **CreateCollectionDto**|  | |


### Return type

**CollectionResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Created collection |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **collectionControllerDelete**
> CollectionResponse collectionControllerDelete()


### Example

```typescript
import {
    BlogCollectionsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogCollectionsApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.collectionControllerDelete(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**CollectionResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Deleted collection |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **collectionControllerDeleteItem**
> CollectionResponse collectionControllerDeleteItem()


### Example

```typescript
import {
    BlogCollectionsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogCollectionsApi(configuration);

let id: string; // (default to undefined)
let itemId: string; // (default to undefined)

const { status, data } = await apiInstance.collectionControllerDeleteItem(
    id,
    itemId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|
| **itemId** | [**string**] |  | defaults to undefined|


### Return type

**CollectionResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Removed collection item |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **collectionControllerGetById**
> CollectionResponse collectionControllerGetById()


### Example

```typescript
import {
    BlogCollectionsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogCollectionsApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.collectionControllerGetById(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**CollectionResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Admin collection detail |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **collectionControllerGetPublic**
> PublicCollectionResponse collectionControllerGetPublic()


### Example

```typescript
import {
    BlogCollectionsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogCollectionsApi(configuration);

let slug: string; // (default to undefined)
let locale: string; // (default to undefined)

const { status, data } = await apiInstance.collectionControllerGetPublic(
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

**PublicCollectionResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Public ranked collection |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **collectionControllerList**
> CollectionListResponse collectionControllerList()


### Example

```typescript
import {
    BlogCollectionsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogCollectionsApi(configuration);

let take: number; // (optional) (default to undefined)
let skip: number; // (optional) (default to 0)
let isPublic: boolean; // (optional) (default to undefined)
let country: string; //Country slug filter. (optional) (default to undefined)
let region: string; // (optional) (default to undefined)
let search: string; //Slug contains (case-insensitive). (optional) (default to undefined)

const { status, data } = await apiInstance.collectionControllerList(
    take,
    skip,
    isPublic,
    country,
    region,
    search
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **take** | [**number**] |  | (optional) defaults to undefined|
| **skip** | [**number**] |  | (optional) defaults to 0|
| **isPublic** | [**boolean**] |  | (optional) defaults to undefined|
| **country** | [**string**] | Country slug filter. | (optional) defaults to undefined|
| **region** | [**string**] |  | (optional) defaults to undefined|
| **search** | [**string**] | Slug contains (case-insensitive). | (optional) defaults to undefined|


### Return type

**CollectionListResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Admin collection list |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **collectionControllerListPublic**
> PublicCollectionListResponse collectionControllerListPublic()


### Example

```typescript
import {
    BlogCollectionsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogCollectionsApi(configuration);

let country: string; //Country slug filter. (optional) (default to undefined)
let region: string; //Region scope filter. (optional) (default to undefined)
let locale: string; // (optional) (default to undefined)
let take: number; // (optional) (default to undefined)
let skip: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.collectionControllerListPublic(
    country,
    region,
    locale,
    take,
    skip
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **country** | [**string**] | Country slug filter. | (optional) defaults to undefined|
| **region** | [**string**] | Region scope filter. | (optional) defaults to undefined|
| **locale** | [**string**] |  | (optional) defaults to undefined|
| **take** | [**number**] |  | (optional) defaults to undefined|
| **skip** | [**number**] |  | (optional) defaults to undefined|


### Return type

**PublicCollectionListResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Public collection list (filter by country slug / region) |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **collectionControllerPatch**
> CollectionResponse collectionControllerPatch(patchCollectionDto)


### Example

```typescript
import {
    BlogCollectionsApi,
    Configuration,
    PatchCollectionDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogCollectionsApi(configuration);

let id: string; // (default to undefined)
let patchCollectionDto: PatchCollectionDto; //

const { status, data } = await apiInstance.collectionControllerPatch(
    id,
    patchCollectionDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **patchCollectionDto** | **PatchCollectionDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**CollectionResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Patched collection |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **collectionControllerPatchItem**
> CollectionResponse collectionControllerPatchItem(patchCollectionItemDto)


### Example

```typescript
import {
    BlogCollectionsApi,
    Configuration,
    PatchCollectionItemDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogCollectionsApi(configuration);

let id: string; // (default to undefined)
let itemId: string; // (default to undefined)
let patchCollectionItemDto: PatchCollectionItemDto; //

const { status, data } = await apiInstance.collectionControllerPatchItem(
    id,
    itemId,
    patchCollectionItemDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **patchCollectionItemDto** | **PatchCollectionItemDto**|  | |
| **id** | [**string**] |  | defaults to undefined|
| **itemId** | [**string**] |  | defaults to undefined|


### Return type

**CollectionResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Patched collection item |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **collectionControllerReorderItems**
> CollectionResponse collectionControllerReorderItems(reorderCollectionItemsDto)


### Example

```typescript
import {
    BlogCollectionsApi,
    Configuration,
    ReorderCollectionItemsDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogCollectionsApi(configuration);

let id: string; // (default to undefined)
let reorderCollectionItemsDto: ReorderCollectionItemsDto; //

const { status, data } = await apiInstance.collectionControllerReorderItems(
    id,
    reorderCollectionItemsDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **reorderCollectionItemsDto** | **ReorderCollectionItemsDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**CollectionResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Reordered collection items |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **collectionControllerUpsertTranslation**
> CollectionResponse collectionControllerUpsertTranslation(upsertCollectionTranslationDto)


### Example

```typescript
import {
    BlogCollectionsApi,
    Configuration,
    UpsertCollectionTranslationDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogCollectionsApi(configuration);

let id: string; // (default to undefined)
let locale: string; // (default to undefined)
let upsertCollectionTranslationDto: UpsertCollectionTranslationDto; //

const { status, data } = await apiInstance.collectionControllerUpsertTranslation(
    id,
    locale,
    upsertCollectionTranslationDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **upsertCollectionTranslationDto** | **UpsertCollectionTranslationDto**|  | |
| **id** | [**string**] |  | defaults to undefined|
| **locale** | [**string**] |  | defaults to undefined|


### Return type

**CollectionResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Upserted collection translation |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

