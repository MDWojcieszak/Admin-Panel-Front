# TasksApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**taskControllerAddChecklistItem**](#taskcontrolleraddchecklistitem) | **POST** /tasks/{id}/checklist | |
|[**taskControllerGet**](#taskcontrollerget) | **GET** /tasks/{id} | |
|[**taskControllerMine**](#taskcontrollermine) | **GET** /tasks/mine | |
|[**taskControllerMove**](#taskcontrollermove) | **POST** /tasks/{id}/move | |
|[**taskControllerMoveToProject**](#taskcontrollermovetoproject) | **POST** /tasks/{id}/move-to-project | |
|[**taskControllerRemove**](#taskcontrollerremove) | **DELETE** /tasks/{id} | |
|[**taskControllerRemoveChecklistItem**](#taskcontrollerremovechecklistitem) | **DELETE** /tasks/{id}/checklist/{itemId} | |
|[**taskControllerReorderChecklist**](#taskcontrollerreorderchecklist) | **PUT** /tasks/{id}/checklist/order | |
|[**taskControllerStats**](#taskcontrollerstats) | **GET** /tasks/stats | |
|[**taskControllerToggle**](#taskcontrollertoggle) | **POST** /tasks/{id}/toggle | |
|[**taskControllerUpdate**](#taskcontrollerupdate) | **PATCH** /tasks/{id} | |
|[**taskControllerUpdateChecklistItem**](#taskcontrollerupdatechecklistitem) | **PATCH** /tasks/{id}/checklist/{itemId} | |

# **taskControllerAddChecklistItem**
> Array<ChecklistItemResponse> taskControllerAddChecklistItem(createChecklistItemDto)


### Example

```typescript
import {
    TasksApi,
    Configuration,
    CreateChecklistItemDto
} from './api';

const configuration = new Configuration();
const apiInstance = new TasksApi(configuration);

let id: string; // (default to undefined)
let createChecklistItemDto: CreateChecklistItemDto; //

const { status, data } = await apiInstance.taskControllerAddChecklistItem(
    id,
    createChecklistItemDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createChecklistItemDto** | **CreateChecklistItemDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**Array<ChecklistItemResponse>**

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

# **taskControllerGet**
> TaskDetailResponse taskControllerGet()


### Example

```typescript
import {
    TasksApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new TasksApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.taskControllerGet(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**TaskDetailResponse**

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

# **taskControllerMine**
> Array<TaskResponse> taskControllerMine()


### Example

```typescript
import {
    TasksApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new TasksApi(configuration);

let view: MyTasksView; // (optional) (default to undefined)

const { status, data } = await apiInstance.taskControllerMine(
    view
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **view** | **MyTasksView** |  | (optional) defaults to undefined|


### Return type

**Array<TaskResponse>**

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

# **taskControllerMove**
> TaskDetailResponse taskControllerMove(moveTaskDto)


### Example

```typescript
import {
    TasksApi,
    Configuration,
    MoveTaskDto
} from './api';

const configuration = new Configuration();
const apiInstance = new TasksApi(configuration);

let id: string; // (default to undefined)
let moveTaskDto: MoveTaskDto; //

const { status, data } = await apiInstance.taskControllerMove(
    id,
    moveTaskDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **moveTaskDto** | **MoveTaskDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**TaskDetailResponse**

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

# **taskControllerMoveToProject**
> MovedTaskResponse taskControllerMoveToProject(moveTaskToProjectDto)


### Example

```typescript
import {
    TasksApi,
    Configuration,
    MoveTaskToProjectDto
} from './api';

const configuration = new Configuration();
const apiInstance = new TasksApi(configuration);

let id: string; // (default to undefined)
let moveTaskToProjectDto: MoveTaskToProjectDto; //

const { status, data } = await apiInstance.taskControllerMoveToProject(
    id,
    moveTaskToProjectDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **moveTaskToProjectDto** | **MoveTaskToProjectDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**MovedTaskResponse**

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

# **taskControllerRemove**
> taskControllerRemove()


### Example

```typescript
import {
    TasksApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new TasksApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.taskControllerRemove(
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

# **taskControllerRemoveChecklistItem**
> Array<ChecklistItemResponse> taskControllerRemoveChecklistItem()


### Example

```typescript
import {
    TasksApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new TasksApi(configuration);

let id: string; // (default to undefined)
let itemId: string; // (default to undefined)

const { status, data } = await apiInstance.taskControllerRemoveChecklistItem(
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

**Array<ChecklistItemResponse>**

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

# **taskControllerReorderChecklist**
> Array<ChecklistItemResponse> taskControllerReorderChecklist(reorderIdsDto)


### Example

```typescript
import {
    TasksApi,
    Configuration,
    ReorderIdsDto
} from './api';

const configuration = new Configuration();
const apiInstance = new TasksApi(configuration);

let id: string; // (default to undefined)
let reorderIdsDto: ReorderIdsDto; //

const { status, data } = await apiInstance.taskControllerReorderChecklist(
    id,
    reorderIdsDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **reorderIdsDto** | **ReorderIdsDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**Array<ChecklistItemResponse>**

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

# **taskControllerStats**
> MyTaskStatsResponse taskControllerStats()


### Example

```typescript
import {
    TasksApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new TasksApi(configuration);

const { status, data } = await apiInstance.taskControllerStats();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**MyTaskStatsResponse**

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

# **taskControllerToggle**
> TaskDetailResponse taskControllerToggle()


### Example

```typescript
import {
    TasksApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new TasksApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.taskControllerToggle(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**TaskDetailResponse**

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

# **taskControllerUpdate**
> TaskDetailResponse taskControllerUpdate(updateTaskDto)


### Example

```typescript
import {
    TasksApi,
    Configuration,
    UpdateTaskDto
} from './api';

const configuration = new Configuration();
const apiInstance = new TasksApi(configuration);

let id: string; // (default to undefined)
let updateTaskDto: UpdateTaskDto; //

const { status, data } = await apiInstance.taskControllerUpdate(
    id,
    updateTaskDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateTaskDto** | **UpdateTaskDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**TaskDetailResponse**

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

# **taskControllerUpdateChecklistItem**
> Array<ChecklistItemResponse> taskControllerUpdateChecklistItem(updateChecklistItemDto)


### Example

```typescript
import {
    TasksApi,
    Configuration,
    UpdateChecklistItemDto
} from './api';

const configuration = new Configuration();
const apiInstance = new TasksApi(configuration);

let id: string; // (default to undefined)
let itemId: string; // (default to undefined)
let updateChecklistItemDto: UpdateChecklistItemDto; //

const { status, data } = await apiInstance.taskControllerUpdateChecklistItem(
    id,
    itemId,
    updateChecklistItemDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateChecklistItemDto** | **UpdateChecklistItemDto**|  | |
| **id** | [**string**] |  | defaults to undefined|
| **itemId** | [**string**] |  | defaults to undefined|


### Return type

**Array<ChecklistItemResponse>**

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

