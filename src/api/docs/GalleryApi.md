# GalleryApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**galleryControllerGetAll**](#gallerycontrollergetall) | **GET** /gallery/all | |
|[**galleryControllerGetCoverImage**](#gallerycontrollergetcoverimage) | **GET** /gallery/cover | |
|[**galleryControllerGetLowResImage**](#gallerycontrollergetlowresimage) | **GET** /gallery/low-res | |

# **galleryControllerGetAll**
> GalleryResponseDto galleryControllerGetAll()


### Example

```typescript
import {
    GalleryApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GalleryApi(configuration);

const { status, data } = await apiInstance.galleryControllerGetAll();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**GalleryResponseDto**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **galleryControllerGetCoverImage**
> galleryControllerGetCoverImage()


### Example

```typescript
import {
    GalleryApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GalleryApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.galleryControllerGetCoverImage(
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

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **galleryControllerGetLowResImage**
> galleryControllerGetLowResImage()


### Example

```typescript
import {
    GalleryApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GalleryApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.galleryControllerGetLowResImage(
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

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

