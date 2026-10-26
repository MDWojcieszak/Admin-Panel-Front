# CalendarApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**calendarControllerFeed**](#calendarcontrollerfeed) | **GET** /calendar/{token}.ics | The iCal feed behind a calendar address|
|[**calendarControllerGet**](#calendarcontrollerget) | **GET** /calendar/feed | |
|[**calendarControllerRemove**](#calendarcontrollerremove) | **DELETE** /calendar/feed | |
|[**calendarControllerRotate**](#calendarcontrollerrotate) | **POST** /calendar/feed | |
|[**calendarControllerUpdate**](#calendarcontrollerupdate) | **PATCH** /calendar/feed | |

# **calendarControllerFeed**
> calendarControllerFeed()


### Example

```typescript
import {
    CalendarApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CalendarApi(configuration);

let token: string; // (default to undefined)

const { status, data } = await apiInstance.calendarControllerFeed(
    token
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **token** | [**string**] |  | defaults to undefined|


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
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **calendarControllerGet**
> CalendarFeedResponse calendarControllerGet()


### Example

```typescript
import {
    CalendarApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CalendarApi(configuration);

const { status, data } = await apiInstance.calendarControllerGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**CalendarFeedResponse**

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

# **calendarControllerRemove**
> calendarControllerRemove()


### Example

```typescript
import {
    CalendarApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new CalendarApi(configuration);

const { status, data } = await apiInstance.calendarControllerRemove();
```

### Parameters
This endpoint does not have any parameters.


### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **calendarControllerRotate**
> CreatedCalendarFeedResponse calendarControllerRotate(calendarFeedDto)


### Example

```typescript
import {
    CalendarApi,
    Configuration,
    CalendarFeedDto
} from './api';

const configuration = new Configuration();
const apiInstance = new CalendarApi(configuration);

let calendarFeedDto: CalendarFeedDto; //

const { status, data } = await apiInstance.calendarControllerRotate(
    calendarFeedDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **calendarFeedDto** | **CalendarFeedDto**|  | |


### Return type

**CreatedCalendarFeedResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **calendarControllerUpdate**
> CalendarFeedResponse calendarControllerUpdate(calendarFeedDto)


### Example

```typescript
import {
    CalendarApi,
    Configuration,
    CalendarFeedDto
} from './api';

const configuration = new Configuration();
const apiInstance = new CalendarApi(configuration);

let calendarFeedDto: CalendarFeedDto; //

const { status, data } = await apiInstance.calendarControllerUpdate(
    calendarFeedDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **calendarFeedDto** | **CalendarFeedDto**|  | |


### Return type

**CalendarFeedResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

