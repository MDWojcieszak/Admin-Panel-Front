# ServerApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**serverCommandsControllerGetCommands**](#servercommandscontrollergetcommands) | **GET** /server/commands/all | |
|[**serverCommandsControllerPutCommand**](#servercommandscontrollerputcommand) | **PATCH** /server/commands/{id} | |
|[**serverCommandsControllerStartServer**](#servercommandscontrollerstartserver) | **POST** /server/commands/send/{id} | |
|[**serverControllerGet**](#servercontrollerget) | **GET** /server/{serverId} | |
|[**serverControllerGetAll**](#servercontrollergetall) | **GET** /server/all | |
|[**serverControllerGetDetails**](#servercontrollergetdetails) | **GET** /server/details/{serverId} | |
|[**serverControllerPatchCategory**](#servercontrollerpatchcategory) | **PATCH** /server/catgory/{id} | |
|[**serverControllerPatchDisk**](#servercontrollerpatchdisk) | **PATCH** /server/disk/{id} | |
|[**serverProcessControllerGetAll**](#serverprocesscontrollergetall) | **GET** /server/process/list | |
|[**serverProcessControllerGetAllLogs**](#serverprocesscontrollergetalllogs) | **GET** /server/process/{id}/logs | |
|[**serverProcessControllerGetOne**](#serverprocesscontrollergetone) | **GET** /server/process/{id} | |
|[**serverSettingsControllerGetSettings**](#serversettingscontrollergetsettings) | **GET** /server/settings | |
|[**serverSettingsControllerPutCommand**](#serversettingscontrollerputcommand) | **PATCH** /server/settings/{id} | |

# **serverCommandsControllerGetCommands**
> CommandListResponseDto serverCommandsControllerGetCommands()


### Example

```typescript
import {
    ServerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ServerApi(configuration);

let categoryId: string; // (default to undefined)

const { status, data } = await apiInstance.serverCommandsControllerGetCommands(
    categoryId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **categoryId** | [**string**] |  | defaults to undefined|


### Return type

**CommandListResponseDto**

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

# **serverCommandsControllerPutCommand**
> CommandResponseDto serverCommandsControllerPutCommand(patchServerCommandDto)


### Example

```typescript
import {
    ServerApi,
    Configuration,
    PatchServerCommandDto
} from './api';

const configuration = new Configuration();
const apiInstance = new ServerApi(configuration);

let id: string; // (default to undefined)
let patchServerCommandDto: PatchServerCommandDto; //

const { status, data } = await apiInstance.serverCommandsControllerPutCommand(
    id,
    patchServerCommandDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **patchServerCommandDto** | **PatchServerCommandDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**CommandResponseDto**

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

# **serverCommandsControllerStartServer**
> CommandExecuteResponseDto serverCommandsControllerStartServer()


### Example

```typescript
import {
    ServerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ServerApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.serverCommandsControllerStartServer(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**CommandExecuteResponseDto**

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

# **serverControllerGet**
> ServerResponseDto serverControllerGet()


### Example

```typescript
import {
    ServerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ServerApi(configuration);

let serverId: string; // (default to undefined)

const { status, data } = await apiInstance.serverControllerGet(
    serverId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **serverId** | [**string**] |  | defaults to undefined|


### Return type

**ServerResponseDto**

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

# **serverControllerGetAll**
> ServerListResponseDto serverControllerGetAll()


### Example

```typescript
import {
    ServerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ServerApi(configuration);

let take: number; // (default to undefined)
let skip: number; // (optional) (default to 0)

const { status, data } = await apiInstance.serverControllerGetAll(
    take,
    skip
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **take** | [**number**] |  | defaults to undefined|
| **skip** | [**number**] |  | (optional) defaults to 0|


### Return type

**ServerListResponseDto**

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

# **serverControllerGetDetails**
> ServerDetailsResponseDto serverControllerGetDetails()


### Example

```typescript
import {
    ServerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ServerApi(configuration);

let serverId: string; // (default to undefined)

const { status, data } = await apiInstance.serverControllerGetDetails(
    serverId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **serverId** | [**string**] |  | defaults to undefined|


### Return type

**ServerDetailsResponseDto**

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

# **serverControllerPatchCategory**
> serverControllerPatchCategory(patchCategorykDto)


### Example

```typescript
import {
    ServerApi,
    Configuration,
    PatchCategorykDto
} from './api';

const configuration = new Configuration();
const apiInstance = new ServerApi(configuration);

let id: string; // (default to undefined)
let patchCategorykDto: PatchCategorykDto; //

const { status, data } = await apiInstance.serverControllerPatchCategory(
    id,
    patchCategorykDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **patchCategorykDto** | **PatchCategorykDto**|  | |
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
|**200** | Changed correctly |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **serverControllerPatchDisk**
> serverControllerPatchDisk(patchDiskDto)


### Example

```typescript
import {
    ServerApi,
    Configuration,
    PatchDiskDto
} from './api';

const configuration = new Configuration();
const apiInstance = new ServerApi(configuration);

let id: string; // (default to undefined)
let patchDiskDto: PatchDiskDto; //

const { status, data } = await apiInstance.serverControllerPatchDisk(
    id,
    patchDiskDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **patchDiskDto** | **PatchDiskDto**|  | |
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
|**200** | Changed correctly |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **serverProcessControllerGetAll**
> ProcessListResponseDto serverProcessControllerGetAll()


### Example

```typescript
import {
    ServerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ServerApi(configuration);

let take: number; // (default to undefined)
let skip: number; // (optional) (default to 0)

const { status, data } = await apiInstance.serverProcessControllerGetAll(
    take,
    skip
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **take** | [**number**] |  | defaults to undefined|
| **skip** | [**number**] |  | (optional) defaults to 0|


### Return type

**ProcessListResponseDto**

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

# **serverProcessControllerGetAllLogs**
> ProcessLogListResponseDto serverProcessControllerGetAllLogs()


### Example

```typescript
import {
    ServerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ServerApi(configuration);

let id: string; // (default to undefined)
let take: number; // (default to undefined)
let skip: number; // (optional) (default to 0)

const { status, data } = await apiInstance.serverProcessControllerGetAllLogs(
    id,
    take,
    skip
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|
| **take** | [**number**] |  | defaults to undefined|
| **skip** | [**number**] |  | (optional) defaults to 0|


### Return type

**ProcessLogListResponseDto**

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

# **serverProcessControllerGetOne**
> ProcessResponseDto serverProcessControllerGetOne()


### Example

```typescript
import {
    ServerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ServerApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.serverProcessControllerGetOne(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**ProcessResponseDto**

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

# **serverSettingsControllerGetSettings**
> ServerSettingsListResponseDto serverSettingsControllerGetSettings()


### Example

```typescript
import {
    ServerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ServerApi(configuration);

let serverId: string; // (default to undefined)
let categoryId: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.serverSettingsControllerGetSettings(
    serverId,
    categoryId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **serverId** | [**string**] |  | defaults to undefined|
| **categoryId** | [**string**] |  | (optional) defaults to undefined|


### Return type

**ServerSettingsListResponseDto**

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

# **serverSettingsControllerPutCommand**
> ServerSettingsResponseDto serverSettingsControllerPutCommand(patchServerSettingDto)


### Example

```typescript
import {
    ServerApi,
    Configuration,
    PatchServerSettingDto
} from './api';

const configuration = new Configuration();
const apiInstance = new ServerApi(configuration);

let id: string; // (default to undefined)
let patchServerSettingDto: PatchServerSettingDto; //

const { status, data } = await apiInstance.serverSettingsControllerPutCommand(
    id,
    patchServerSettingDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **patchServerSettingDto** | **PatchServerSettingDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**ServerSettingsResponseDto**

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

