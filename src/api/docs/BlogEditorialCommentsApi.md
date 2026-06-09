# BlogEditorialCommentsApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**commentControllerCreate**](#commentcontrollercreate) | **POST** /blog/posts/{postId}/comments | |
|[**commentControllerDelete**](#commentcontrollerdelete) | **DELETE** /blog/posts/{postId}/comments/{commentId} | |
|[**commentControllerGet**](#commentcontrollerget) | **GET** /blog/posts/{postId}/comments/{commentId} | |
|[**commentControllerList**](#commentcontrollerlist) | **GET** /blog/posts/{postId}/comments | |
|[**commentControllerPatch**](#commentcontrollerpatch) | **PATCH** /blog/posts/{postId}/comments/{commentId} | |

# **commentControllerCreate**
> EditorialCommentResponse commentControllerCreate(createCommentDto)


### Example

```typescript
import {
    BlogEditorialCommentsApi,
    Configuration,
    CreateCommentDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogEditorialCommentsApi(configuration);

let postId: string; // (default to undefined)
let createCommentDto: CreateCommentDto; //

const { status, data } = await apiInstance.commentControllerCreate(
    postId,
    createCommentDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createCommentDto** | **CreateCommentDto**|  | |
| **postId** | [**string**] |  | defaults to undefined|


### Return type

**EditorialCommentResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Created comment |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **commentControllerDelete**
> EditorialCommentResponse commentControllerDelete()


### Example

```typescript
import {
    BlogEditorialCommentsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogEditorialCommentsApi(configuration);

let postId: string; // (default to undefined)
let commentId: string; // (default to undefined)

const { status, data } = await apiInstance.commentControllerDelete(
    postId,
    commentId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **postId** | [**string**] |  | defaults to undefined|
| **commentId** | [**string**] |  | defaults to undefined|


### Return type

**EditorialCommentResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Deleted comment |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **commentControllerGet**
> EditorialCommentResponse commentControllerGet()


### Example

```typescript
import {
    BlogEditorialCommentsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogEditorialCommentsApi(configuration);

let postId: string; // (default to undefined)
let commentId: string; // (default to undefined)

const { status, data } = await apiInstance.commentControllerGet(
    postId,
    commentId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **postId** | [**string**] |  | defaults to undefined|
| **commentId** | [**string**] |  | defaults to undefined|


### Return type

**EditorialCommentResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Comment detail |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **commentControllerList**
> CommentListResponse commentControllerList()


### Example

```typescript
import {
    BlogEditorialCommentsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogEditorialCommentsApi(configuration);

let postId: string; // (default to undefined)
let sectionId: string; // (default to undefined)

const { status, data } = await apiInstance.commentControllerList(
    postId,
    sectionId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **postId** | [**string**] |  | defaults to undefined|
| **sectionId** | [**string**] |  | defaults to undefined|


### Return type

**CommentListResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | List comments |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **commentControllerPatch**
> EditorialCommentResponse commentControllerPatch(patchCommentDto)


### Example

```typescript
import {
    BlogEditorialCommentsApi,
    Configuration,
    PatchCommentDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogEditorialCommentsApi(configuration);

let postId: string; // (default to undefined)
let commentId: string; // (default to undefined)
let patchCommentDto: PatchCommentDto; //

const { status, data } = await apiInstance.commentControllerPatch(
    postId,
    commentId,
    patchCommentDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **patchCommentDto** | **PatchCommentDto**|  | |
| **postId** | [**string**] |  | defaults to undefined|
| **commentId** | [**string**] |  | defaults to undefined|


### Return type

**EditorialCommentResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Patched comment |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

