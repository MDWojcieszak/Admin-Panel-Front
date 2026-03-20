# PhotoEntryApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**photoEntryControllerCreate**](#photoentrycontrollercreate) | **POST** /photo-entry | |
|[**photoEntryControllerCreateFolders**](#photoentrycontrollercreatefolders) | **POST** /photo-entry/{id}/create-folders | |
|[**photoEntryControllerDelete**](#photoentrycontrollerdelete) | **DELETE** /photo-entry/{id} | |
|[**photoEntryControllerGetById**](#photoentrycontrollergetbyid) | **GET** /photo-entry/{id} | |
|[**photoEntryControllerList**](#photoentrycontrollerlist) | **GET** /photo-entry | |
|[**photoEntryControllerMarkMediaUploaded**](#photoentrycontrollermarkmediauploaded) | **POST** /photo-entry/{id}/mark-media-uploaded | |
|[**photoEntryControllerPatch**](#photoentrycontrollerpatch) | **PATCH** /photo-entry/{id} | |
|[**photoEntryControllerPatchStatus**](#photoentrycontrollerpatchstatus) | **PATCH** /photo-entry/{id}/status | |

# **photoEntryControllerCreate**
> PhotoEntryResponse photoEntryControllerCreate(createPhotoEntryDto)


### Example

```typescript
import {
    PhotoEntryApi,
    Configuration,
    CreatePhotoEntryDto
} from './api';

const configuration = new Configuration();
const apiInstance = new PhotoEntryApi(configuration);

let createPhotoEntryDto: CreatePhotoEntryDto; //

const { status, data } = await apiInstance.photoEntryControllerCreate(
    createPhotoEntryDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createPhotoEntryDto** | **CreatePhotoEntryDto**|  | |


### Return type

**PhotoEntryResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Created photo entry |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **photoEntryControllerCreateFolders**
> PhotoEntryResponse photoEntryControllerCreateFolders()


### Example

```typescript
import {
    PhotoEntryApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PhotoEntryApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.photoEntryControllerCreateFolders(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**PhotoEntryResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Created photo entry folders |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **photoEntryControllerDelete**
> PhotoEntryResponse photoEntryControllerDelete()


### Example

```typescript
import {
    PhotoEntryApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PhotoEntryApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.photoEntryControllerDelete(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**PhotoEntryResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Deleted photo entry |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **photoEntryControllerGetById**
> PhotoEntryDetailsResponse photoEntryControllerGetById()


### Example

```typescript
import {
    PhotoEntryApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PhotoEntryApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.photoEntryControllerGetById(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**PhotoEntryDetailsResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Photo entry details |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **photoEntryControllerList**
> PhotoEntryListResponse photoEntryControllerList()


### Example

```typescript
import {
    PhotoEntryApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PhotoEntryApi(configuration);

let type: PhotoEntryType; // (optional) (default to undefined)
let status: PhotoEntryStatus; // (optional) (default to undefined)
let astroObjectId: string; // (optional) (default to undefined)
let search: string; // (optional) (default to undefined)
let take: number; // (optional) (default to undefined)
let skip: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.photoEntryControllerList(
    type,
    status,
    astroObjectId,
    search,
    take,
    skip
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **type** | **PhotoEntryType** |  | (optional) defaults to undefined|
| **status** | **PhotoEntryStatus** |  | (optional) defaults to undefined|
| **astroObjectId** | [**string**] |  | (optional) defaults to undefined|
| **search** | [**string**] |  | (optional) defaults to undefined|
| **take** | [**number**] |  | (optional) defaults to undefined|
| **skip** | [**number**] |  | (optional) defaults to undefined|


### Return type

**PhotoEntryListResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | List photo entries |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **photoEntryControllerMarkMediaUploaded**
> PhotoEntryResponse photoEntryControllerMarkMediaUploaded()


### Example

```typescript
import {
    PhotoEntryApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PhotoEntryApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.photoEntryControllerMarkMediaUploaded(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**PhotoEntryResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Created photo entry folders |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **photoEntryControllerPatch**
> PhotoEntryResponse photoEntryControllerPatch(patchPhotoEntryDto)


### Example

```typescript
import {
    PhotoEntryApi,
    Configuration,
    PatchPhotoEntryDto
} from './api';

const configuration = new Configuration();
const apiInstance = new PhotoEntryApi(configuration);

let id: string; // (default to undefined)
let patchPhotoEntryDto: PatchPhotoEntryDto; //

const { status, data } = await apiInstance.photoEntryControllerPatch(
    id,
    patchPhotoEntryDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **patchPhotoEntryDto** | **PatchPhotoEntryDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**PhotoEntryResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Patched photo entry |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **photoEntryControllerPatchStatus**
> PhotoEntryResponse photoEntryControllerPatchStatus(patchPhotoEntryStatusDto)


### Example

```typescript
import {
    PhotoEntryApi,
    Configuration,
    PatchPhotoEntryStatusDto
} from './api';

const configuration = new Configuration();
const apiInstance = new PhotoEntryApi(configuration);

let id: string; // (default to undefined)
let patchPhotoEntryStatusDto: PatchPhotoEntryStatusDto; //

const { status, data } = await apiInstance.photoEntryControllerPatchStatus(
    id,
    patchPhotoEntryStatusDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **patchPhotoEntryStatusDto** | **PatchPhotoEntryStatusDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**PhotoEntryResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Patched photo entry status |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

