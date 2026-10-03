# GearApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**gearControllerCreate**](#gearcontrollercreate) | **POST** /gear | |
|[**gearControllerCreateKit**](#gearcontrollercreatekit) | **POST** /gear/kits | |
|[**gearControllerCreateSystem**](#gearcontrollercreatesystem) | **POST** /gear/systems | |
|[**gearControllerGetItem**](#gearcontrollergetitem) | **GET** /gear/{id} | |
|[**gearControllerGetKit**](#gearcontrollergetkit) | **GET** /gear/kits/{id} | |
|[**gearControllerList**](#gearcontrollerlist) | **GET** /gear | |
|[**gearControllerListCategories**](#gearcontrollerlistcategories) | **GET** /gear/categories | |
|[**gearControllerListImages**](#gearcontrollerlistimages) | **GET** /gear/images | Gear photos to pick from|
|[**gearControllerListItems**](#gearcontrollerlistitems) | **GET** /gear/items | |
|[**gearControllerListKits**](#gearcontrollerlistkits) | **GET** /gear/kits | |
|[**gearControllerRemove**](#gearcontrollerremove) | **DELETE** /gear/{id} | |
|[**gearControllerRemoveKit**](#gearcontrollerremovekit) | **DELETE** /gear/kits/{id} | |
|[**gearControllerRemoveSystem**](#gearcontrollerremovesystem) | **DELETE** /gear/systems/{id} | |
|[**gearControllerReorder**](#gearcontrollerreorder) | **PUT** /gear/order | |
|[**gearControllerReorderSystems**](#gearcontrollerreordersystems) | **PUT** /gear/systems/order | |
|[**gearControllerUpdate**](#gearcontrollerupdate) | **PATCH** /gear/{id} | |
|[**gearControllerUpdateKit**](#gearcontrollerupdatekit) | **PATCH** /gear/kits/{id} | |
|[**gearControllerUpdateSystem**](#gearcontrollerupdatesystem) | **PATCH** /gear/systems/{id} | |
|[**gearControllerUploadImage**](#gearcontrolleruploadimage) | **POST** /gear/images | Upload a gear photo|

# **gearControllerCreate**
> GearItemAdminResponse gearControllerCreate(createGearDto)


### Example

```typescript
import {
    GearApi,
    Configuration,
    CreateGearDto
} from './api';

const configuration = new Configuration();
const apiInstance = new GearApi(configuration);

let createGearDto: CreateGearDto; //

const { status, data } = await apiInstance.gearControllerCreate(
    createGearDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createGearDto** | **CreateGearDto**|  | |


### Return type

**GearItemAdminResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Create a gear item |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **gearControllerCreateKit**
> GearKitResponse gearControllerCreateKit(createGearKitDto)


### Example

```typescript
import {
    GearApi,
    Configuration,
    CreateGearKitDto
} from './api';

const configuration = new Configuration();
const apiInstance = new GearApi(configuration);

let createGearKitDto: CreateGearKitDto; //

const { status, data } = await apiInstance.gearControllerCreateKit(
    createGearKitDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createGearKitDto** | **CreateGearKitDto**|  | |


### Return type

**GearKitResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Create a gear kit |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **gearControllerCreateSystem**
> GearSystemResponse gearControllerCreateSystem(createGearSystemDto)


### Example

```typescript
import {
    GearApi,
    Configuration,
    CreateGearSystemDto
} from './api';

const configuration = new Configuration();
const apiInstance = new GearApi(configuration);

let createGearSystemDto: CreateGearSystemDto; //

const { status, data } = await apiInstance.gearControllerCreateSystem(
    createGearSystemDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createGearSystemDto** | **CreateGearSystemDto**|  | |


### Return type

**GearSystemResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Create a camera system |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **gearControllerGetItem**
> GearItemAdminResponse gearControllerGetItem()


### Example

```typescript
import {
    GearApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GearApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.gearControllerGetItem(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**GearItemAdminResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Gear item |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **gearControllerGetKit**
> GearKitResponse gearControllerGetKit()


### Example

```typescript
import {
    GearApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GearApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.gearControllerGetKit(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**GearKitResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Gear kit |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **gearControllerList**
> GearOverviewResponse gearControllerList()


### Example

```typescript
import {
    GearApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GearApi(configuration);

const { status, data } = await apiInstance.gearControllerList();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**GearOverviewResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | All gear (systems + items), including hidden |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **gearControllerListCategories**
> Array<GearCategoryResponse> gearControllerListCategories()


### Example

```typescript
import {
    GearApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GearApi(configuration);

const { status, data } = await apiInstance.gearControllerListCategories();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<GearCategoryResponse>**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Gear categories with their media source |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **gearControllerListImages**
> GearImageListResponse gearControllerListImages()

Reuse one photo for identical items. `usedBy` shows which gear already shows it; `search` matches that gear by brand/model; `unusedOnly` lists uploads not attached yet. Gallery photos appear only if gear uses them.

### Example

```typescript
import {
    GearApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GearApi(configuration);

let take: number; // (optional) (default to undefined)
let skip: number; // (optional) (default to 0)
let search: string; // (optional) (default to undefined)
let unusedOnly: boolean; // (optional) (default to undefined)

const { status, data } = await apiInstance.gearControllerListImages(
    take,
    skip,
    search,
    unusedOnly
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **take** | [**number**] |  | (optional) defaults to undefined|
| **skip** | [**number**] |  | (optional) defaults to 0|
| **search** | [**string**] |  | (optional) defaults to undefined|
| **unusedOnly** | [**boolean**] |  | (optional) defaults to undefined|


### Return type

**GearImageListResponse**

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

# **gearControllerListItems**
> GearItemListResponse gearControllerListItems()


### Example

```typescript
import {
    GearApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GearApi(configuration);

let ownership: GearOwnership; // (optional) (default to undefined)
let category: GearCategory; // (optional) (default to undefined)
let sort: GearItemsSort; // (optional) (default to undefined)
let neededWithinDays: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.gearControllerListItems(
    ownership,
    category,
    sort,
    neededWithinDays
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **ownership** | **GearOwnership** |  | (optional) defaults to undefined|
| **category** | **GearCategory** |  | (optional) defaults to undefined|
| **sort** | **GearItemsSort** |  | (optional) defaults to undefined|
| **neededWithinDays** | [**number**] |  | (optional) defaults to undefined|


### Return type

**GearItemListResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Flat gear list with neededBy. ownership&#x3D;WISHLIST&amp;sort&#x3D;NEEDED_BY is the shopping plan; ownership&#x3D;OWNED&amp;sort&#x3D;NEEDED_BY is what is needed soon. neededWithinDays narrows to a horizon. |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **gearControllerListKits**
> Array<GearKitResponse> gearControllerListKits()


### Example

```typescript
import {
    GearApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GearApi(configuration);

const { status, data } = await apiInstance.gearControllerListKits();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<GearKitResponse>**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Gear kits |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **gearControllerRemove**
> gearControllerRemove()


### Example

```typescript
import {
    GearApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GearApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.gearControllerRemove(
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
|**200** | Delete a gear item. Refused (409) once any entry records it as used or secured — retire it instead (P12) |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **gearControllerRemoveKit**
> gearControllerRemoveKit()


### Example

```typescript
import {
    GearApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GearApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.gearControllerRemoveKit(
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
|**200** | Delete a gear kit (entries keep their copied rows) |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **gearControllerRemoveSystem**
> gearControllerRemoveSystem()


### Example

```typescript
import {
    GearApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GearApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.gearControllerRemoveSystem(
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
|**200** | Delete a system (its items are kept) |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **gearControllerReorder**
> GearOverviewResponse gearControllerReorder(reorderGearDto)


### Example

```typescript
import {
    GearApi,
    Configuration,
    ReorderGearDto
} from './api';

const configuration = new Configuration();
const apiInstance = new GearApi(configuration);

let reorderGearDto: ReorderGearDto; //

const { status, data } = await apiInstance.gearControllerReorder(
    reorderGearDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **reorderGearDto** | **ReorderGearDto**|  | |


### Return type

**GearOverviewResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Reorder gear items |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **gearControllerReorderSystems**
> GearOverviewResponse gearControllerReorderSystems(reorderGearDto)


### Example

```typescript
import {
    GearApi,
    Configuration,
    ReorderGearDto
} from './api';

const configuration = new Configuration();
const apiInstance = new GearApi(configuration);

let reorderGearDto: ReorderGearDto; //

const { status, data } = await apiInstance.gearControllerReorderSystems(
    reorderGearDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **reorderGearDto** | **ReorderGearDto**|  | |


### Return type

**GearOverviewResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Reorder systems |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **gearControllerUpdate**
> GearItemAdminResponse gearControllerUpdate(updateGearDto)


### Example

```typescript
import {
    GearApi,
    Configuration,
    UpdateGearDto
} from './api';

const configuration = new Configuration();
const apiInstance = new GearApi(configuration);

let id: string; // (default to undefined)
let updateGearDto: UpdateGearDto; //

const { status, data } = await apiInstance.gearControllerUpdate(
    id,
    updateGearDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateGearDto** | **UpdateGearDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**GearItemAdminResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Update a gear item |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **gearControllerUpdateKit**
> GearKitResponse gearControllerUpdateKit(updateGearKitDto)


### Example

```typescript
import {
    GearApi,
    Configuration,
    UpdateGearKitDto
} from './api';

const configuration = new Configuration();
const apiInstance = new GearApi(configuration);

let id: string; // (default to undefined)
let updateGearKitDto: UpdateGearKitDto; //

const { status, data } = await apiInstance.gearControllerUpdateKit(
    id,
    updateGearKitDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateGearKitDto** | **UpdateGearKitDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**GearKitResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Update a gear kit |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **gearControllerUpdateSystem**
> GearSystemResponse gearControllerUpdateSystem(updateGearSystemDto)


### Example

```typescript
import {
    GearApi,
    Configuration,
    UpdateGearSystemDto
} from './api';

const configuration = new Configuration();
const apiInstance = new GearApi(configuration);

let id: string; // (default to undefined)
let updateGearSystemDto: UpdateGearSystemDto; //

const { status, data } = await apiInstance.gearControllerUpdateSystem(
    id,
    updateGearSystemDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateGearSystemDto** | **UpdateGearSystemDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**GearSystemResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Update a camera system |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **gearControllerUploadImage**
> UploadResponseDto gearControllerUploadImage()

Stored with scope GEAR, so it never appears in the gallery or among unassigned gallery photos. Pass the returned id as imageId on a gear item or system.

### Example

```typescript
import {
    GearApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new GearApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.gearControllerUploadImage(
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
|**200** | Uploaded a GEAR-scoped image |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

