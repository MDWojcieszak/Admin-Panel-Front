# BlogSEOApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**seoControllerSitemap**](#seocontrollersitemap) | **GET** /blog/sitemap.xml | |

# **seoControllerSitemap**
> seoControllerSitemap()


### Example

```typescript
import {
    BlogSEOApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogSEOApi(configuration);

const { status, data } = await apiInstance.seoControllerSitemap();
```

### Parameters
This endpoint does not have any parameters.


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | XML sitemap of published public posts |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

