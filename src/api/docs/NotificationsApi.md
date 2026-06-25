# NotificationsApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**notificationControllerSendTest**](#notificationcontrollersendtest) | **POST** /notifications/test | |

# **notificationControllerSendTest**
> TestNotificationResultDto notificationControllerSendTest(sendTestNotificationDto)


### Example

```typescript
import {
    NotificationsApi,
    Configuration,
    SendTestNotificationDto
} from './api';

const configuration = new Configuration();
const apiInstance = new NotificationsApi(configuration);

let sendTestNotificationDto: SendTestNotificationDto; //

const { status, data } = await apiInstance.notificationControllerSendTest(
    sendTestNotificationDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **sendTestNotificationDto** | **SendTestNotificationDto**|  | |


### Return type

**TestNotificationResultDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Send a chosen notification type to your own email (self-test) |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

