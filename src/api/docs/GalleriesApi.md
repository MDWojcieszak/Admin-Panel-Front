# GalleriesApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**galleriesControllerCreate**](#galleriescontrollercreate) | **POST** /galleries | |
|[**galleriesControllerDelete**](#galleriescontrollerdelete) | **DELETE** /galleries/{id} | |
|[**galleriesControllerGetById**](#galleriescontrollergetbyid) | **GET** /galleries/{id} | |
|[**galleriesControllerGetHero**](#galleriescontrollergethero) | **GET** /galleries/hero | |
|[**galleriesControllerImportExisting**](#galleriescontrollerimportexisting) | **POST** /galleries/import-existing | |
|[**galleriesControllerLibrary**](#galleriescontrollerlibrary) | **GET** /galleries/library | |
|[**galleriesControllerList**](#galleriescontrollerlist) | **GET** /galleries | |
|[**galleriesControllerPatchStatus**](#galleriescontrollerpatchstatus) | **PATCH** /galleries/{id}/status | |
|[**galleriesControllerReorder**](#galleriescontrollerreorder) | **PUT** /galleries/order | |
|[**galleriesControllerSetHero**](#galleriescontrollersethero) | **PUT** /galleries/hero | |
|[**galleriesControllerSetItems**](#galleriescontrollersetitems) | **PUT** /galleries/{id}/items | |
|[**galleriesControllerUpdate**](#galleriescontrollerupdate) | **PATCH** /galleries/{id} | |

# **galleriesControllerCreate**
> GalleryResponse galleriesControllerCreate(createGalleryDto)


### Example

```typescript
import {
    GalleriesApi,
    Configuration,
    CreateGalleryDto
} from './api';

const configuration = new Configuration();
const apiInstance = new GalleriesApi(configuration);

let createGalleryDto: CreateGalleryDto; //

const { status, data } = await apiInstance.galleriesControllerCreate(
    createGalleryDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createGalleryDto** | **CreateGalleryDto**|  | |


### Return type

**GalleryResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Create a gallery (DRAFT) |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **galleriesControllerDelete**
> galleriesControllerDelete()


### Example

```typescript
import {
    GalleriesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GalleriesApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.galleriesControllerDelete(
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
|**200** | Delete gallery (images are kept) |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **galleriesControllerGetById**
> GalleryDetailResponse galleriesControllerGetById()


### Example

```typescript
import {
    GalleriesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GalleriesApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.galleriesControllerGetById(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**GalleryDetailResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Gallery with ordered items (admin preview) |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **galleriesControllerGetHero**
> PortfolioHeroResponse galleriesControllerGetHero()


### Example

```typescript
import {
    GalleriesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GalleriesApi(configuration);

const { status, data } = await apiInstance.galleriesControllerGetHero();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**PortfolioHeroResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Current homepage hero selection (curated order) |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **galleriesControllerImportExisting**
> GalleryDetailResponse galleriesControllerImportExisting()


### Example

```typescript
import {
    GalleriesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GalleriesApi(configuration);

const { status, data } = await apiInstance.galleriesControllerImportExisting();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**GalleryDetailResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Collect ungrouped gallery images into a DRAFT import gallery |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **galleriesControllerLibrary**
> GalleryLibraryResponse galleriesControllerLibrary()


### Example

```typescript
import {
    GalleriesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GalleriesApi(configuration);

let take: number; // (optional) (default to undefined)
let skip: number; // (optional) (default to undefined)
let unassignedOnly: boolean; // (optional) (default to undefined)

const { status, data } = await apiInstance.galleriesControllerLibrary(
    take,
    skip,
    unassignedOnly
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **take** | [**number**] |  | (optional) defaults to undefined|
| **skip** | [**number**] |  | (optional) defaults to undefined|
| **unassignedOnly** | [**boolean**] |  | (optional) defaults to undefined|


### Return type

**GalleryLibraryResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Image picker: all gallery images (used or not) with usage count |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **galleriesControllerList**
> GalleryListResponse galleriesControllerList()


### Example

```typescript
import {
    GalleriesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GalleriesApi(configuration);

const { status, data } = await apiInstance.galleriesControllerList();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**GalleryListResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | List all galleries |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **galleriesControllerPatchStatus**
> GalleryResponse galleriesControllerPatchStatus(patchGalleryStatusDto)


### Example

```typescript
import {
    GalleriesApi,
    Configuration,
    PatchGalleryStatusDto
} from './api';

const configuration = new Configuration();
const apiInstance = new GalleriesApi(configuration);

let id: string; // (default to undefined)
let patchGalleryStatusDto: PatchGalleryStatusDto; //

const { status, data } = await apiInstance.galleriesControllerPatchStatus(
    id,
    patchGalleryStatusDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **patchGalleryStatusDto** | **PatchGalleryStatusDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**GalleryResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Change gallery status |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **galleriesControllerReorder**
> GalleryListResponse galleriesControllerReorder(reorderGalleriesDto)


### Example

```typescript
import {
    GalleriesApi,
    Configuration,
    ReorderGalleriesDto
} from './api';

const configuration = new Configuration();
const apiInstance = new GalleriesApi(configuration);

let reorderGalleriesDto: ReorderGalleriesDto; //

const { status, data } = await apiInstance.galleriesControllerReorder(
    reorderGalleriesDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **reorderGalleriesDto** | **ReorderGalleriesDto**|  | |


### Return type

**GalleryListResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Reorder galleries in the portfolio |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **galleriesControllerSetHero**
> PortfolioHeroResponse galleriesControllerSetHero(setHeroDto)


### Example

```typescript
import {
    GalleriesApi,
    Configuration,
    SetHeroDto
} from './api';

const configuration = new Configuration();
const apiInstance = new GalleriesApi(configuration);

let setHeroDto: SetHeroDto; //

const { status, data } = await apiInstance.galleriesControllerSetHero(
    setHeroDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **setHeroDto** | **SetHeroDto**|  | |


### Return type

**PortfolioHeroResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Replace the homepage hero selection (drag &amp; drop) |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **galleriesControllerSetItems**
> GalleryDetailResponse galleriesControllerSetItems(setGalleryItemsDto)


### Example

```typescript
import {
    GalleriesApi,
    Configuration,
    SetGalleryItemsDto
} from './api';

const configuration = new Configuration();
const apiInstance = new GalleriesApi(configuration);

let id: string; // (default to undefined)
let setGalleryItemsDto: SetGalleryItemsDto; //

const { status, data } = await apiInstance.galleriesControllerSetItems(
    id,
    setGalleryItemsDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **setGalleryItemsDto** | **SetGalleryItemsDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**GalleryDetailResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Replace the ordered image set (drag &amp; drop + roles) |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **galleriesControllerUpdate**
> GalleryResponse galleriesControllerUpdate(updateGalleryDto)


### Example

```typescript
import {
    GalleriesApi,
    Configuration,
    UpdateGalleryDto
} from './api';

const configuration = new Configuration();
const apiInstance = new GalleriesApi(configuration);

let id: string; // (default to undefined)
let updateGalleryDto: UpdateGalleryDto; //

const { status, data } = await apiInstance.galleriesControllerUpdate(
    id,
    updateGalleryDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateGalleryDto** | **UpdateGalleryDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**GalleryResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Update gallery |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

