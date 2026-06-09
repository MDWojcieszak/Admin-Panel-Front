# BlogPOIApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**poiControllerAddImage**](#poicontrolleraddimage) | **POST** /blog/poi/{id}/images | |
|[**poiControllerCreate**](#poicontrollercreate) | **POST** /blog/poi | |
|[**poiControllerDelete**](#poicontrollerdelete) | **DELETE** /blog/poi/{id} | |
|[**poiControllerDeleteImage**](#poicontrollerdeleteimage) | **DELETE** /blog/poi/images/{imageId} | |
|[**poiControllerGetAdmin**](#poicontrollergetadmin) | **GET** /blog/poi/{id} | |
|[**poiControllerListAdmin**](#poicontrollerlistadmin) | **GET** /blog/poi/admin | |
|[**poiControllerListPublic**](#poicontrollerlistpublic) | **GET** /blog/poi | |
|[**poiControllerPatch**](#poicontrollerpatch) | **PATCH** /blog/poi/{id} | |
|[**poiControllerPatchImage**](#poicontrollerpatchimage) | **PATCH** /blog/poi/images/{imageId} | |
|[**poiControllerReorderImages**](#poicontrollerreorderimages) | **PATCH** /blog/poi/{id}/images/reorder | |
|[**poiControllerSetCategories**](#poicontrollersetcategories) | **PUT** /blog/poi/{id}/categories | |
|[**poiControllerSetHours**](#poicontrollersethours) | **PUT** /blog/poi/{id}/hours | |
|[**poiControllerUpsertTranslation**](#poicontrollerupserttranslation) | **PUT** /blog/poi/{id}/translations/{locale} | |

# **poiControllerAddImage**
> PoiAdminResponse poiControllerAddImage(addPoiImageDto)


### Example

```typescript
import {
    BlogPOIApi,
    Configuration,
    AddPoiImageDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogPOIApi(configuration);

let id: string; // (default to undefined)
let addPoiImageDto: AddPoiImageDto; //

const { status, data } = await apiInstance.poiControllerAddImage(
    id,
    addPoiImageDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **addPoiImageDto** | **AddPoiImageDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**PoiAdminResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Added POI image |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **poiControllerCreate**
> PoiAdminResponse poiControllerCreate(createPoiDto)


### Example

```typescript
import {
    BlogPOIApi,
    Configuration,
    CreatePoiDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogPOIApi(configuration);

let createPoiDto: CreatePoiDto; //

const { status, data } = await apiInstance.poiControllerCreate(
    createPoiDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createPoiDto** | **CreatePoiDto**|  | |


### Return type

**PoiAdminResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Created POI |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **poiControllerDelete**
> PoiAdminResponse poiControllerDelete()


### Example

```typescript
import {
    BlogPOIApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogPOIApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.poiControllerDelete(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**PoiAdminResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Deleted POI |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **poiControllerDeleteImage**
> PoiAdminResponse poiControllerDeleteImage()


### Example

```typescript
import {
    BlogPOIApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogPOIApi(configuration);

let imageId: string; // (default to undefined)

const { status, data } = await apiInstance.poiControllerDeleteImage(
    imageId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **imageId** | [**string**] |  | defaults to undefined|


### Return type

**PoiAdminResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Deleted POI image |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **poiControllerGetAdmin**
> PoiAdminResponse poiControllerGetAdmin()


### Example

```typescript
import {
    BlogPOIApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogPOIApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.poiControllerGetAdmin(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**PoiAdminResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Admin POI detail |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **poiControllerListAdmin**
> PoiAdminListResponse poiControllerListAdmin()


### Example

```typescript
import {
    BlogPOIApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogPOIApi(configuration);

let take: number; // (optional) (default to undefined)
let skip: number; // (optional) (default to 0)
let status: PoiStatus; // (optional) (default to undefined)
let category: string; //Category id or key (ATTRACTION). (optional) (default to undefined)
let region: string; // (optional) (default to undefined)
let country: string; // (optional) (default to undefined)
let search: string; //Name contains (case-insensitive). (optional) (default to undefined)

const { status, data } = await apiInstance.poiControllerListAdmin(
    take,
    skip,
    status,
    category,
    region,
    country,
    search
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **take** | [**number**] |  | (optional) defaults to undefined|
| **skip** | [**number**] |  | (optional) defaults to 0|
| **status** | **PoiStatus** |  | (optional) defaults to undefined|
| **category** | [**string**] | Category id or key (ATTRACTION). | (optional) defaults to undefined|
| **region** | [**string**] |  | (optional) defaults to undefined|
| **country** | [**string**] |  | (optional) defaults to undefined|
| **search** | [**string**] | Name contains (case-insensitive). | (optional) defaults to undefined|


### Return type

**PoiAdminListResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Admin POI list |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **poiControllerListPublic**
> PoiPublicListResponse poiControllerListPublic()


### Example

```typescript
import {
    BlogPOIApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogPOIApi(configuration);

let category: string; //Category id or key (ATTRACTION). (optional) (default to undefined)
let region: string; // (optional) (default to undefined)
let country: string; // (optional) (default to undefined)
let locale: string; // (optional) (default to undefined)
let includeClosed: boolean; //Include PERMANENTLY_CLOSED POIs. (optional) (default to undefined)
let take: number; // (optional) (default to undefined)
let skip: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.poiControllerListPublic(
    category,
    region,
    country,
    locale,
    includeClosed,
    take,
    skip
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **category** | [**string**] | Category id or key (ATTRACTION). | (optional) defaults to undefined|
| **region** | [**string**] |  | (optional) defaults to undefined|
| **country** | [**string**] |  | (optional) defaults to undefined|
| **locale** | [**string**] |  | (optional) defaults to undefined|
| **includeClosed** | [**boolean**] | Include PERMANENTLY_CLOSED POIs. | (optional) defaults to undefined|
| **take** | [**number**] |  | (optional) defaults to undefined|
| **skip** | [**number**] |  | (optional) defaults to undefined|


### Return type

**PoiPublicListResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Public POI map list |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **poiControllerPatch**
> PoiAdminResponse poiControllerPatch(patchPoiDto)


### Example

```typescript
import {
    BlogPOIApi,
    Configuration,
    PatchPoiDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogPOIApi(configuration);

let id: string; // (default to undefined)
let patchPoiDto: PatchPoiDto; //

const { status, data } = await apiInstance.poiControllerPatch(
    id,
    patchPoiDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **patchPoiDto** | **PatchPoiDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**PoiAdminResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Patched POI |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **poiControllerPatchImage**
> PoiAdminResponse poiControllerPatchImage(patchPoiImageDto)


### Example

```typescript
import {
    BlogPOIApi,
    Configuration,
    PatchPoiImageDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogPOIApi(configuration);

let imageId: string; // (default to undefined)
let patchPoiImageDto: PatchPoiImageDto; //

const { status, data } = await apiInstance.poiControllerPatchImage(
    imageId,
    patchPoiImageDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **patchPoiImageDto** | **PatchPoiImageDto**|  | |
| **imageId** | [**string**] |  | defaults to undefined|


### Return type

**PoiAdminResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Patched POI image |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **poiControllerReorderImages**
> PoiAdminResponse poiControllerReorderImages(reorderDto)


### Example

```typescript
import {
    BlogPOIApi,
    Configuration,
    ReorderDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogPOIApi(configuration);

let id: string; // (default to undefined)
let reorderDto: ReorderDto; //

const { status, data } = await apiInstance.poiControllerReorderImages(
    id,
    reorderDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **reorderDto** | **ReorderDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**PoiAdminResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Reordered POI images |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **poiControllerSetCategories**
> PoiAdminResponse poiControllerSetCategories(setPoiCategoriesDto)


### Example

```typescript
import {
    BlogPOIApi,
    Configuration,
    SetPoiCategoriesDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogPOIApi(configuration);

let id: string; // (default to undefined)
let setPoiCategoriesDto: SetPoiCategoriesDto; //

const { status, data } = await apiInstance.poiControllerSetCategories(
    id,
    setPoiCategoriesDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **setPoiCategoriesDto** | **SetPoiCategoriesDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**PoiAdminResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Replaced POI categories |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **poiControllerSetHours**
> PoiAdminResponse poiControllerSetHours(setPoiHoursDto)


### Example

```typescript
import {
    BlogPOIApi,
    Configuration,
    SetPoiHoursDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogPOIApi(configuration);

let id: string; // (default to undefined)
let setPoiHoursDto: SetPoiHoursDto; //

const { status, data } = await apiInstance.poiControllerSetHours(
    id,
    setPoiHoursDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **setPoiHoursDto** | **SetPoiHoursDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**PoiAdminResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Replaced POI hours |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **poiControllerUpsertTranslation**
> PoiAdminResponse poiControllerUpsertTranslation(upsertPoiTranslationDto)


### Example

```typescript
import {
    BlogPOIApi,
    Configuration,
    UpsertPoiTranslationDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogPOIApi(configuration);

let id: string; // (default to undefined)
let locale: string; // (default to undefined)
let upsertPoiTranslationDto: UpsertPoiTranslationDto; //

const { status, data } = await apiInstance.poiControllerUpsertTranslation(
    id,
    locale,
    upsertPoiTranslationDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **upsertPoiTranslationDto** | **UpsertPoiTranslationDto**|  | |
| **id** | [**string**] |  | defaults to undefined|
| **locale** | [**string**] |  | defaults to undefined|


### Return type

**PoiAdminResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Upserted POI translation |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

