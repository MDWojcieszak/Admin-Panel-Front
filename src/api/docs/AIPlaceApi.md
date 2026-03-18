# AIPlaceApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**placeAiControllerCreatePlace**](#placeaicontrollercreateplace) | **POST** /place/ai | |
|[**placeAiControllerGetAiContext**](#placeaicontrollergetaicontext) | **GET** /place/ai/{id}/context | |
|[**placeAiControllerGetAiHistory**](#placeaicontrollergetaihistory) | **GET** /place/ai/{id}/history | |
|[**placeAiControllerGetPlace**](#placeaicontrollergetplace) | **GET** /place/ai/{id} | |
|[**placeAiControllerListPlaces**](#placeaicontrollerlistplaces) | **GET** /place/ai/list | |
|[**placeAiControllerUpdateAiContext**](#placeaicontrollerupdateaicontext) | **PUT** /place/ai/{id}/context | |
|[**placeAiControllerUpdatePlace**](#placeaicontrollerupdateplace) | **PUT** /place/ai/{id} | |

# **placeAiControllerCreatePlace**
> PlaceAiDetailResponseDto placeAiControllerCreatePlace(placeAiCreateDto)


### Example

```typescript
import {
    AIPlaceApi,
    Configuration,
    PlaceAiCreateDto
} from './api';

const configuration = new Configuration();
const apiInstance = new AIPlaceApi(configuration);

let placeAiCreateDto: PlaceAiCreateDto; //

const { status, data } = await apiInstance.placeAiControllerCreatePlace(
    placeAiCreateDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **placeAiCreateDto** | **PlaceAiCreateDto**|  | |


### Return type

**PlaceAiDetailResponseDto**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **placeAiControllerGetAiContext**
> AiContextResponseDto placeAiControllerGetAiContext()


### Example

```typescript
import {
    AIPlaceApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AIPlaceApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.placeAiControllerGetAiContext(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**AiContextResponseDto**

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

# **placeAiControllerGetAiHistory**
> AiHistoryListResponseDto placeAiControllerGetAiHistory()


### Example

```typescript
import {
    AIPlaceApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AIPlaceApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.placeAiControllerGetAiHistory(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**AiHistoryListResponseDto**

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

# **placeAiControllerGetPlace**
> PlaceAiDetailResponseDto placeAiControllerGetPlace()


### Example

```typescript
import {
    AIPlaceApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AIPlaceApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.placeAiControllerGetPlace(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**PlaceAiDetailResponseDto**

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

# **placeAiControllerListPlaces**
> PlaceAiListResponseDto placeAiControllerListPlaces()


### Example

```typescript
import {
    AIPlaceApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AIPlaceApi(configuration);

const { status, data } = await apiInstance.placeAiControllerListPlaces();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**PlaceAiListResponseDto**

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

# **placeAiControllerUpdateAiContext**
> AiContextResponseDto placeAiControllerUpdateAiContext(aiContextDto)


### Example

```typescript
import {
    AIPlaceApi,
    Configuration,
    AiContextDto
} from './api';

const configuration = new Configuration();
const apiInstance = new AIPlaceApi(configuration);

let id: string; // (default to undefined)
let aiContextDto: AiContextDto; //

const { status, data } = await apiInstance.placeAiControllerUpdateAiContext(
    id,
    aiContextDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **aiContextDto** | **AiContextDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**AiContextResponseDto**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **placeAiControllerUpdatePlace**
> PlaceAiDetailResponseDto placeAiControllerUpdatePlace(placeAiUpdateDto)


### Example

```typescript
import {
    AIPlaceApi,
    Configuration,
    PlaceAiUpdateDto
} from './api';

const configuration = new Configuration();
const apiInstance = new AIPlaceApi(configuration);

let id: string; // (default to undefined)
let placeAiUpdateDto: PlaceAiUpdateDto; //

const { status, data } = await apiInstance.placeAiControllerUpdatePlace(
    id,
    placeAiUpdateDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **placeAiUpdateDto** | **PlaceAiUpdateDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**PlaceAiDetailResponseDto**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

