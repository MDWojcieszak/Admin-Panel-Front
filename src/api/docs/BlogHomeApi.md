# BlogHomeApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**homePublicControllerGetHome**](#homepubliccontrollergethome) | **GET** /blog/home | |

# **homePublicControllerGetHome**
> ResolvedHomeResponse homePublicControllerGetHome()


### Example

```typescript
import {
    BlogHomeApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogHomeApi(configuration);

let locale: string; // (default to undefined)

const { status, data } = await apiInstance.homePublicControllerGetHome(
    locale
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **locale** | [**string**] |  | defaults to undefined|


### Return type

**ResolvedHomeResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Active homepage layout resolved for a locale |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

