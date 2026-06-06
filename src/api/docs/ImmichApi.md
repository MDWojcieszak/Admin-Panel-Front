# ImmichApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**immichControllerCreateAlbum**](#immichcontrollercreatealbum) | **POST** /immich/album/create | |
|[**immichControllerGetStatus**](#immichcontrollergetstatus) | **GET** /immich/status | |
|[**immichControllerRefreshAlbum**](#immichcontrollerrefreshalbum) | **POST** /immich/album/refresh | |

# **immichControllerCreateAlbum**
> ImmichAlbumSyncResponse immichControllerCreateAlbum(createImmichAlbumDto)


### Example

```typescript
import {
    ImmichApi,
    Configuration,
    CreateImmichAlbumDto
} from './api';

const configuration = new Configuration();
const apiInstance = new ImmichApi(configuration);

let createImmichAlbumDto: CreateImmichAlbumDto; //

const { status, data } = await apiInstance.immichControllerCreateAlbum(
    createImmichAlbumDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createImmichAlbumDto** | **CreateImmichAlbumDto**|  | |


### Return type

**ImmichAlbumSyncResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Created Immich album |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **immichControllerGetStatus**
> ImmichStatusResponse immichControllerGetStatus()


### Example

```typescript
import {
    ImmichApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ImmichApi(configuration);

const { status, data } = await apiInstance.immichControllerGetStatus();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**ImmichStatusResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Immich connection status |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **immichControllerRefreshAlbum**
> ImmichAlbumSyncResponse immichControllerRefreshAlbum(refreshImmichAlbumDto)


### Example

```typescript
import {
    ImmichApi,
    Configuration,
    RefreshImmichAlbumDto
} from './api';

const configuration = new Configuration();
const apiInstance = new ImmichApi(configuration);

let refreshImmichAlbumDto: RefreshImmichAlbumDto; //

const { status, data } = await apiInstance.immichControllerRefreshAlbum(
    refreshImmichAlbumDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **refreshImmichAlbumDto** | **RefreshImmichAlbumDto**|  | |


### Return type

**ImmichAlbumSyncResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Refreshed Immich album |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

