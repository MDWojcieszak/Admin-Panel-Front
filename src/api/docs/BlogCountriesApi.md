# BlogCountriesApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**countryPublicControllerMenu**](#countrypubliccontrollermenu) | **GET** /blog/countries | |
|[**countryPublicControllerPage**](#countrypubliccontrollerpage) | **GET** /blog/countries/by-slug/{slug} | |

# **countryPublicControllerMenu**
> BlogCountryMenuResponse countryPublicControllerMenu()


### Example

```typescript
import {
    BlogCountriesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogCountriesApi(configuration);

let locale: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.countryPublicControllerMenu(
    locale
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **locale** | [**string**] |  | (optional) defaults to undefined|


### Return type

**BlogCountryMenuResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **countryPublicControllerPage**
> BlogCountryPageResponse countryPublicControllerPage()


### Example

```typescript
import {
    BlogCountriesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogCountriesApi(configuration);

let slug: string; // (default to undefined)
let locale: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.countryPublicControllerPage(
    slug,
    locale
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **slug** | [**string**] |  | defaults to undefined|
| **locale** | [**string**] |  | (optional) defaults to undefined|


### Return type

**BlogCountryPageResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

