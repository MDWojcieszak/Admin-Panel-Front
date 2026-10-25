# BuildsApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**buildControllerAddBomItem**](#buildcontrolleraddbomitem) | **POST** /projects/{id}/bom | |
|[**buildControllerAddJournalEntry**](#buildcontrolleraddjournalentry) | **POST** /projects/{id}/journal | |
|[**buildControllerListBom**](#buildcontrollerlistbom) | **GET** /projects/{id}/bom | |
|[**buildControllerListJournal**](#buildcontrollerlistjournal) | **GET** /projects/{id}/journal | |
|[**buildControllerRemoveBomItem**](#buildcontrollerremovebomitem) | **DELETE** /bom/{itemId} | |
|[**buildControllerRemoveJournalEntry**](#buildcontrollerremovejournalentry) | **DELETE** /journal/{entryId} | |
|[**buildControllerReorderBom**](#buildcontrollerreorderbom) | **PUT** /projects/{id}/bom/order | |
|[**buildControllerSetBomStatus**](#buildcontrollersetbomstatus) | **POST** /bom/{itemId}/status | |
|[**buildControllerUpdateBomItem**](#buildcontrollerupdatebomitem) | **PATCH** /bom/{itemId} | |
|[**buildControllerUpdateJournalEntry**](#buildcontrollerupdatejournalentry) | **PATCH** /journal/{entryId} | |

# **buildControllerAddBomItem**
> BomResponse buildControllerAddBomItem(createBomItemDto)


### Example

```typescript
import {
    BuildsApi,
    Configuration,
    CreateBomItemDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BuildsApi(configuration);

let id: string; // (default to undefined)
let createBomItemDto: CreateBomItemDto; //

const { status, data } = await apiInstance.buildControllerAddBomItem(
    id,
    createBomItemDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createBomItemDto** | **CreateBomItemDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**BomResponse**

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

# **buildControllerAddJournalEntry**
> JournalEntryResponse buildControllerAddJournalEntry(createJournalEntryDto)


### Example

```typescript
import {
    BuildsApi,
    Configuration,
    CreateJournalEntryDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BuildsApi(configuration);

let id: string; // (default to undefined)
let createJournalEntryDto: CreateJournalEntryDto; //

const { status, data } = await apiInstance.buildControllerAddJournalEntry(
    id,
    createJournalEntryDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createJournalEntryDto** | **CreateJournalEntryDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**JournalEntryResponse**

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

# **buildControllerListBom**
> BomResponse buildControllerListBom()


### Example

```typescript
import {
    BuildsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BuildsApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.buildControllerListBom(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**BomResponse**

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

# **buildControllerListJournal**
> Array<JournalEntryResponse> buildControllerListJournal()


### Example

```typescript
import {
    BuildsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BuildsApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.buildControllerListJournal(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**Array<JournalEntryResponse>**

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

# **buildControllerRemoveBomItem**
> BomResponse buildControllerRemoveBomItem()


### Example

```typescript
import {
    BuildsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BuildsApi(configuration);

let itemId: string; // (default to undefined)

const { status, data } = await apiInstance.buildControllerRemoveBomItem(
    itemId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **itemId** | [**string**] |  | defaults to undefined|


### Return type

**BomResponse**

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

# **buildControllerRemoveJournalEntry**
> buildControllerRemoveJournalEntry()


### Example

```typescript
import {
    BuildsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BuildsApi(configuration);

let entryId: string; // (default to undefined)

const { status, data } = await apiInstance.buildControllerRemoveJournalEntry(
    entryId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **entryId** | [**string**] |  | defaults to undefined|


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
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **buildControllerReorderBom**
> BomResponse buildControllerReorderBom(reorderIdsDto)


### Example

```typescript
import {
    BuildsApi,
    Configuration,
    ReorderIdsDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BuildsApi(configuration);

let id: string; // (default to undefined)
let reorderIdsDto: ReorderIdsDto; //

const { status, data } = await apiInstance.buildControllerReorderBom(
    id,
    reorderIdsDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **reorderIdsDto** | **ReorderIdsDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**BomResponse**

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

# **buildControllerSetBomStatus**
> BomResponse buildControllerSetBomStatus(setBomStatusDto)


### Example

```typescript
import {
    BuildsApi,
    Configuration,
    SetBomStatusDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BuildsApi(configuration);

let itemId: string; // (default to undefined)
let setBomStatusDto: SetBomStatusDto; //

const { status, data } = await apiInstance.buildControllerSetBomStatus(
    itemId,
    setBomStatusDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **setBomStatusDto** | **SetBomStatusDto**|  | |
| **itemId** | [**string**] |  | defaults to undefined|


### Return type

**BomResponse**

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

# **buildControllerUpdateBomItem**
> BomResponse buildControllerUpdateBomItem(updateBomItemDto)


### Example

```typescript
import {
    BuildsApi,
    Configuration,
    UpdateBomItemDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BuildsApi(configuration);

let itemId: string; // (default to undefined)
let updateBomItemDto: UpdateBomItemDto; //

const { status, data } = await apiInstance.buildControllerUpdateBomItem(
    itemId,
    updateBomItemDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateBomItemDto** | **UpdateBomItemDto**|  | |
| **itemId** | [**string**] |  | defaults to undefined|


### Return type

**BomResponse**

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

# **buildControllerUpdateJournalEntry**
> JournalEntryResponse buildControllerUpdateJournalEntry(updateJournalEntryDto)


### Example

```typescript
import {
    BuildsApi,
    Configuration,
    UpdateJournalEntryDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BuildsApi(configuration);

let entryId: string; // (default to undefined)
let updateJournalEntryDto: UpdateJournalEntryDto; //

const { status, data } = await apiInstance.buildControllerUpdateJournalEntry(
    entryId,
    updateJournalEntryDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateJournalEntryDto** | **UpdateJournalEntryDto**|  | |
| **entryId** | [**string**] |  | defaults to undefined|


### Return type

**JournalEntryResponse**

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

