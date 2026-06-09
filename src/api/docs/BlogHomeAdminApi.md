# BlogHomeAdminApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**homeControllerActivate**](#homecontrolleractivate) | **POST** /blog/home/layouts/{layoutId}/activate | |
|[**homeControllerAddBlockPost**](#homecontrolleraddblockpost) | **POST** /blog/home/layouts/{layoutId}/blocks/{blockId}/posts | |
|[**homeControllerCreate**](#homecontrollercreate) | **POST** /blog/home/layouts | |
|[**homeControllerCreateBlock**](#homecontrollercreateblock) | **POST** /blog/home/layouts/{layoutId}/blocks | |
|[**homeControllerDelete**](#homecontrollerdelete) | **DELETE** /blog/home/layouts/{layoutId} | |
|[**homeControllerDeleteBlock**](#homecontrollerdeleteblock) | **DELETE** /blog/home/layouts/{layoutId}/blocks/{blockId} | |
|[**homeControllerGet**](#homecontrollerget) | **GET** /blog/home/layouts/{layoutId} | |
|[**homeControllerList**](#homecontrollerlist) | **GET** /blog/home/layouts | |
|[**homeControllerPatch**](#homecontrollerpatch) | **PATCH** /blog/home/layouts/{layoutId} | |
|[**homeControllerPatchBlock**](#homecontrollerpatchblock) | **PATCH** /blog/home/layouts/{layoutId}/blocks/{blockId} | |
|[**homeControllerRemoveBlockPost**](#homecontrollerremoveblockpost) | **DELETE** /blog/home/layouts/{layoutId}/blocks/{blockId}/posts/{postId} | |
|[**homeControllerReorderBlockPosts**](#homecontrollerreorderblockposts) | **PATCH** /blog/home/layouts/{layoutId}/blocks/{blockId}/posts/reorder | |
|[**homeControllerReorderBlocks**](#homecontrollerreorderblocks) | **PATCH** /blog/home/layouts/{layoutId}/blocks/reorder | |
|[**homeControllerSetBlockPosts**](#homecontrollersetblockposts) | **PUT** /blog/home/layouts/{layoutId}/blocks/{blockId}/posts | |
|[**homeControllerUpsertBlockTranslation**](#homecontrollerupsertblocktranslation) | **PUT** /blog/home/layouts/{layoutId}/blocks/{blockId}/translations/{locale} | |

# **homeControllerActivate**
> HomeLayoutResponse homeControllerActivate()


### Example

```typescript
import {
    BlogHomeAdminApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogHomeAdminApi(configuration);

let layoutId: string; // (default to undefined)

const { status, data } = await apiInstance.homeControllerActivate(
    layoutId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **layoutId** | [**string**] |  | defaults to undefined|


### Return type

**HomeLayoutResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Activated layout |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **homeControllerAddBlockPost**
> HomeBlockResponse homeControllerAddBlockPost(addHomeBlockPostDto)


### Example

```typescript
import {
    BlogHomeAdminApi,
    Configuration,
    AddHomeBlockPostDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogHomeAdminApi(configuration);

let layoutId: string; // (default to undefined)
let blockId: string; // (default to undefined)
let addHomeBlockPostDto: AddHomeBlockPostDto; //

const { status, data } = await apiInstance.homeControllerAddBlockPost(
    layoutId,
    blockId,
    addHomeBlockPostDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **addHomeBlockPostDto** | **AddHomeBlockPostDto**|  | |
| **layoutId** | [**string**] |  | defaults to undefined|
| **blockId** | [**string**] |  | defaults to undefined|


### Return type

**HomeBlockResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Added curated post |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **homeControllerCreate**
> HomeLayoutResponse homeControllerCreate(createHomeLayoutDto)


### Example

```typescript
import {
    BlogHomeAdminApi,
    Configuration,
    CreateHomeLayoutDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogHomeAdminApi(configuration);

let createHomeLayoutDto: CreateHomeLayoutDto; //

const { status, data } = await apiInstance.homeControllerCreate(
    createHomeLayoutDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createHomeLayoutDto** | **CreateHomeLayoutDto**|  | |


### Return type

**HomeLayoutResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Created layout |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **homeControllerCreateBlock**
> HomeBlockResponse homeControllerCreateBlock(createHomeBlockDto)


### Example

```typescript
import {
    BlogHomeAdminApi,
    Configuration,
    CreateHomeBlockDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogHomeAdminApi(configuration);

let layoutId: string; // (default to undefined)
let createHomeBlockDto: CreateHomeBlockDto; //

const { status, data } = await apiInstance.homeControllerCreateBlock(
    layoutId,
    createHomeBlockDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createHomeBlockDto** | **CreateHomeBlockDto**|  | |
| **layoutId** | [**string**] |  | defaults to undefined|


### Return type

**HomeBlockResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Created block |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **homeControllerDelete**
> HomeLayoutResponse homeControllerDelete()


### Example

```typescript
import {
    BlogHomeAdminApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogHomeAdminApi(configuration);

let layoutId: string; // (default to undefined)

const { status, data } = await apiInstance.homeControllerDelete(
    layoutId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **layoutId** | [**string**] |  | defaults to undefined|


### Return type

**HomeLayoutResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Deleted layout |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **homeControllerDeleteBlock**
> HomeBlockResponse homeControllerDeleteBlock()


### Example

```typescript
import {
    BlogHomeAdminApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogHomeAdminApi(configuration);

let layoutId: string; // (default to undefined)
let blockId: string; // (default to undefined)

const { status, data } = await apiInstance.homeControllerDeleteBlock(
    layoutId,
    blockId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **layoutId** | [**string**] |  | defaults to undefined|
| **blockId** | [**string**] |  | defaults to undefined|


### Return type

**HomeBlockResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Deleted block |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **homeControllerGet**
> HomeLayoutResponse homeControllerGet()


### Example

```typescript
import {
    BlogHomeAdminApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogHomeAdminApi(configuration);

let layoutId: string; // (default to undefined)

const { status, data } = await apiInstance.homeControllerGet(
    layoutId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **layoutId** | [**string**] |  | defaults to undefined|


### Return type

**HomeLayoutResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Layout detail |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **homeControllerList**
> HomeLayoutListResponse homeControllerList()


### Example

```typescript
import {
    BlogHomeAdminApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogHomeAdminApi(configuration);

let take: number; // (optional) (default to undefined)
let skip: number; // (optional) (default to 0)
let search: string; //Name contains (case-insensitive). (optional) (default to undefined)

const { status, data } = await apiInstance.homeControllerList(
    take,
    skip,
    search
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **take** | [**number**] |  | (optional) defaults to undefined|
| **skip** | [**number**] |  | (optional) defaults to 0|
| **search** | [**string**] | Name contains (case-insensitive). | (optional) defaults to undefined|


### Return type

**HomeLayoutListResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | List layouts |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **homeControllerPatch**
> HomeLayoutResponse homeControllerPatch(patchHomeLayoutDto)


### Example

```typescript
import {
    BlogHomeAdminApi,
    Configuration,
    PatchHomeLayoutDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogHomeAdminApi(configuration);

let layoutId: string; // (default to undefined)
let patchHomeLayoutDto: PatchHomeLayoutDto; //

const { status, data } = await apiInstance.homeControllerPatch(
    layoutId,
    patchHomeLayoutDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **patchHomeLayoutDto** | **PatchHomeLayoutDto**|  | |
| **layoutId** | [**string**] |  | defaults to undefined|


### Return type

**HomeLayoutResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Patched layout |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **homeControllerPatchBlock**
> HomeBlockResponse homeControllerPatchBlock(patchHomeBlockDto)


### Example

```typescript
import {
    BlogHomeAdminApi,
    Configuration,
    PatchHomeBlockDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogHomeAdminApi(configuration);

let layoutId: string; // (default to undefined)
let blockId: string; // (default to undefined)
let patchHomeBlockDto: PatchHomeBlockDto; //

const { status, data } = await apiInstance.homeControllerPatchBlock(
    layoutId,
    blockId,
    patchHomeBlockDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **patchHomeBlockDto** | **PatchHomeBlockDto**|  | |
| **layoutId** | [**string**] |  | defaults to undefined|
| **blockId** | [**string**] |  | defaults to undefined|


### Return type

**HomeBlockResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Patched block |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **homeControllerRemoveBlockPost**
> HomeBlockResponse homeControllerRemoveBlockPost()


### Example

```typescript
import {
    BlogHomeAdminApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogHomeAdminApi(configuration);

let layoutId: string; // (default to undefined)
let blockId: string; // (default to undefined)
let postId: string; // (default to undefined)

const { status, data } = await apiInstance.homeControllerRemoveBlockPost(
    layoutId,
    blockId,
    postId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **layoutId** | [**string**] |  | defaults to undefined|
| **blockId** | [**string**] |  | defaults to undefined|
| **postId** | [**string**] |  | defaults to undefined|


### Return type

**HomeBlockResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Removed curated post |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **homeControllerReorderBlockPosts**
> HomeBlockResponse homeControllerReorderBlockPosts(reorderHomeBlockPostsDto)


### Example

```typescript
import {
    BlogHomeAdminApi,
    Configuration,
    ReorderHomeBlockPostsDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogHomeAdminApi(configuration);

let layoutId: string; // (default to undefined)
let blockId: string; // (default to undefined)
let reorderHomeBlockPostsDto: ReorderHomeBlockPostsDto; //

const { status, data } = await apiInstance.homeControllerReorderBlockPosts(
    layoutId,
    blockId,
    reorderHomeBlockPostsDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **reorderHomeBlockPostsDto** | **ReorderHomeBlockPostsDto**|  | |
| **layoutId** | [**string**] |  | defaults to undefined|
| **blockId** | [**string**] |  | defaults to undefined|


### Return type

**HomeBlockResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Reordered curated posts |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **homeControllerReorderBlocks**
> HomeLayoutResponse homeControllerReorderBlocks(reorderHomeBlocksDto)


### Example

```typescript
import {
    BlogHomeAdminApi,
    Configuration,
    ReorderHomeBlocksDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogHomeAdminApi(configuration);

let layoutId: string; // (default to undefined)
let reorderHomeBlocksDto: ReorderHomeBlocksDto; //

const { status, data } = await apiInstance.homeControllerReorderBlocks(
    layoutId,
    reorderHomeBlocksDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **reorderHomeBlocksDto** | **ReorderHomeBlocksDto**|  | |
| **layoutId** | [**string**] |  | defaults to undefined|


### Return type

**HomeLayoutResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Reordered blocks |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **homeControllerSetBlockPosts**
> HomeBlockResponse homeControllerSetBlockPosts(setHomeBlockPostsDto)


### Example

```typescript
import {
    BlogHomeAdminApi,
    Configuration,
    SetHomeBlockPostsDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogHomeAdminApi(configuration);

let layoutId: string; // (default to undefined)
let blockId: string; // (default to undefined)
let setHomeBlockPostsDto: SetHomeBlockPostsDto; //

const { status, data } = await apiInstance.homeControllerSetBlockPosts(
    layoutId,
    blockId,
    setHomeBlockPostsDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **setHomeBlockPostsDto** | **SetHomeBlockPostsDto**|  | |
| **layoutId** | [**string**] |  | defaults to undefined|
| **blockId** | [**string**] |  | defaults to undefined|


### Return type

**HomeBlockResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Replaced curated posts |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **homeControllerUpsertBlockTranslation**
> HomeBlockResponse homeControllerUpsertBlockTranslation(upsertHomeBlockTranslationDto)


### Example

```typescript
import {
    BlogHomeAdminApi,
    Configuration,
    UpsertHomeBlockTranslationDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogHomeAdminApi(configuration);

let layoutId: string; // (default to undefined)
let blockId: string; // (default to undefined)
let locale: string; // (default to undefined)
let upsertHomeBlockTranslationDto: UpsertHomeBlockTranslationDto; //

const { status, data } = await apiInstance.homeControllerUpsertBlockTranslation(
    layoutId,
    blockId,
    locale,
    upsertHomeBlockTranslationDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **upsertHomeBlockTranslationDto** | **UpsertHomeBlockTranslationDto**|  | |
| **layoutId** | [**string**] |  | defaults to undefined|
| **blockId** | [**string**] |  | defaults to undefined|
| **locale** | [**string**] |  | defaults to undefined|


### Return type

**HomeBlockResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Upserted block translation |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

