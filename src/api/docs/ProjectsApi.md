# ProjectsApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**projectControllerAddMember**](#projectcontrolleraddmember) | **POST** /projects/{id}/members | |
|[**projectControllerCreate**](#projectcontrollercreate) | **POST** /projects | |
|[**projectControllerCreateLink**](#projectcontrollercreatelink) | **POST** /projects/{id}/links | |
|[**projectControllerCreateStatus**](#projectcontrollercreatestatus) | **POST** /projects/{id}/statuses | |
|[**projectControllerCreateTask**](#projectcontrollercreatetask) | **POST** /projects/{id}/tasks | |
|[**projectControllerGet**](#projectcontrollerget) | **GET** /projects/{id} | |
|[**projectControllerInbox**](#projectcontrollerinbox) | **GET** /projects/inbox | |
|[**projectControllerList**](#projectcontrollerlist) | **GET** /projects | |
|[**projectControllerListLinks**](#projectcontrollerlistlinks) | **GET** /projects/{id}/links | |
|[**projectControllerListMembers**](#projectcontrollerlistmembers) | **GET** /projects/{id}/members | |
|[**projectControllerListTasks**](#projectcontrollerlisttasks) | **GET** /projects/{id}/tasks | |
|[**projectControllerRemove**](#projectcontrollerremove) | **DELETE** /projects/{id} | |
|[**projectControllerRemoveMember**](#projectcontrollerremovemember) | **DELETE** /projects/{id}/members/{userId} | |
|[**projectControllerRemoveStatus**](#projectcontrollerremovestatus) | **DELETE** /projects/{id}/statuses/{statusId} | |
|[**projectControllerReorderStatuses**](#projectcontrollerreorderstatuses) | **PUT** /projects/{id}/statuses/order | |
|[**projectControllerRevokeLink**](#projectcontrollerrevokelink) | **DELETE** /projects/{id}/links/{linkId} | |
|[**projectControllerUpdate**](#projectcontrollerupdate) | **PATCH** /projects/{id} | |
|[**projectControllerUpdateMember**](#projectcontrollerupdatemember) | **PATCH** /projects/{id}/members/{userId} | |
|[**projectControllerUpdateStatus**](#projectcontrollerupdatestatus) | **PATCH** /projects/{id}/statuses/{statusId} | |

# **projectControllerAddMember**
> Array<ProjectMemberResponse> projectControllerAddMember(addProjectMemberDto)


### Example

```typescript
import {
    ProjectsApi,
    Configuration,
    AddProjectMemberDto
} from './api';

const configuration = new Configuration();
const apiInstance = new ProjectsApi(configuration);

let id: string; // (default to undefined)
let addProjectMemberDto: AddProjectMemberDto; //

const { status, data } = await apiInstance.projectControllerAddMember(
    id,
    addProjectMemberDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **addProjectMemberDto** | **AddProjectMemberDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**Array<ProjectMemberResponse>**

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

# **projectControllerCreate**
> ProjectDetailResponse projectControllerCreate(createProjectDto)


### Example

```typescript
import {
    ProjectsApi,
    Configuration,
    CreateProjectDto
} from './api';

const configuration = new Configuration();
const apiInstance = new ProjectsApi(configuration);

let createProjectDto: CreateProjectDto; //

const { status, data } = await apiInstance.projectControllerCreate(
    createProjectDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createProjectDto** | **CreateProjectDto**|  | |


### Return type

**ProjectDetailResponse**

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

# **projectControllerCreateLink**
> CreatedShareLinkResponse projectControllerCreateLink(createShareLinkDto)


### Example

```typescript
import {
    ProjectsApi,
    Configuration,
    CreateShareLinkDto
} from './api';

const configuration = new Configuration();
const apiInstance = new ProjectsApi(configuration);

let id: string; // (default to undefined)
let createShareLinkDto: CreateShareLinkDto; //

const { status, data } = await apiInstance.projectControllerCreateLink(
    id,
    createShareLinkDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createShareLinkDto** | **CreateShareLinkDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**CreatedShareLinkResponse**

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

# **projectControllerCreateStatus**
> Array<ProjectStatusResponse> projectControllerCreateStatus(createProjectStatusDto)


### Example

```typescript
import {
    ProjectsApi,
    Configuration,
    CreateProjectStatusDto
} from './api';

const configuration = new Configuration();
const apiInstance = new ProjectsApi(configuration);

let id: string; // (default to undefined)
let createProjectStatusDto: CreateProjectStatusDto; //

const { status, data } = await apiInstance.projectControllerCreateStatus(
    id,
    createProjectStatusDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createProjectStatusDto** | **CreateProjectStatusDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**Array<ProjectStatusResponse>**

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

# **projectControllerCreateTask**
> TaskDetailResponse projectControllerCreateTask(createTaskDto)


### Example

```typescript
import {
    ProjectsApi,
    Configuration,
    CreateTaskDto
} from './api';

const configuration = new Configuration();
const apiInstance = new ProjectsApi(configuration);

let id: string; // (default to undefined)
let createTaskDto: CreateTaskDto; //

const { status, data } = await apiInstance.projectControllerCreateTask(
    id,
    createTaskDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createTaskDto** | **CreateTaskDto**|  | |
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

# **projectControllerGet**
> ProjectDetailResponse projectControllerGet()


### Example

```typescript
import {
    ProjectsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ProjectsApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.projectControllerGet(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**ProjectDetailResponse**

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

# **projectControllerInbox**
> ProjectDetailResponse projectControllerInbox()


### Example

```typescript
import {
    ProjectsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ProjectsApi(configuration);

const { status, data } = await apiInstance.projectControllerInbox();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**ProjectDetailResponse**

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

# **projectControllerList**
> Array<ProjectSummaryResponse> projectControllerList()


### Example

```typescript
import {
    ProjectsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ProjectsApi(configuration);

let status: ProjectStatus; // (optional) (default to undefined)
let type: ProjectType; // (optional) (default to undefined)
let q: string; // (optional) (default to undefined)
let archived: boolean; // (optional) (default to undefined)

const { status, data } = await apiInstance.projectControllerList(
    status,
    type,
    q,
    archived
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **status** | **ProjectStatus** |  | (optional) defaults to undefined|
| **type** | **ProjectType** |  | (optional) defaults to undefined|
| **q** | [**string**] |  | (optional) defaults to undefined|
| **archived** | [**boolean**] |  | (optional) defaults to undefined|


### Return type

**Array<ProjectSummaryResponse>**

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

# **projectControllerListLinks**
> Array<ShareLinkResponse> projectControllerListLinks()


### Example

```typescript
import {
    ProjectsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ProjectsApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.projectControllerListLinks(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**Array<ShareLinkResponse>**

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

# **projectControllerListMembers**
> Array<ProjectMemberResponse> projectControllerListMembers()


### Example

```typescript
import {
    ProjectsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ProjectsApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.projectControllerListMembers(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**Array<ProjectMemberResponse>**

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

# **projectControllerListTasks**
> Array<TaskResponse> projectControllerListTasks()


### Example

```typescript
import {
    ProjectsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ProjectsApi(configuration);

let id: string; // (default to undefined)
let statusId: string; // (optional) (default to undefined)
let category: StatusCategory; // (optional) (default to undefined)
let assigneeId: string; // (optional) (default to undefined)
let q: string; // (optional) (default to undefined)
let withSubtasks: boolean; // (optional) (default to undefined)

const { status, data } = await apiInstance.projectControllerListTasks(
    id,
    statusId,
    category,
    assigneeId,
    q,
    withSubtasks
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|
| **statusId** | [**string**] |  | (optional) defaults to undefined|
| **category** | **StatusCategory** |  | (optional) defaults to undefined|
| **assigneeId** | [**string**] |  | (optional) defaults to undefined|
| **q** | [**string**] |  | (optional) defaults to undefined|
| **withSubtasks** | [**boolean**] |  | (optional) defaults to undefined|


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

# **projectControllerRemove**
> projectControllerRemove()


### Example

```typescript
import {
    ProjectsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ProjectsApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.projectControllerRemove(
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

# **projectControllerRemoveMember**
> projectControllerRemoveMember()


### Example

```typescript
import {
    ProjectsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ProjectsApi(configuration);

let id: string; // (default to undefined)
let userId: string; // (default to undefined)

const { status, data } = await apiInstance.projectControllerRemoveMember(
    id,
    userId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|
| **userId** | [**string**] |  | defaults to undefined|


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

# **projectControllerRemoveStatus**
> Array<ProjectStatusResponse> projectControllerRemoveStatus()


### Example

```typescript
import {
    ProjectsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ProjectsApi(configuration);

let id: string; // (default to undefined)
let statusId: string; // (default to undefined)
let moveToStatusId: string; // (default to undefined)

const { status, data } = await apiInstance.projectControllerRemoveStatus(
    id,
    statusId,
    moveToStatusId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|
| **statusId** | [**string**] |  | defaults to undefined|
| **moveToStatusId** | [**string**] |  | defaults to undefined|


### Return type

**Array<ProjectStatusResponse>**

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

# **projectControllerReorderStatuses**
> Array<ProjectStatusResponse> projectControllerReorderStatuses(reorderIdsDto)


### Example

```typescript
import {
    ProjectsApi,
    Configuration,
    ReorderIdsDto
} from './api';

const configuration = new Configuration();
const apiInstance = new ProjectsApi(configuration);

let id: string; // (default to undefined)
let reorderIdsDto: ReorderIdsDto; //

const { status, data } = await apiInstance.projectControllerReorderStatuses(
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

**Array<ProjectStatusResponse>**

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

# **projectControllerRevokeLink**
> ShareLinkResponse projectControllerRevokeLink()


### Example

```typescript
import {
    ProjectsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ProjectsApi(configuration);

let id: string; // (default to undefined)
let linkId: string; // (default to undefined)

const { status, data } = await apiInstance.projectControllerRevokeLink(
    id,
    linkId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|
| **linkId** | [**string**] |  | defaults to undefined|


### Return type

**ShareLinkResponse**

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

# **projectControllerUpdate**
> ProjectDetailResponse projectControllerUpdate(updateProjectDto)


### Example

```typescript
import {
    ProjectsApi,
    Configuration,
    UpdateProjectDto
} from './api';

const configuration = new Configuration();
const apiInstance = new ProjectsApi(configuration);

let id: string; // (default to undefined)
let updateProjectDto: UpdateProjectDto; //

const { status, data } = await apiInstance.projectControllerUpdate(
    id,
    updateProjectDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateProjectDto** | **UpdateProjectDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**ProjectDetailResponse**

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

# **projectControllerUpdateMember**
> Array<ProjectMemberResponse> projectControllerUpdateMember(updateProjectMemberDto)


### Example

```typescript
import {
    ProjectsApi,
    Configuration,
    UpdateProjectMemberDto
} from './api';

const configuration = new Configuration();
const apiInstance = new ProjectsApi(configuration);

let id: string; // (default to undefined)
let userId: string; // (default to undefined)
let updateProjectMemberDto: UpdateProjectMemberDto; //

const { status, data } = await apiInstance.projectControllerUpdateMember(
    id,
    userId,
    updateProjectMemberDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateProjectMemberDto** | **UpdateProjectMemberDto**|  | |
| **id** | [**string**] |  | defaults to undefined|
| **userId** | [**string**] |  | defaults to undefined|


### Return type

**Array<ProjectMemberResponse>**

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

# **projectControllerUpdateStatus**
> Array<ProjectStatusResponse> projectControllerUpdateStatus(updateProjectStatusDto)


### Example

```typescript
import {
    ProjectsApi,
    Configuration,
    UpdateProjectStatusDto
} from './api';

const configuration = new Configuration();
const apiInstance = new ProjectsApi(configuration);

let id: string; // (default to undefined)
let statusId: string; // (default to undefined)
let updateProjectStatusDto: UpdateProjectStatusDto; //

const { status, data } = await apiInstance.projectControllerUpdateStatus(
    id,
    statusId,
    updateProjectStatusDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateProjectStatusDto** | **UpdateProjectStatusDto**|  | |
| **id** | [**string**] |  | defaults to undefined|
| **statusId** | [**string**] |  | defaults to undefined|


### Return type

**Array<ProjectStatusResponse>**

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

