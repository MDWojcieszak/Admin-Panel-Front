# GearApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**gearControllerCreate**](#gearcontrollercreate) | **POST** /gear | |
|[**gearControllerCreateSystem**](#gearcontrollercreatesystem) | **POST** /gear/systems | |
|[**gearControllerList**](#gearcontrollerlist) | **GET** /gear | |
|[**gearControllerRemove**](#gearcontrollerremove) | **DELETE** /gear/{id} | |
|[**gearControllerRemoveSystem**](#gearcontrollerremovesystem) | **DELETE** /gear/systems/{id} | |
|[**gearControllerReorder**](#gearcontrollerreorder) | **PUT** /gear/order | |
|[**gearControllerReorderSystems**](#gearcontrollerreordersystems) | **PUT** /gear/systems/order | |
|[**gearControllerUpdate**](#gearcontrollerupdate) | **PATCH** /gear/{id} | |
|[**gearControllerUpdateSystem**](#gearcontrollerupdatesystem) | **PATCH** /gear/systems/{id} | |

# **gearControllerCreate**
> GearItemResponse gearControllerCreate(createGearDto)


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

**GearItemResponse**

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
|**200** | Delete a gear item |  -  |

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
> GearItemResponse gearControllerUpdate(updateGearDto)


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

**GearItemResponse**

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

