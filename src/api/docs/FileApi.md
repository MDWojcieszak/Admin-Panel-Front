# FileApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**fileControllerUploadImage**](#filecontrolleruploadimage) | **POST** /file/upload/image | |

# **fileControllerUploadImage**
> UploadResponseDto fileControllerUploadImage()


### Example

```typescript
import {
    FileApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new FileApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.fileControllerUploadImage(
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
|**201** | Image uploaded successfully |  -  |
|**500** | Error converting or saving file |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

