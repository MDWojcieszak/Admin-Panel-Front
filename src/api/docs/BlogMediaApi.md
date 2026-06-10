# BlogMediaApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**mediaControllerCreateAlbum**](#mediacontrollercreatealbum) | **POST** /blog/media/albums | |
|[**mediaControllerDeleteAlbum**](#mediacontrollerdeletealbum) | **DELETE** /blog/media/albums/{id} | |
|[**mediaControllerDeleteImage**](#mediacontrollerdeleteimage) | **DELETE** /blog/media/images/{id} | |
|[**mediaControllerGetAlbum**](#mediacontrollergetalbum) | **GET** /blog/media/albums/{id} | |
|[**mediaControllerGetImage**](#mediacontrollergetimage) | **GET** /blog/media/images/{id} | |
|[**mediaControllerList**](#mediacontrollerlist) | **GET** /blog/media | |
|[**mediaControllerListAlbums**](#mediacontrollerlistalbums) | **GET** /blog/media/albums | |
|[**mediaControllerPatchAlbum**](#mediacontrollerpatchalbum) | **PATCH** /blog/media/albums/{id} | |
|[**mediaControllerSetAlbumItems**](#mediacontrollersetalbumitems) | **PUT** /blog/media/albums/{id}/items | |
|[**mediaControllerUpload**](#mediacontrollerupload) | **POST** /blog/media/upload | |

# **mediaControllerCreateAlbum**
> BlogMediaAlbumResponse mediaControllerCreateAlbum(createBlogAlbumDto)


### Example

```typescript
import {
    BlogMediaApi,
    Configuration,
    CreateBlogAlbumDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogMediaApi(configuration);

let createBlogAlbumDto: CreateBlogAlbumDto; //

const { status, data } = await apiInstance.mediaControllerCreateAlbum(
    createBlogAlbumDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createBlogAlbumDto** | **CreateBlogAlbumDto**|  | |


### Return type

**BlogMediaAlbumResponse**

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

# **mediaControllerDeleteAlbum**
> UploadResponseDto mediaControllerDeleteAlbum()


### Example

```typescript
import {
    BlogMediaApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogMediaApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.mediaControllerDeleteAlbum(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**UploadResponseDto**

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

# **mediaControllerDeleteImage**
> UploadResponseDto mediaControllerDeleteImage()


### Example

```typescript
import {
    BlogMediaApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogMediaApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.mediaControllerDeleteImage(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**UploadResponseDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Deleted a blog image (409 if still in use) |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **mediaControllerGetAlbum**
> BlogMediaAlbumResponse mediaControllerGetAlbum()


### Example

```typescript
import {
    BlogMediaApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogMediaApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.mediaControllerGetAlbum(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**BlogMediaAlbumResponse**

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

# **mediaControllerGetImage**
> BlogMediaImageResponse mediaControllerGetImage()


### Example

```typescript
import {
    BlogMediaApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogMediaApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.mediaControllerGetImage(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**BlogMediaImageResponse**

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

# **mediaControllerList**
> BlogMediaListResponse mediaControllerList()


### Example

```typescript
import {
    BlogMediaApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogMediaApi(configuration);

let take: number; // (optional) (default to undefined)
let skip: number; // (optional) (default to 0)

const { status, data } = await apiInstance.mediaControllerList(
    take,
    skip
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **take** | [**number**] |  | (optional) defaults to undefined|
| **skip** | [**number**] |  | (optional) defaults to 0|


### Return type

**BlogMediaListResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Blog media library (paginated) |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **mediaControllerListAlbums**
> BlogMediaAlbumListResponse mediaControllerListAlbums()


### Example

```typescript
import {
    BlogMediaApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogMediaApi(configuration);

let take: number; // (optional) (default to undefined)
let skip: number; // (optional) (default to 0)

const { status, data } = await apiInstance.mediaControllerListAlbums(
    take,
    skip
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **take** | [**number**] |  | (optional) defaults to undefined|
| **skip** | [**number**] |  | (optional) defaults to 0|


### Return type

**BlogMediaAlbumListResponse**

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

# **mediaControllerPatchAlbum**
> BlogMediaAlbumResponse mediaControllerPatchAlbum(patchBlogAlbumDto)


### Example

```typescript
import {
    BlogMediaApi,
    Configuration,
    PatchBlogAlbumDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogMediaApi(configuration);

let id: string; // (default to undefined)
let patchBlogAlbumDto: PatchBlogAlbumDto; //

const { status, data } = await apiInstance.mediaControllerPatchAlbum(
    id,
    patchBlogAlbumDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **patchBlogAlbumDto** | **PatchBlogAlbumDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**BlogMediaAlbumResponse**

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

# **mediaControllerSetAlbumItems**
> BlogMediaAlbumResponse mediaControllerSetAlbumItems(setBlogAlbumItemsDto)


### Example

```typescript
import {
    BlogMediaApi,
    Configuration,
    SetBlogAlbumItemsDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogMediaApi(configuration);

let id: string; // (default to undefined)
let setBlogAlbumItemsDto: SetBlogAlbumItemsDto; //

const { status, data } = await apiInstance.mediaControllerSetAlbumItems(
    id,
    setBlogAlbumItemsDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **setBlogAlbumItemsDto** | **SetBlogAlbumItemsDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**BlogMediaAlbumResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Replaced album items (BLOG-scoped images only) |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **mediaControllerUpload**
> UploadResponseDto mediaControllerUpload()


### Example

```typescript
import {
    BlogMediaApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogMediaApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.mediaControllerUpload(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**UploadResponseDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: multipart/form-data
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Uploaded a BLOG-scoped image |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

