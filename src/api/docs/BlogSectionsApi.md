# BlogSectionsApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**sectionControllerAddImage**](#sectioncontrolleraddimage) | **POST** /blog/sections/{id}/images | |
|[**sectionControllerAddItem**](#sectioncontrolleradditem) | **POST** /blog/sections/{id}/items | |
|[**sectionControllerAddPoi**](#sectioncontrolleraddpoi) | **POST** /blog/sections/{id}/pois | |
|[**sectionControllerCreate**](#sectioncontrollercreate) | **POST** /blog/posts/{postId}/sections | |
|[**sectionControllerDelete**](#sectioncontrollerdelete) | **DELETE** /blog/sections/{id} | |
|[**sectionControllerDeleteImage**](#sectioncontrollerdeleteimage) | **DELETE** /blog/section-images/{imageId} | |
|[**sectionControllerDeleteItem**](#sectioncontrollerdeleteitem) | **DELETE** /blog/section-items/{itemId} | |
|[**sectionControllerDeletePoi**](#sectioncontrollerdeletepoi) | **DELETE** /blog/section-pois/{poiLinkId} | |
|[**sectionControllerList**](#sectioncontrollerlist) | **GET** /blog/posts/{postId}/sections | |
|[**sectionControllerPatch**](#sectioncontrollerpatch) | **PATCH** /blog/sections/{id} | |
|[**sectionControllerPatchImage**](#sectioncontrollerpatchimage) | **PATCH** /blog/section-images/{imageId} | |
|[**sectionControllerPatchItem**](#sectioncontrollerpatchitem) | **PATCH** /blog/section-items/{itemId} | |
|[**sectionControllerPatchPoi**](#sectioncontrollerpatchpoi) | **PATCH** /blog/section-pois/{poiLinkId} | |
|[**sectionControllerReorder**](#sectioncontrollerreorder) | **PATCH** /blog/posts/{postId}/sections/reorder | |
|[**sectionControllerReorderImages**](#sectioncontrollerreorderimages) | **PATCH** /blog/sections/{id}/images/reorder | |
|[**sectionControllerReorderItems**](#sectioncontrollerreorderitems) | **PATCH** /blog/sections/{id}/items/reorder | |
|[**sectionControllerReorderPois**](#sectioncontrollerreorderpois) | **PATCH** /blog/sections/{id}/pois/reorder | |
|[**sectionControllerUpsertImageTranslation**](#sectioncontrollerupsertimagetranslation) | **PUT** /blog/section-images/{imageId}/translations/{locale} | |
|[**sectionControllerUpsertItemTranslation**](#sectioncontrollerupsertitemtranslation) | **PUT** /blog/section-items/{itemId}/translations/{locale} | |
|[**sectionControllerUpsertTranslation**](#sectioncontrollerupserttranslation) | **PUT** /blog/sections/{id}/translations/{locale} | |

# **sectionControllerAddImage**
> SectionResponse sectionControllerAddImage(addSectionImageDto)


### Example

```typescript
import {
    BlogSectionsApi,
    Configuration,
    AddSectionImageDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogSectionsApi(configuration);

let id: string; // (default to undefined)
let addSectionImageDto: AddSectionImageDto; //

const { status, data } = await apiInstance.sectionControllerAddImage(
    id,
    addSectionImageDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **addSectionImageDto** | **AddSectionImageDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**SectionResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Added section image |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **sectionControllerAddItem**
> SectionResponse sectionControllerAddItem(addSectionListItemDto)


### Example

```typescript
import {
    BlogSectionsApi,
    Configuration,
    AddSectionListItemDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogSectionsApi(configuration);

let id: string; // (default to undefined)
let addSectionListItemDto: AddSectionListItemDto; //

const { status, data } = await apiInstance.sectionControllerAddItem(
    id,
    addSectionListItemDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **addSectionListItemDto** | **AddSectionListItemDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**SectionResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Added list item |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **sectionControllerAddPoi**
> SectionResponse sectionControllerAddPoi(addSectionPoiDto)


### Example

```typescript
import {
    BlogSectionsApi,
    Configuration,
    AddSectionPoiDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogSectionsApi(configuration);

let id: string; // (default to undefined)
let addSectionPoiDto: AddSectionPoiDto; //

const { status, data } = await apiInstance.sectionControllerAddPoi(
    id,
    addSectionPoiDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **addSectionPoiDto** | **AddSectionPoiDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**SectionResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Attached POI to section |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **sectionControllerCreate**
> SectionResponse sectionControllerCreate(createSectionDto)


### Example

```typescript
import {
    BlogSectionsApi,
    Configuration,
    CreateSectionDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogSectionsApi(configuration);

let postId: string; // (default to undefined)
let createSectionDto: CreateSectionDto; //

const { status, data } = await apiInstance.sectionControllerCreate(
    postId,
    createSectionDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createSectionDto** | **CreateSectionDto**|  | |
| **postId** | [**string**] |  | defaults to undefined|


### Return type

**SectionResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Created section |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **sectionControllerDelete**
> SectionResponse sectionControllerDelete()


### Example

```typescript
import {
    BlogSectionsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogSectionsApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.sectionControllerDelete(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**SectionResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Deleted section |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **sectionControllerDeleteImage**
> SectionResponse sectionControllerDeleteImage()


### Example

```typescript
import {
    BlogSectionsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogSectionsApi(configuration);

let imageId: string; // (default to undefined)

const { status, data } = await apiInstance.sectionControllerDeleteImage(
    imageId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **imageId** | [**string**] |  | defaults to undefined|


### Return type

**SectionResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Deleted section image |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **sectionControllerDeleteItem**
> SectionResponse sectionControllerDeleteItem()


### Example

```typescript
import {
    BlogSectionsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogSectionsApi(configuration);

let itemId: string; // (default to undefined)

const { status, data } = await apiInstance.sectionControllerDeleteItem(
    itemId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **itemId** | [**string**] |  | defaults to undefined|


### Return type

**SectionResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Deleted list item |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **sectionControllerDeletePoi**
> SectionResponse sectionControllerDeletePoi()


### Example

```typescript
import {
    BlogSectionsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogSectionsApi(configuration);

let poiLinkId: string; // (default to undefined)

const { status, data } = await apiInstance.sectionControllerDeletePoi(
    poiLinkId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **poiLinkId** | [**string**] |  | defaults to undefined|


### Return type

**SectionResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Detached section POI |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **sectionControllerList**
> SectionListResponse sectionControllerList()


### Example

```typescript
import {
    BlogSectionsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogSectionsApi(configuration);

let postId: string; // (default to undefined)

const { status, data } = await apiInstance.sectionControllerList(
    postId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **postId** | [**string**] |  | defaults to undefined|


### Return type

**SectionListResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | List draft sections |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **sectionControllerPatch**
> SectionResponse sectionControllerPatch(patchSectionDto)


### Example

```typescript
import {
    BlogSectionsApi,
    Configuration,
    PatchSectionDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogSectionsApi(configuration);

let id: string; // (default to undefined)
let patchSectionDto: PatchSectionDto; //

const { status, data } = await apiInstance.sectionControllerPatch(
    id,
    patchSectionDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **patchSectionDto** | **PatchSectionDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**SectionResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Patched section |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **sectionControllerPatchImage**
> SectionResponse sectionControllerPatchImage(patchSectionImageDto)


### Example

```typescript
import {
    BlogSectionsApi,
    Configuration,
    PatchSectionImageDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogSectionsApi(configuration);

let imageId: string; // (default to undefined)
let patchSectionImageDto: PatchSectionImageDto; //

const { status, data } = await apiInstance.sectionControllerPatchImage(
    imageId,
    patchSectionImageDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **patchSectionImageDto** | **PatchSectionImageDto**|  | |
| **imageId** | [**string**] |  | defaults to undefined|


### Return type

**SectionResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Patched section image |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **sectionControllerPatchItem**
> SectionResponse sectionControllerPatchItem(patchSectionListItemDto)


### Example

```typescript
import {
    BlogSectionsApi,
    Configuration,
    PatchSectionListItemDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogSectionsApi(configuration);

let itemId: string; // (default to undefined)
let patchSectionListItemDto: PatchSectionListItemDto; //

const { status, data } = await apiInstance.sectionControllerPatchItem(
    itemId,
    patchSectionListItemDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **patchSectionListItemDto** | **PatchSectionListItemDto**|  | |
| **itemId** | [**string**] |  | defaults to undefined|


### Return type

**SectionResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Patched list item |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **sectionControllerPatchPoi**
> SectionResponse sectionControllerPatchPoi(patchSectionPoiDto)


### Example

```typescript
import {
    BlogSectionsApi,
    Configuration,
    PatchSectionPoiDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogSectionsApi(configuration);

let poiLinkId: string; // (default to undefined)
let patchSectionPoiDto: PatchSectionPoiDto; //

const { status, data } = await apiInstance.sectionControllerPatchPoi(
    poiLinkId,
    patchSectionPoiDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **patchSectionPoiDto** | **PatchSectionPoiDto**|  | |
| **poiLinkId** | [**string**] |  | defaults to undefined|


### Return type

**SectionResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Patched section POI link |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **sectionControllerReorder**
> SectionListResponse sectionControllerReorder(reorderDto)


### Example

```typescript
import {
    BlogSectionsApi,
    Configuration,
    ReorderDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogSectionsApi(configuration);

let postId: string; // (default to undefined)
let reorderDto: ReorderDto; //

const { status, data } = await apiInstance.sectionControllerReorder(
    postId,
    reorderDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **reorderDto** | **ReorderDto**|  | |
| **postId** | [**string**] |  | defaults to undefined|


### Return type

**SectionListResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Reordered sections |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **sectionControllerReorderImages**
> SectionResponse sectionControllerReorderImages(reorderDto)


### Example

```typescript
import {
    BlogSectionsApi,
    Configuration,
    ReorderDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogSectionsApi(configuration);

let id: string; // (default to undefined)
let reorderDto: ReorderDto; //

const { status, data } = await apiInstance.sectionControllerReorderImages(
    id,
    reorderDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **reorderDto** | **ReorderDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**SectionResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Reordered section images |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **sectionControllerReorderItems**
> SectionResponse sectionControllerReorderItems(reorderDto)


### Example

```typescript
import {
    BlogSectionsApi,
    Configuration,
    ReorderDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogSectionsApi(configuration);

let id: string; // (default to undefined)
let reorderDto: ReorderDto; //

const { status, data } = await apiInstance.sectionControllerReorderItems(
    id,
    reorderDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **reorderDto** | **ReorderDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**SectionResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Reordered list items |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **sectionControllerReorderPois**
> SectionResponse sectionControllerReorderPois(reorderDto)


### Example

```typescript
import {
    BlogSectionsApi,
    Configuration,
    ReorderDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogSectionsApi(configuration);

let id: string; // (default to undefined)
let reorderDto: ReorderDto; //

const { status, data } = await apiInstance.sectionControllerReorderPois(
    id,
    reorderDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **reorderDto** | **ReorderDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**SectionResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Reordered section POIs |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **sectionControllerUpsertImageTranslation**
> SectionResponse sectionControllerUpsertImageTranslation(upsertSectionImageTranslationDto)


### Example

```typescript
import {
    BlogSectionsApi,
    Configuration,
    UpsertSectionImageTranslationDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogSectionsApi(configuration);

let imageId: string; // (default to undefined)
let locale: string; // (default to undefined)
let upsertSectionImageTranslationDto: UpsertSectionImageTranslationDto; //

const { status, data } = await apiInstance.sectionControllerUpsertImageTranslation(
    imageId,
    locale,
    upsertSectionImageTranslationDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **upsertSectionImageTranslationDto** | **UpsertSectionImageTranslationDto**|  | |
| **imageId** | [**string**] |  | defaults to undefined|
| **locale** | [**string**] |  | defaults to undefined|


### Return type

**SectionResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Upserted section image translation |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **sectionControllerUpsertItemTranslation**
> SectionResponse sectionControllerUpsertItemTranslation(upsertSectionListItemTranslationDto)


### Example

```typescript
import {
    BlogSectionsApi,
    Configuration,
    UpsertSectionListItemTranslationDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogSectionsApi(configuration);

let itemId: string; // (default to undefined)
let locale: string; // (default to undefined)
let upsertSectionListItemTranslationDto: UpsertSectionListItemTranslationDto; //

const { status, data } = await apiInstance.sectionControllerUpsertItemTranslation(
    itemId,
    locale,
    upsertSectionListItemTranslationDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **upsertSectionListItemTranslationDto** | **UpsertSectionListItemTranslationDto**|  | |
| **itemId** | [**string**] |  | defaults to undefined|
| **locale** | [**string**] |  | defaults to undefined|


### Return type

**SectionResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Upserted list item translation |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **sectionControllerUpsertTranslation**
> SectionResponse sectionControllerUpsertTranslation(upsertSectionTranslationDto)


### Example

```typescript
import {
    BlogSectionsApi,
    Configuration,
    UpsertSectionTranslationDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogSectionsApi(configuration);

let id: string; // (default to undefined)
let locale: string; // (default to undefined)
let upsertSectionTranslationDto: UpsertSectionTranslationDto; //

const { status, data } = await apiInstance.sectionControllerUpsertTranslation(
    id,
    locale,
    upsertSectionTranslationDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **upsertSectionTranslationDto** | **UpsertSectionTranslationDto**|  | |
| **id** | [**string**] |  | defaults to undefined|
| **locale** | [**string**] |  | defaults to undefined|


### Return type

**SectionResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Upserted section translation |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

