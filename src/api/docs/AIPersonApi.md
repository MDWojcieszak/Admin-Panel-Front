# AIPersonApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**personAiControllerCreatePerson**](#personaicontrollercreateperson) | **POST** /person/ai | |
|[**personAiControllerGetAiContext**](#personaicontrollergetaicontext) | **GET** /person/ai/{id}/context | |
|[**personAiControllerGetAiHistory**](#personaicontrollergetaihistory) | **GET** /person/ai/{id}/history | |
|[**personAiControllerGetPersonForAI**](#personaicontrollergetpersonforai) | **GET** /person/ai/{id} | |
|[**personAiControllerListPersonsForAI**](#personaicontrollerlistpersonsforai) | **GET** /person/ai/list | |
|[**personAiControllerUpdateAiContext**](#personaicontrollerupdateaicontext) | **PUT** /person/ai/{id}/context | |
|[**personAiControllerUpdatePerson**](#personaicontrollerupdateperson) | **PUT** /person/ai/{id} | |

# **personAiControllerCreatePerson**
> PersonAiDetailResponseDto personAiControllerCreatePerson(personAiCreateDto)


### Example

```typescript
import {
    AIPersonApi,
    Configuration,
    PersonAiCreateDto
} from './api';

const configuration = new Configuration();
const apiInstance = new AIPersonApi(configuration);

let personAiCreateDto: PersonAiCreateDto; //

const { status, data } = await apiInstance.personAiControllerCreatePerson(
    personAiCreateDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **personAiCreateDto** | **PersonAiCreateDto**|  | |


### Return type

**PersonAiDetailResponseDto**

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

# **personAiControllerGetAiContext**
> AiContextDto personAiControllerGetAiContext()


### Example

```typescript
import {
    AIPersonApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AIPersonApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.personAiControllerGetAiContext(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**AiContextDto**

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

# **personAiControllerGetAiHistory**
> AiHistoryListResponseDto personAiControllerGetAiHistory()


### Example

```typescript
import {
    AIPersonApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AIPersonApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.personAiControllerGetAiHistory(
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

# **personAiControllerGetPersonForAI**
> PersonAiDetailResponseDto personAiControllerGetPersonForAI()


### Example

```typescript
import {
    AIPersonApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AIPersonApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.personAiControllerGetPersonForAI(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**PersonAiDetailResponseDto**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | AI: Get person details (with AI context) |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **personAiControllerListPersonsForAI**
> PersonAiListResponseDto personAiControllerListPersonsForAI()


### Example

```typescript
import {
    AIPersonApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AIPersonApi(configuration);

const { status, data } = await apiInstance.personAiControllerListPersonsForAI();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**PersonAiListResponseDto**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | AI: List persons for the user (with AI context) |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **personAiControllerUpdateAiContext**
> AiContextDto personAiControllerUpdateAiContext(aiContextDto)


### Example

```typescript
import {
    AIPersonApi,
    Configuration,
    AiContextDto
} from './api';

const configuration = new Configuration();
const apiInstance = new AIPersonApi(configuration);

let id: string; // (default to undefined)
let aiContextDto: AiContextDto; //

const { status, data } = await apiInstance.personAiControllerUpdateAiContext(
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

**AiContextDto**

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

# **personAiControllerUpdatePerson**
> PersonAiDetailResponseDto personAiControllerUpdatePerson(personAiUpdateDto)


### Example

```typescript
import {
    AIPersonApi,
    Configuration,
    PersonAiUpdateDto
} from './api';

const configuration = new Configuration();
const apiInstance = new AIPersonApi(configuration);

let id: string; // (default to undefined)
let personAiUpdateDto: PersonAiUpdateDto; //

const { status, data } = await apiInstance.personAiControllerUpdatePerson(
    id,
    personAiUpdateDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **personAiUpdateDto** | **PersonAiUpdateDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**PersonAiDetailResponseDto**

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

