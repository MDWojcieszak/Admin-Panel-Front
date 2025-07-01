# ImageApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**imageControllerCreate**](#imagecontrollercreate) | **POST** /image/create | |
|[**imageControllerDelete**](#imagecontrollerdelete) | **DELETE** /image | |
|[**imageControllerGet**](#imagecontrollerget) | **GET** /image | |
|[**imageControllerGetCoverImage**](#imagecontrollergetcoverimage) | **GET** /image/cover | |
|[**imageControllerGetList**](#imagecontrollergetlist) | **GET** /image/list | |
|[**imageControllerGetLowResImage**](#imagecontrollergetlowresimage) | **GET** /image/low-res | |
|[**imageControllerGetOriginalImage**](#imagecontrollergetoriginalimage) | **GET** /image/original | |
|[**imageControllerUpdate**](#imagecontrollerupdate) | **PUT** /image | |

# **imageControllerCreate**
> ImageDataResponseDto imageControllerCreate(imageDataDto)


### Example

```typescript
import {
    ImageApi,
    Configuration,
    ImageDataDto
} from './api';

const configuration = new Configuration();
const apiInstance = new ImageApi(configuration);

let imageDataDto: ImageDataDto; //

const { status, data } = await apiInstance.imageControllerCreate(
    imageDataDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **imageDataDto** | **ImageDataDto**|  | |


### Return type

**ImageDataResponseDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Create image metadata |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **imageControllerDelete**
> imageControllerDelete()


### Example

```typescript
import {
    ImageApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ImageApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.imageControllerDelete(
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
|**200** | Delete image |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **imageControllerGet**
> ImageDataResponseDto imageControllerGet()


### Example

```typescript
import {
    ImageApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ImageApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.imageControllerGet(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**ImageDataResponseDto**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Get single image metadata |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **imageControllerGetCoverImage**
> File imageControllerGetCoverImage()


### Example

```typescript
import {
    ImageApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ImageApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.imageControllerGetCoverImage(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**File**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: image/*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Get image cover file stream |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **imageControllerGetList**
> ImageListResponseDto imageControllerGetList()


### Example

```typescript
import {
    ImageApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ImageApi(configuration);

let take: number; // (default to undefined)
let skip: number; // (optional) (default to 0)

const { status, data } = await apiInstance.imageControllerGetList(
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

**ImageListResponseDto**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | List of image data with pagination |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **imageControllerGetLowResImage**
> File imageControllerGetLowResImage()


### Example

```typescript
import {
    ImageApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ImageApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.imageControllerGetLowResImage(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**File**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: image/*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Get low resolution image stream |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **imageControllerGetOriginalImage**
> File imageControllerGetOriginalImage()


### Example

```typescript
import {
    ImageApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ImageApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.imageControllerGetOriginalImage(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**File**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: image/*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Get original image file stream |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **imageControllerUpdate**
> ImageDataResponseDto imageControllerUpdate()


### Example

```typescript
import {
    ImageApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ImageApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.imageControllerUpdate(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**ImageDataResponseDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Update image metadata |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

