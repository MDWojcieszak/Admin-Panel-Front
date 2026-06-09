# BlogVersioningApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**versionControllerArchive**](#versioncontrollerarchive) | **POST** /blog/posts/{id}/archive | |
|[**versionControllerListVersions**](#versioncontrollerlistversions) | **GET** /blog/posts/{id}/versions | |
|[**versionControllerPruneVersion**](#versioncontrollerpruneversion) | **DELETE** /blog/posts/{id}/versions/{versionId} | |
|[**versionControllerPublish**](#versioncontrollerpublish) | **POST** /blog/posts/{id}/publish | |
|[**versionControllerRestore**](#versioncontrollerrestore) | **POST** /blog/posts/{id}/restore | |
|[**versionControllerRollback**](#versioncontrollerrollback) | **POST** /blog/posts/{id}/rollback | |
|[**versionControllerSchedule**](#versioncontrollerschedule) | **POST** /blog/posts/{id}/schedule | |
|[**versionControllerUnpublish**](#versioncontrollerunpublish) | **POST** /blog/posts/{id}/unpublish | |

# **versionControllerArchive**
> PostResponse versionControllerArchive()


### Example

```typescript
import {
    BlogVersioningApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogVersioningApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.versionControllerArchive(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**PostResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Archived post |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **versionControllerListVersions**
> VersionListResponse versionControllerListVersions()


### Example

```typescript
import {
    BlogVersioningApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogVersioningApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.versionControllerListVersions(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**VersionListResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Version history |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **versionControllerPruneVersion**
> VersionListResponse versionControllerPruneVersion()


### Example

```typescript
import {
    BlogVersioningApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogVersioningApi(configuration);

let id: string; // (default to undefined)
let versionId: string; // (default to undefined)

const { status, data } = await apiInstance.versionControllerPruneVersion(
    id,
    versionId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|
| **versionId** | [**string**] |  | defaults to undefined|


### Return type

**VersionListResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Pruned an ARCHIVED version |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **versionControllerPublish**
> PostResponse versionControllerPublish()


### Example

```typescript
import {
    BlogVersioningApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogVersioningApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.versionControllerPublish(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**PostResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Published post |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **versionControllerRestore**
> PostResponse versionControllerRestore()


### Example

```typescript
import {
    BlogVersioningApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogVersioningApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.versionControllerRestore(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**PostResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Restored post |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **versionControllerRollback**
> PostResponse versionControllerRollback(rollbackDto)


### Example

```typescript
import {
    BlogVersioningApi,
    Configuration,
    RollbackDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogVersioningApi(configuration);

let id: string; // (default to undefined)
let rollbackDto: RollbackDto; //

const { status, data } = await apiInstance.versionControllerRollback(
    id,
    rollbackDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **rollbackDto** | **RollbackDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**PostResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Rolled back post |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **versionControllerSchedule**
> PostResponse versionControllerSchedule(scheduleDto)


### Example

```typescript
import {
    BlogVersioningApi,
    Configuration,
    ScheduleDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogVersioningApi(configuration);

let id: string; // (default to undefined)
let scheduleDto: ScheduleDto; //

const { status, data } = await apiInstance.versionControllerSchedule(
    id,
    scheduleDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **scheduleDto** | **ScheduleDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**PostResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Scheduled post |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **versionControllerUnpublish**
> PostResponse versionControllerUnpublish()


### Example

```typescript
import {
    BlogVersioningApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogVersioningApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.versionControllerUnpublish(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**PostResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Unpublished post |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

