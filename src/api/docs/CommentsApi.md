# CommentsApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**projectCommentControllerCreate**](#projectcommentcontrollercreate) | **POST** /comments | |
|[**projectCommentControllerList**](#projectcommentcontrollerlist) | **GET** /comments | |
|[**projectCommentControllerRemove**](#projectcommentcontrollerremove) | **DELETE** /comments/{id} | |
|[**projectCommentControllerUpdate**](#projectcommentcontrollerupdate) | **PATCH** /comments/{id} | |

# **projectCommentControllerCreate**
> ProjectCommentResponse projectCommentControllerCreate(createProjectCommentDto)


### Example

```typescript
import {
    CommentsApi,
    Configuration,
    CreateProjectCommentDto
} from './api';

const configuration = new Configuration();
const apiInstance = new CommentsApi(configuration);

let createProjectCommentDto: CreateProjectCommentDto; //

const { status, data } = await apiInstance.projectCommentControllerCreate(
    createProjectCommentDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createProjectCommentDto** | **CreateProjectCommentDto**|  | |


### Return type

**ProjectCommentResponse**

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

# **projectCommentControllerList**
> Array<ProjectCommentResponse> projectCommentControllerList()


### Example

```typescript
import {
    CommentsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CommentsApi(configuration);

let projectId: string; // (optional) (default to undefined)
let taskId: string; // (optional) (default to undefined)
let bomItemId: string; // (optional) (default to undefined)
let journalEntryId: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.projectCommentControllerList(
    projectId,
    taskId,
    bomItemId,
    journalEntryId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **projectId** | [**string**] |  | (optional) defaults to undefined|
| **taskId** | [**string**] |  | (optional) defaults to undefined|
| **bomItemId** | [**string**] |  | (optional) defaults to undefined|
| **journalEntryId** | [**string**] |  | (optional) defaults to undefined|


### Return type

**Array<ProjectCommentResponse>**

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

# **projectCommentControllerRemove**
> projectCommentControllerRemove()


### Example

```typescript
import {
    CommentsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CommentsApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.projectCommentControllerRemove(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **projectCommentControllerUpdate**
> ProjectCommentResponse projectCommentControllerUpdate(updateProjectCommentDto)


### Example

```typescript
import {
    CommentsApi,
    Configuration,
    UpdateProjectCommentDto
} from './api';

const configuration = new Configuration();
const apiInstance = new CommentsApi(configuration);

let id: string; // (default to undefined)
let updateProjectCommentDto: UpdateProjectCommentDto; //

const { status, data } = await apiInstance.projectCommentControllerUpdate(
    id,
    updateProjectCommentDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateProjectCommentDto** | **UpdateProjectCommentDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**ProjectCommentResponse**

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

