# BlogAuthorsApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**authorPublicControllerListPublic**](#authorpubliccontrollerlistpublic) | **GET** /blog/authors/public | |

# **authorPublicControllerListPublic**
> PublicAuthorListResponse authorPublicControllerListPublic()


### Example

```typescript
import {
    BlogAuthorsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogAuthorsApi(configuration);

let ids: string; //Comma-separated user ids (max 100 resolved). (default to undefined)

const { status, data } = await apiInstance.authorPublicControllerListPublic(
    ids
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **ids** | [**string**] | Comma-separated user ids (max 100 resolved). | defaults to undefined|


### Return type

**PublicAuthorListResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Resolve post author ids → public byline (name + avatar) |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

