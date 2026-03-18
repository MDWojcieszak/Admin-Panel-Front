# TaskCommentApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**taskCommentControllerCreate**](#taskcommentcontrollercreate) | **POST** /task-comment | |
|[**taskCommentControllerDelete**](#taskcommentcontrollerdelete) | **DELETE** /task-comment/{id} | |
|[**taskCommentControllerGet**](#taskcommentcontrollerget) | **GET** /task-comment/{id} | |
|[**taskCommentControllerList**](#taskcommentcontrollerlist) | **GET** /task-comment/list | |
|[**taskCommentControllerUpdate**](#taskcommentcontrollerupdate) | **PUT** /task-comment/{id} | |

# **taskCommentControllerCreate**
> TaskCommentResponseDto taskCommentControllerCreate(taskCommentCreateDto)


### Example

```typescript
import {
    TaskCommentApi,
    Configuration,
    TaskCommentCreateDto
} from './api';

const configuration = new Configuration();
const apiInstance = new TaskCommentApi(configuration);

let taskId: string; // (default to undefined)
let taskCommentCreateDto: TaskCommentCreateDto; //

const { status, data } = await apiInstance.taskCommentControllerCreate(
    taskId,
    taskCommentCreateDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **taskCommentCreateDto** | **TaskCommentCreateDto**|  | |
| **taskId** | [**string**] |  | defaults to undefined|


### Return type

**TaskCommentResponseDto**

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

# **taskCommentControllerDelete**
> object taskCommentControllerDelete()


### Example

```typescript
import {
    TaskCommentApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new TaskCommentApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.taskCommentControllerDelete(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**object**

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

# **taskCommentControllerGet**
> TaskCommentResponseDto taskCommentControllerGet()


### Example

```typescript
import {
    TaskCommentApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new TaskCommentApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.taskCommentControllerGet(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**TaskCommentResponseDto**

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

# **taskCommentControllerList**
> TaskCommentListResponseDto taskCommentControllerList()


### Example

```typescript
import {
    TaskCommentApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new TaskCommentApi(configuration);

let taskId: string; // (default to undefined)

const { status, data } = await apiInstance.taskCommentControllerList(
    taskId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **taskId** | [**string**] |  | defaults to undefined|


### Return type

**TaskCommentListResponseDto**

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

# **taskCommentControllerUpdate**
> TaskCommentResponseDto taskCommentControllerUpdate(taskCommentUpdateDto)


### Example

```typescript
import {
    TaskCommentApi,
    Configuration,
    TaskCommentUpdateDto
} from './api';

const configuration = new Configuration();
const apiInstance = new TaskCommentApi(configuration);

let id: string; // (default to undefined)
let taskCommentUpdateDto: TaskCommentUpdateDto; //

const { status, data } = await apiInstance.taskCommentControllerUpdate(
    id,
    taskCommentUpdateDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **taskCommentUpdateDto** | **TaskCommentUpdateDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**TaskCommentResponseDto**

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

