# BlogDocumentApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**documentControllerSave**](#documentcontrollersave) | **PUT** /blog/posts/{postId}/document | |

# **documentControllerSave**
> SaveDocumentResponse documentControllerSave(saveDocumentDto)


### Example

```typescript
import {
    BlogDocumentApi,
    Configuration,
    SaveDocumentDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogDocumentApi(configuration);

let postId: string; // (default to undefined)
let saveDocumentDto: SaveDocumentDto; //
let locale: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.documentControllerSave(
    postId,
    saveDocumentDto,
    locale
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **saveDocumentDto** | **SaveDocumentDto**|  | |
| **postId** | [**string**] |  | defaults to undefined|
| **locale** | [**string**] |  | (optional) defaults to undefined|


### Return type

**SaveDocumentResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Refreshed draft + clientKey→sectionId map |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

