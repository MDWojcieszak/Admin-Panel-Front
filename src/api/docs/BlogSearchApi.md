# BlogSearchApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**searchControllerSearch**](#searchcontrollersearch) | **GET** /blog/search | |

# **searchControllerSearch**
> SearchResultsResponse searchControllerSearch()


### Example

```typescript
import {
    BlogSearchApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogSearchApi(configuration);

let q: string; //Search terms. (default to undefined)
let locale: string; // (optional) (default to undefined)
let take: number; // (optional) (default to undefined)
let skip: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.searchControllerSearch(
    q,
    locale,
    take,
    skip
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **q** | [**string**] | Search terms. | defaults to undefined|
| **locale** | [**string**] |  | (optional) defaults to undefined|
| **take** | [**number**] |  | (optional) defaults to undefined|
| **skip** | [**number**] |  | (optional) defaults to undefined|


### Return type

**SearchResultsResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Full-text search over published content; premium results above the viewer\&#39;s tier come back as locked teasers (no excerpt/body). |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

