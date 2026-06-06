# DashboardApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**dashboardControllerGetGallery**](#dashboardcontrollergetgallery) | **GET** /dashboard/gallery | |
|[**dashboardControllerGetOverview**](#dashboardcontrollergetoverview) | **GET** /dashboard | |
|[**dashboardControllerGetTrends**](#dashboardcontrollergettrends) | **GET** /dashboard/trends | |

# **dashboardControllerGetGallery**
> DashboardGalleryResponseDto dashboardControllerGetGallery()


### Example

```typescript
import {
    DashboardApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DashboardApi(configuration);

const { status, data } = await apiInstance.dashboardControllerGetGallery();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**DashboardGalleryResponseDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **dashboardControllerGetOverview**
> DashboardResponseDto dashboardControllerGetOverview()


### Example

```typescript
import {
    DashboardApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DashboardApi(configuration);

const { status, data } = await apiInstance.dashboardControllerGetOverview();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**DashboardResponseDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **dashboardControllerGetTrends**
> DashboardTrendsResponseDto dashboardControllerGetTrends()


### Example

```typescript
import {
    DashboardApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DashboardApi(configuration);

let range: TrendsRange; // (optional) (default to undefined)

const { status, data } = await apiInstance.dashboardControllerGetTrends(
    range
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **range** | **TrendsRange** |  | (optional) defaults to undefined|


### Return type

**DashboardTrendsResponseDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

