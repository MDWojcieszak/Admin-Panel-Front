# DeployApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**deployControllerAdoptStack**](#deploycontrolleradoptstack) | **POST** /deploy/containers/{project}/adopt | |
|[**deployControllerAgentStatus**](#deploycontrolleragentstatus) | **GET** /deploy/agent | |
|[**deployControllerApplyImport**](#deploycontrollerapplyimport) | **POST** /deploy/applications/{id}/import | |
|[**deployControllerCreateApplication**](#deploycontrollercreateapplication) | **POST** /deploy/applications | |
|[**deployControllerCreateGitAccount**](#deploycontrollercreategitaccount) | **POST** /deploy/git/accounts | |
|[**deployControllerCreateGitRepo**](#deploycontrollercreategitrepo) | **POST** /deploy/git/repos | |
|[**deployControllerCreateRelease**](#deploycontrollercreaterelease) | **POST** /deploy/applications/{id}/releases | |
|[**deployControllerDeleteApplication**](#deploycontrollerdeleteapplication) | **DELETE** /deploy/applications/{id} | |
|[**deployControllerDeleteEnv**](#deploycontrollerdeleteenv) | **DELETE** /deploy/applications/{id}/env/{key} | |
|[**deployControllerDeleteGitAccount**](#deploycontrollerdeletegitaccount) | **DELETE** /deploy/git/accounts/{id} | |
|[**deployControllerDeleteGitRepo**](#deploycontrollerdeletegitrepo) | **DELETE** /deploy/git/repos/{id} | |
|[**deployControllerDeleteVariable**](#deploycontrollerdeletevariable) | **DELETE** /deploy/variables/{id} | |
|[**deployControllerDisableWebhook**](#deploycontrollerdisablewebhook) | **DELETE** /deploy/applications/{id}/webhook | |
|[**deployControllerGetApplication**](#deploycontrollergetapplication) | **GET** /deploy/applications/{id} | |
|[**deployControllerGetContainerStack**](#deploycontrollergetcontainerstack) | **GET** /deploy/containers/{project} | |
|[**deployControllerGetGitRepo**](#deploycontrollergetgitrepo) | **GET** /deploy/git/repos/{id} | |
|[**deployControllerListApplications**](#deploycontrollerlistapplications) | **GET** /deploy/applications | |
|[**deployControllerListAudit**](#deploycontrollerlistaudit) | **GET** /deploy/audit/{entityType}/{entityId} | |
|[**deployControllerListContainers**](#deploycontrollerlistcontainers) | **GET** /deploy/containers | |
|[**deployControllerListEnv**](#deploycontrollerlistenv) | **GET** /deploy/applications/{id}/env | |
|[**deployControllerListGitAccounts**](#deploycontrollerlistgitaccounts) | **GET** /deploy/git/accounts | |
|[**deployControllerListGitRepos**](#deploycontrollerlistgitrepos) | **GET** /deploy/git/repos | |
|[**deployControllerListReleases**](#deploycontrollerlistreleases) | **GET** /deploy/applications/{id}/releases | |
|[**deployControllerListVariables**](#deploycontrollerlistvariables) | **GET** /deploy/variables | |
|[**deployControllerPreviewImport**](#deploycontrollerpreviewimport) | **POST** /deploy/applications/{id}/import/preview | |
|[**deployControllerRefreshContainers**](#deploycontrollerrefreshcontainers) | **POST** /deploy/containers/refresh | |
|[**deployControllerRenderApplication**](#deploycontrollerrenderapplication) | **POST** /deploy/applications/{id}/render | |
|[**deployControllerRollback**](#deploycontrollerrollback) | **POST** /deploy/releases/{id}/rollback | |
|[**deployControllerRotateWebhookSecret**](#deploycontrollerrotatewebhooksecret) | **POST** /deploy/applications/{id}/webhook/rotate | |
|[**deployControllerRunStackAction**](#deploycontrollerrunstackaction) | **POST** /deploy/containers/{project}/actions/{action} | |
|[**deployControllerStackLogs**](#deploycontrollerstacklogs) | **GET** /deploy/containers/{project}/logs | |
|[**deployControllerUpdateApplication**](#deploycontrollerupdateapplication) | **PATCH** /deploy/applications/{id} | |
|[**deployControllerUpdateGitAccount**](#deploycontrollerupdategitaccount) | **PATCH** /deploy/git/accounts/{id} | |
|[**deployControllerUpdateGitRepo**](#deploycontrollerupdategitrepo) | **PATCH** /deploy/git/repos/{id} | |
|[**deployControllerUpsertEnv**](#deploycontrollerupsertenv) | **PUT** /deploy/applications/{id}/env/{key} | |
|[**deployControllerUpsertVariable**](#deploycontrollerupsertvariable) | **PUT** /deploy/variables | |

# **deployControllerAdoptStack**
> deployControllerAdoptStack()


### Example

```typescript
import {
    DeployApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DeployApi(configuration);

let project: string; // (default to undefined)
let serverId: string; // (default to undefined)

const { status, data } = await apiInstance.deployControllerAdoptStack(
    project,
    serverId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **project** | [**string**] |  | defaults to undefined|
| **serverId** | [**string**] |  | defaults to undefined|


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
|**201** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deployControllerAgentStatus**
> deployControllerAgentStatus()


### Example

```typescript
import {
    DeployApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DeployApi(configuration);

const { status, data } = await apiInstance.deployControllerAgentStatus();
```

### Parameters
This endpoint does not have any parameters.


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

# **deployControllerApplyImport**
> deployControllerApplyImport()


### Example

```typescript
import {
    DeployApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DeployApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.deployControllerApplyImport(
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
|**201** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deployControllerCreateApplication**
> deployControllerCreateApplication(createApplicationDto)


### Example

```typescript
import {
    DeployApi,
    Configuration,
    CreateApplicationDto
} from './api';

const configuration = new Configuration();
const apiInstance = new DeployApi(configuration);

let createApplicationDto: CreateApplicationDto; //

const { status, data } = await apiInstance.deployControllerCreateApplication(
    createApplicationDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createApplicationDto** | **CreateApplicationDto**|  | |


### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deployControllerCreateGitAccount**
> deployControllerCreateGitAccount(upsertGitAccountDto)


### Example

```typescript
import {
    DeployApi,
    Configuration,
    UpsertGitAccountDto
} from './api';

const configuration = new Configuration();
const apiInstance = new DeployApi(configuration);

let upsertGitAccountDto: UpsertGitAccountDto; //

const { status, data } = await apiInstance.deployControllerCreateGitAccount(
    upsertGitAccountDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **upsertGitAccountDto** | **UpsertGitAccountDto**|  | |


### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deployControllerCreateGitRepo**
> deployControllerCreateGitRepo(upsertGitRepoDto)


### Example

```typescript
import {
    DeployApi,
    Configuration,
    UpsertGitRepoDto
} from './api';

const configuration = new Configuration();
const apiInstance = new DeployApi(configuration);

let upsertGitRepoDto: UpsertGitRepoDto; //

const { status, data } = await apiInstance.deployControllerCreateGitRepo(
    upsertGitRepoDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **upsertGitRepoDto** | **UpsertGitRepoDto**|  | |


### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deployControllerCreateRelease**
> deployControllerCreateRelease(createReleaseDto)


### Example

```typescript
import {
    DeployApi,
    Configuration,
    CreateReleaseDto
} from './api';

const configuration = new Configuration();
const apiInstance = new DeployApi(configuration);

let id: string; // (default to undefined)
let createReleaseDto: CreateReleaseDto; //

const { status, data } = await apiInstance.deployControllerCreateRelease(
    id,
    createReleaseDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createReleaseDto** | **CreateReleaseDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deployControllerDeleteApplication**
> deployControllerDeleteApplication()


### Example

```typescript
import {
    DeployApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DeployApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.deployControllerDeleteApplication(
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

# **deployControllerDeleteEnv**
> deployControllerDeleteEnv()


### Example

```typescript
import {
    DeployApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DeployApi(configuration);

let id: string; // (default to undefined)
let key: string; // (default to undefined)

const { status, data } = await apiInstance.deployControllerDeleteEnv(
    id,
    key
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|
| **key** | [**string**] |  | defaults to undefined|


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

# **deployControllerDeleteGitAccount**
> deployControllerDeleteGitAccount()


### Example

```typescript
import {
    DeployApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DeployApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.deployControllerDeleteGitAccount(
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

# **deployControllerDeleteGitRepo**
> deployControllerDeleteGitRepo()


### Example

```typescript
import {
    DeployApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DeployApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.deployControllerDeleteGitRepo(
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

# **deployControllerDeleteVariable**
> deployControllerDeleteVariable()


### Example

```typescript
import {
    DeployApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DeployApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.deployControllerDeleteVariable(
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

# **deployControllerDisableWebhook**
> deployControllerDisableWebhook()


### Example

```typescript
import {
    DeployApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DeployApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.deployControllerDisableWebhook(
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

# **deployControllerGetApplication**
> deployControllerGetApplication()


### Example

```typescript
import {
    DeployApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DeployApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.deployControllerGetApplication(
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

# **deployControllerGetContainerStack**
> deployControllerGetContainerStack()


### Example

```typescript
import {
    DeployApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DeployApi(configuration);

let project: string; // (default to undefined)

const { status, data } = await apiInstance.deployControllerGetContainerStack(
    project
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **project** | [**string**] |  | defaults to undefined|


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

# **deployControllerGetGitRepo**
> deployControllerGetGitRepo()


### Example

```typescript
import {
    DeployApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DeployApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.deployControllerGetGitRepo(
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

# **deployControllerListApplications**
> deployControllerListApplications()


### Example

```typescript
import {
    DeployApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DeployApi(configuration);

const { status, data } = await apiInstance.deployControllerListApplications();
```

### Parameters
This endpoint does not have any parameters.


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

# **deployControllerListAudit**
> deployControllerListAudit()


### Example

```typescript
import {
    DeployApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DeployApi(configuration);

let entityType: string; // (default to undefined)
let entityId: string; // (default to undefined)
let take: string; // (default to undefined)

const { status, data } = await apiInstance.deployControllerListAudit(
    entityType,
    entityId,
    take
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **entityType** | [**string**] |  | defaults to undefined|
| **entityId** | [**string**] |  | defaults to undefined|
| **take** | [**string**] |  | defaults to undefined|


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

# **deployControllerListContainers**
> deployControllerListContainers()


### Example

```typescript
import {
    DeployApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DeployApi(configuration);

const { status, data } = await apiInstance.deployControllerListContainers();
```

### Parameters
This endpoint does not have any parameters.


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

# **deployControllerListEnv**
> deployControllerListEnv()


### Example

```typescript
import {
    DeployApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DeployApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.deployControllerListEnv(
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

# **deployControllerListGitAccounts**
> deployControllerListGitAccounts()


### Example

```typescript
import {
    DeployApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DeployApi(configuration);

const { status, data } = await apiInstance.deployControllerListGitAccounts();
```

### Parameters
This endpoint does not have any parameters.


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

# **deployControllerListGitRepos**
> deployControllerListGitRepos()


### Example

```typescript
import {
    DeployApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DeployApi(configuration);

const { status, data } = await apiInstance.deployControllerListGitRepos();
```

### Parameters
This endpoint does not have any parameters.


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

# **deployControllerListReleases**
> deployControllerListReleases()


### Example

```typescript
import {
    DeployApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DeployApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.deployControllerListReleases(
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

# **deployControllerListVariables**
> deployControllerListVariables()


### Example

```typescript
import {
    DeployApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DeployApi(configuration);

const { status, data } = await apiInstance.deployControllerListVariables();
```

### Parameters
This endpoint does not have any parameters.


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

# **deployControllerPreviewImport**
> deployControllerPreviewImport()


### Example

```typescript
import {
    DeployApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DeployApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.deployControllerPreviewImport(
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
|**201** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deployControllerRefreshContainers**
> deployControllerRefreshContainers()


### Example

```typescript
import {
    DeployApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DeployApi(configuration);

let serverId: string; // (default to undefined)

const { status, data } = await apiInstance.deployControllerRefreshContainers(
    serverId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **serverId** | [**string**] |  | defaults to undefined|


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
|**201** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deployControllerRenderApplication**
> deployControllerRenderApplication()


### Example

```typescript
import {
    DeployApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DeployApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.deployControllerRenderApplication(
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
|**201** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deployControllerRollback**
> deployControllerRollback()


### Example

```typescript
import {
    DeployApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DeployApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.deployControllerRollback(
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
|**201** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deployControllerRotateWebhookSecret**
> deployControllerRotateWebhookSecret()


### Example

```typescript
import {
    DeployApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DeployApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.deployControllerRotateWebhookSecret(
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
|**201** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deployControllerRunStackAction**
> deployControllerRunStackAction()


### Example

```typescript
import {
    DeployApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DeployApi(configuration);

let project: string; // (default to undefined)
let action: string; // (default to undefined)
let serverId: string; // (default to undefined)

const { status, data } = await apiInstance.deployControllerRunStackAction(
    project,
    action,
    serverId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **project** | [**string**] |  | defaults to undefined|
| **action** | [**string**] |  | defaults to undefined|
| **serverId** | [**string**] |  | defaults to undefined|


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
|**201** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deployControllerStackLogs**
> deployControllerStackLogs()


### Example

```typescript
import {
    DeployApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DeployApi(configuration);

let project: string; // (default to undefined)
let tail: string; // (default to undefined)
let serverId: string; // (default to undefined)

const { status, data } = await apiInstance.deployControllerStackLogs(
    project,
    tail,
    serverId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **project** | [**string**] |  | defaults to undefined|
| **tail** | [**string**] |  | defaults to undefined|
| **serverId** | [**string**] |  | defaults to undefined|


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

# **deployControllerUpdateApplication**
> deployControllerUpdateApplication(updateApplicationDto)


### Example

```typescript
import {
    DeployApi,
    Configuration,
    UpdateApplicationDto
} from './api';

const configuration = new Configuration();
const apiInstance = new DeployApi(configuration);

let id: string; // (default to undefined)
let updateApplicationDto: UpdateApplicationDto; //

const { status, data } = await apiInstance.deployControllerUpdateApplication(
    id,
    updateApplicationDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateApplicationDto** | **UpdateApplicationDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deployControllerUpdateGitAccount**
> deployControllerUpdateGitAccount(upsertGitAccountDto)


### Example

```typescript
import {
    DeployApi,
    Configuration,
    UpsertGitAccountDto
} from './api';

const configuration = new Configuration();
const apiInstance = new DeployApi(configuration);

let id: string; // (default to undefined)
let upsertGitAccountDto: UpsertGitAccountDto; //

const { status, data } = await apiInstance.deployControllerUpdateGitAccount(
    id,
    upsertGitAccountDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **upsertGitAccountDto** | **UpsertGitAccountDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deployControllerUpdateGitRepo**
> deployControllerUpdateGitRepo(upsertGitRepoDto)


### Example

```typescript
import {
    DeployApi,
    Configuration,
    UpsertGitRepoDto
} from './api';

const configuration = new Configuration();
const apiInstance = new DeployApi(configuration);

let id: string; // (default to undefined)
let upsertGitRepoDto: UpsertGitRepoDto; //

const { status, data } = await apiInstance.deployControllerUpdateGitRepo(
    id,
    upsertGitRepoDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **upsertGitRepoDto** | **UpsertGitRepoDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deployControllerUpsertEnv**
> deployControllerUpsertEnv(upsertApplicationEnvDto)


### Example

```typescript
import {
    DeployApi,
    Configuration,
    UpsertApplicationEnvDto
} from './api';

const configuration = new Configuration();
const apiInstance = new DeployApi(configuration);

let id: string; // (default to undefined)
let key: string; // (default to undefined)
let upsertApplicationEnvDto: UpsertApplicationEnvDto; //

const { status, data } = await apiInstance.deployControllerUpsertEnv(
    id,
    key,
    upsertApplicationEnvDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **upsertApplicationEnvDto** | **UpsertApplicationEnvDto**|  | |
| **id** | [**string**] |  | defaults to undefined|
| **key** | [**string**] |  | defaults to undefined|


### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deployControllerUpsertVariable**
> deployControllerUpsertVariable(upsertVariableDto)


### Example

```typescript
import {
    DeployApi,
    Configuration,
    UpsertVariableDto
} from './api';

const configuration = new Configuration();
const apiInstance = new DeployApi(configuration);

let upsertVariableDto: UpsertVariableDto; //

const { status, data } = await apiInstance.deployControllerUpsertVariable(
    upsertVariableDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **upsertVariableDto** | **UpsertVariableDto**|  | |


### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

