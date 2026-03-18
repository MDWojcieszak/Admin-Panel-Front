# PersonApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**personControllerCreatePerson**](#personcontrollercreateperson) | **POST** /person | |
|[**personControllerDeletePerson**](#personcontrollerdeleteperson) | **DELETE** /person/{id} | |
|[**personControllerGetAiHistory**](#personcontrollergetaihistory) | **GET** /person/{id}/ai/history | |
|[**personControllerGetPerson**](#personcontrollergetperson) | **GET** /person/{id} | |
|[**personControllerListPersons**](#personcontrollerlistpersons) | **GET** /person/list | |
|[**personControllerUpdatePerson**](#personcontrollerupdateperson) | **PUT** /person/{id} | |

# **personControllerCreatePerson**
> PersonDetailResponseDto personControllerCreatePerson(personCreateDto)


### Example

```typescript
import {
    PersonApi,
    Configuration,
    PersonCreateDto
} from './api';

const configuration = new Configuration();
const apiInstance = new PersonApi(configuration);

let personCreateDto: PersonCreateDto; //

const { status, data } = await apiInstance.personControllerCreatePerson(
    personCreateDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **personCreateDto** | **PersonCreateDto**|  | |


### Return type

**PersonDetailResponseDto**

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

# **personControllerDeletePerson**
> PersonDetailResponseDto personControllerDeletePerson()


### Example

```typescript
import {
    PersonApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PersonApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.personControllerDeletePerson(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**PersonDetailResponseDto**

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

# **personControllerGetAiHistory**
> AiHistoryListResponseDto personControllerGetAiHistory()


### Example

```typescript
import {
    PersonApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PersonApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.personControllerGetAiHistory(
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

# **personControllerGetPerson**
> PersonDetailResponseDto personControllerGetPerson()


### Example

```typescript
import {
    PersonApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PersonApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.personControllerGetPerson(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**PersonDetailResponseDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Get person details |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **personControllerListPersons**
> PersonListResponseDto personControllerListPersons()


### Example

```typescript
import {
    PersonApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PersonApi(configuration);

let take: number; // (optional) (default to undefined)
let skip: number; // (optional) (default to 0)

const { status, data } = await apiInstance.personControllerListPersons(
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

**PersonListResponseDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | List all persons for the current user |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **personControllerUpdatePerson**
> PersonDetailResponseDto personControllerUpdatePerson(personUpdateDto)


### Example

```typescript
import {
    PersonApi,
    Configuration,
    PersonUpdateDto
} from './api';

const configuration = new Configuration();
const apiInstance = new PersonApi(configuration);

let id: string; // (default to undefined)
let personUpdateDto: PersonUpdateDto; //

const { status, data } = await apiInstance.personControllerUpdatePerson(
    id,
    personUpdateDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **personUpdateDto** | **PersonUpdateDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**PersonDetailResponseDto**

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

