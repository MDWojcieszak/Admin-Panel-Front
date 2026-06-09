# BlogTemplatesApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**templateControllerAddBlock**](#templatecontrolleraddblock) | **POST** /blog/templates/{id}/blocks | |
|[**templateControllerApply**](#templatecontrollerapply) | **POST** /blog/posts/{postId}/sections/apply/{templateId} | |
|[**templateControllerCreate**](#templatecontrollercreate) | **POST** /blog/templates | |
|[**templateControllerDelete**](#templatecontrollerdelete) | **DELETE** /blog/templates/{id} | |
|[**templateControllerDeleteBlock**](#templatecontrollerdeleteblock) | **DELETE** /blog/templates/{templateId}/blocks/{blockId} | |
|[**templateControllerGet**](#templatecontrollerget) | **GET** /blog/templates/{id} | |
|[**templateControllerList**](#templatecontrollerlist) | **GET** /blog/templates | |
|[**templateControllerPatch**](#templatecontrollerpatch) | **PATCH** /blog/templates/{id} | |
|[**templateControllerPatchBlock**](#templatecontrollerpatchblock) | **PATCH** /blog/templates/{templateId}/blocks/{blockId} | |
|[**templateControllerReorderBlocks**](#templatecontrollerreorderblocks) | **POST** /blog/templates/{templateId}/blocks/reorder | |

# **templateControllerAddBlock**
> TemplateResponse templateControllerAddBlock(createTemplateBlockDto)


### Example

```typescript
import {
    BlogTemplatesApi,
    Configuration,
    CreateTemplateBlockDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogTemplatesApi(configuration);

let id: string; // (default to undefined)
let createTemplateBlockDto: CreateTemplateBlockDto; //

const { status, data } = await apiInstance.templateControllerAddBlock(
    id,
    createTemplateBlockDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createTemplateBlockDto** | **CreateTemplateBlockDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**TemplateResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Added block |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **templateControllerApply**
> ApplyTemplateResponse templateControllerApply()


### Example

```typescript
import {
    BlogTemplatesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogTemplatesApi(configuration);

let postId: string; // (default to undefined)
let templateId: string; // (default to undefined)

const { status, data } = await apiInstance.templateControllerApply(
    postId,
    templateId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **postId** | [**string**] |  | defaults to undefined|
| **templateId** | [**string**] |  | defaults to undefined|


### Return type

**ApplyTemplateResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Applied template to the post draft |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **templateControllerCreate**
> TemplateResponse templateControllerCreate(createTemplateDto)


### Example

```typescript
import {
    BlogTemplatesApi,
    Configuration,
    CreateTemplateDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogTemplatesApi(configuration);

let createTemplateDto: CreateTemplateDto; //

const { status, data } = await apiInstance.templateControllerCreate(
    createTemplateDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createTemplateDto** | **CreateTemplateDto**|  | |


### Return type

**TemplateResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Created template |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **templateControllerDelete**
> TemplateResponse templateControllerDelete()


### Example

```typescript
import {
    BlogTemplatesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogTemplatesApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.templateControllerDelete(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**TemplateResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Deleted template |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **templateControllerDeleteBlock**
> TemplateResponse templateControllerDeleteBlock()


### Example

```typescript
import {
    BlogTemplatesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogTemplatesApi(configuration);

let templateId: string; // (default to undefined)
let blockId: string; // (default to undefined)

const { status, data } = await apiInstance.templateControllerDeleteBlock(
    templateId,
    blockId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **templateId** | [**string**] |  | defaults to undefined|
| **blockId** | [**string**] |  | defaults to undefined|


### Return type

**TemplateResponse**

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

# **templateControllerGet**
> TemplateResponse templateControllerGet()


### Example

```typescript
import {
    BlogTemplatesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogTemplatesApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.templateControllerGet(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**TemplateResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Template detail |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **templateControllerList**
> TemplateListResponse templateControllerList()


### Example

```typescript
import {
    BlogTemplatesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogTemplatesApi(configuration);

const { status, data } = await apiInstance.templateControllerList();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**TemplateListResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | List templates |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **templateControllerPatch**
> TemplateResponse templateControllerPatch(patchTemplateDto)


### Example

```typescript
import {
    BlogTemplatesApi,
    Configuration,
    PatchTemplateDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogTemplatesApi(configuration);

let id: string; // (default to undefined)
let patchTemplateDto: PatchTemplateDto; //

const { status, data } = await apiInstance.templateControllerPatch(
    id,
    patchTemplateDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **patchTemplateDto** | **PatchTemplateDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**TemplateResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Patched template |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **templateControllerPatchBlock**
> TemplateResponse templateControllerPatchBlock(patchTemplateBlockDto)


### Example

```typescript
import {
    BlogTemplatesApi,
    Configuration,
    PatchTemplateBlockDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogTemplatesApi(configuration);

let templateId: string; // (default to undefined)
let blockId: string; // (default to undefined)
let patchTemplateBlockDto: PatchTemplateBlockDto; //

const { status, data } = await apiInstance.templateControllerPatchBlock(
    templateId,
    blockId,
    patchTemplateBlockDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **patchTemplateBlockDto** | **PatchTemplateBlockDto**|  | |
| **templateId** | [**string**] |  | defaults to undefined|
| **blockId** | [**string**] |  | defaults to undefined|


### Return type

**TemplateResponse**

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

# **templateControllerReorderBlocks**
> TemplateResponse templateControllerReorderBlocks(reorderDto)


### Example

```typescript
import {
    BlogTemplatesApi,
    Configuration,
    ReorderDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogTemplatesApi(configuration);

let templateId: string; // (default to undefined)
let reorderDto: ReorderDto; //

const { status, data } = await apiInstance.templateControllerReorderBlocks(
    templateId,
    reorderDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **reorderDto** | **ReorderDto**|  | |
| **templateId** | [**string**] |  | defaults to undefined|


### Return type

**TemplateResponse**

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

