# GalleryDeprecatedApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**galleryControllerGetAll**](#gallerycontrollergetall) | **GET** /gallery/all | Flat listing of published gallery images (legacy)|
|[**galleryControllerGetCoverImage**](#gallerycontrollergetcoverimage) | **GET** /gallery/cover | Cover image stream (legacy)|
|[**galleryControllerGetLowResImage**](#gallerycontrollergetlowresimage) | **GET** /gallery/low-res | Low-resolution image stream (legacy)|

# **galleryControllerGetAll**
> GalleryResponseDto galleryControllerGetAll()

Superseded by `GET /portfolio/galleries`. Returns only images belonging to a PUBLISHED gallery and not marked HIDDEN there — unlike the original implementation, which dumped every gallery image regardless of state.

### Example

```typescript
import {
    GalleryDeprecatedApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GalleryDeprecatedApi(configuration);

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

Superseded by `GET /image/cover`. Identical output.

### Example

```typescript
import {
    GalleryDeprecatedApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GalleryDeprecatedApi(configuration);

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

Superseded by `GET /image/low-res`. Identical output.

### Example

```typescript
import {
    GalleryDeprecatedApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GalleryDeprecatedApi(configuration);

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

