# AIOllamaApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**ollamaControllerListModels**](#ollamacontrollerlistmodels) | **GET** /ai/ollama/models | List of locally available models at Ollama|
|[**ollamaControllerPull**](#ollamacontrollerpull) | **POST** /ai/ollama/models/pull | Download the model to your local Ollama repo (pull)|

# **ollamaControllerListModels**
> OllamaListModelsResponseDto ollamaControllerListModels()


### Example

```typescript
import {
    AIOllamaApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AIOllamaApi(configuration);

const { status, data } = await apiInstance.ollamaControllerListModels();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**OllamaListModelsResponseDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Model array |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **ollamaControllerPull**
> OllamaPullModelResponseDto ollamaControllerPull(pullModelDto)


### Example

```typescript
import {
    AIOllamaApi,
    Configuration,
    PullModelDto
} from './api';

const configuration = new Configuration();
const apiInstance = new AIOllamaApi(configuration);

let pullModelDto: PullModelDto; //

const { status, data } = await apiInstance.ollamaControllerPull(
    pullModelDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **pullModelDto** | **PullModelDto**|  | |


### Return type

**OllamaPullModelResponseDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Model download status |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

