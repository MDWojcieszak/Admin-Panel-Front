# TokenApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**tokenControllerDeleteToken**](#tokencontrollerdeletetoken) | **DELETE** /token/{id} | |
|[**tokenControllerGenerateToken**](#tokencontrollergeneratetoken) | **POST** /token/generate | |
|[**tokenControllerGetTokenMetadata**](#tokencontrollergettokenmetadata) | **GET** /token/{id} | |
|[**tokenControllerListTokens**](#tokencontrollerlisttokens) | **GET** /token/list | |
|[**tokenControllerSaveServiceToken**](#tokencontrollersaveservicetoken) | **POST** /token/save-service-token | |

# **tokenControllerDeleteToken**
> TokenMetadataResponseDto tokenControllerDeleteToken()


### Example

```typescript
import {
    TokenApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new TokenApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.tokenControllerDeleteToken(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**TokenMetadataResponseDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Delete/revoke token |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **tokenControllerGenerateToken**
> GenerateTokenResponseDto tokenControllerGenerateToken(generateTokenDto)


### Example

```typescript
import {
    TokenApi,
    Configuration,
    GenerateTokenDto
} from './api';

const configuration = new Configuration();
const apiInstance = new TokenApi(configuration);

let generateTokenDto: GenerateTokenDto; //

const { status, data } = await apiInstance.tokenControllerGenerateToken(
    generateTokenDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **generateTokenDto** | **GenerateTokenDto**|  | |


### Return type

**GenerateTokenResponseDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Generate personal API token (INTERNAL or AI, write-once) |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **tokenControllerGetTokenMetadata**
> TokenMetadataResponseDto tokenControllerGetTokenMetadata()


### Example

```typescript
import {
    TokenApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new TokenApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.tokenControllerGetTokenMetadata(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**TokenMetadataResponseDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Get token metadata (never reveals token value!) |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **tokenControllerListTokens**
> TokenListResponseDto tokenControllerListTokens()


### Example

```typescript
import {
    TokenApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new TokenApi(configuration);

let take: number; // (optional) (default to undefined)
let skip: number; // (optional) (default to 0)

const { status, data } = await apiInstance.tokenControllerListTokens(
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

**TokenListResponseDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | List all tokens for current user (paginated) |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **tokenControllerSaveServiceToken**
> SaveServiceTokenResponseDto tokenControllerSaveServiceToken(saveServiceTokenDto)


### Example

```typescript
import {
    TokenApi,
    Configuration,
    SaveServiceTokenDto
} from './api';

const configuration = new Configuration();
const apiInstance = new TokenApi(configuration);

let saveServiceTokenDto: SaveServiceTokenDto; //

const { status, data } = await apiInstance.tokenControllerSaveServiceToken(
    saveServiceTokenDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **saveServiceTokenDto** | **SaveServiceTokenDto**|  | |


### Return type

**SaveServiceTokenResponseDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Save or update a service integration token (EXTERNAL, editable) |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

