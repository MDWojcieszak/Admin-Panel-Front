# BlogLocalesApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**localeControllerList**](#localecontrollerlist) | **GET** /blog/locales | |
|[**localeControllerListPublic**](#localecontrollerlistpublic) | **GET** /blog/locales/public | |

# **localeControllerList**
> BlogLocaleListResponse localeControllerList()


### Example

```typescript
import {
    BlogLocalesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogLocalesApi(configuration);

const { status, data } = await apiInstance.localeControllerList();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**BlogLocaleListResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Enabled blog locales + the default (fallback) locale |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **localeControllerListPublic**
> BlogLocaleListResponse localeControllerListPublic()


### Example

```typescript
import {
    BlogLocalesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogLocalesApi(configuration);

const { status, data } = await apiInstance.localeControllerListPublic();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**BlogLocaleListResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Enabled blog locales + default (public language switcher) |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

