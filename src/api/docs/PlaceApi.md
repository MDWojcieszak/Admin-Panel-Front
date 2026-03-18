# PlaceApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**placeControllerAddMember**](#placecontrolleraddmember) | **POST** /place/{id}/members | |
|[**placeControllerCreatePlace**](#placecontrollercreateplace) | **POST** /place | |
|[**placeControllerDeletePlace**](#placecontrollerdeleteplace) | **DELETE** /place/{id} | |
|[**placeControllerGetPlace**](#placecontrollergetplace) | **GET** /place/{id} | |
|[**placeControllerGetPlaceAiHistory**](#placecontrollergetplaceaihistory) | **GET** /place/{id}/ai/history | |
|[**placeControllerListMembers**](#placecontrollerlistmembers) | **GET** /place/{id}/members | |
|[**placeControllerListPlaces**](#placecontrollerlistplaces) | **GET** /place/list | |
|[**placeControllerRemoveMember**](#placecontrollerremovemember) | **DELETE** /place/{id}/members/{memberId} | |
|[**placeControllerUpdatePlace**](#placecontrollerupdateplace) | **PUT** /place/{id} | |

# **placeControllerAddMember**
> PlaceMemberListResponseDto placeControllerAddMember(placeAddMemberDto)


### Example

```typescript
import {
    PlaceApi,
    Configuration,
    PlaceAddMemberDto
} from './api';

const configuration = new Configuration();
const apiInstance = new PlaceApi(configuration);

let id: string; // (default to undefined)
let placeAddMemberDto: PlaceAddMemberDto; //

const { status, data } = await apiInstance.placeControllerAddMember(
    id,
    placeAddMemberDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **placeAddMemberDto** | **PlaceAddMemberDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**PlaceMemberListResponseDto**

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

# **placeControllerCreatePlace**
> PlaceDetailResponseDto placeControllerCreatePlace(placeCreateDto)


### Example

```typescript
import {
    PlaceApi,
    Configuration,
    PlaceCreateDto
} from './api';

const configuration = new Configuration();
const apiInstance = new PlaceApi(configuration);

let placeCreateDto: PlaceCreateDto; //

const { status, data } = await apiInstance.placeControllerCreatePlace(
    placeCreateDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **placeCreateDto** | **PlaceCreateDto**|  | |


### Return type

**PlaceDetailResponseDto**

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

# **placeControllerDeletePlace**
> PlaceDetailResponseDto placeControllerDeletePlace()


### Example

```typescript
import {
    PlaceApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PlaceApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.placeControllerDeletePlace(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**PlaceDetailResponseDto**

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

# **placeControllerGetPlace**
> PlaceDetailResponseDto placeControllerGetPlace()


### Example

```typescript
import {
    PlaceApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PlaceApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.placeControllerGetPlace(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**PlaceDetailResponseDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Get place details (with members and location) |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **placeControllerGetPlaceAiHistory**
> AiHistoryListResponseDto placeControllerGetPlaceAiHistory()


### Example

```typescript
import {
    PlaceApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PlaceApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.placeControllerGetPlaceAiHistory(
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

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **placeControllerListMembers**
> PlaceMemberListResponseDto placeControllerListMembers()


### Example

```typescript
import {
    PlaceApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PlaceApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.placeControllerListMembers(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**PlaceMemberListResponseDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | List members of a place |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **placeControllerListPlaces**
> PlaceListResponseDto placeControllerListPlaces()


### Example

```typescript
import {
    PlaceApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PlaceApi(configuration);

let take: number; // (optional) (default to undefined)
let skip: number; // (optional) (default to 0)

const { status, data } = await apiInstance.placeControllerListPlaces(
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

**PlaceListResponseDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | List all places for the current user (owner or member) |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **placeControllerRemoveMember**
> PlaceMemberListResponseDto placeControllerRemoveMember()


### Example

```typescript
import {
    PlaceApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PlaceApi(configuration);

let id: string; // (default to undefined)
let memberId: string; // (default to undefined)

const { status, data } = await apiInstance.placeControllerRemoveMember(
    id,
    memberId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|
| **memberId** | [**string**] |  | defaults to undefined|


### Return type

**PlaceMemberListResponseDto**

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

# **placeControllerUpdatePlace**
> PlaceDetailResponseDto placeControllerUpdatePlace(placeUpdateDto)


### Example

```typescript
import {
    PlaceApi,
    Configuration,
    PlaceUpdateDto
} from './api';

const configuration = new Configuration();
const apiInstance = new PlaceApi(configuration);

let id: string; // (default to undefined)
let placeUpdateDto: PlaceUpdateDto; //

const { status, data } = await apiInstance.placeControllerUpdatePlace(
    id,
    placeUpdateDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **placeUpdateDto** | **PlaceUpdateDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**PlaceDetailResponseDto**

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

