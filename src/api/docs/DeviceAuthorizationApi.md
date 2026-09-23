# DeviceAuthorizationApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**deviceAuthControllerAuthorize**](#deviceauthcontrollerauthorize) | **POST** /auth/device/authorize | Start a device authorization|
|[**deviceAuthControllerToken**](#deviceauthcontrollertoken) | **POST** /auth/device/token | Collect the token once the user approves|

# **deviceAuthControllerAuthorize**
> DeviceAuthorizationResponse deviceAuthControllerAuthorize(deviceAuthorizeDto)

Returns a device/user code pair. Open `verificationUriComplete` in the user\'s browser, then poll `/auth/device/token` with `deviceCode` every `interval` seconds until it returns a token.

### Example

```typescript
import {
    DeviceAuthorizationApi,
    Configuration,
    DeviceAuthorizeDto
} from './api';

const configuration = new Configuration();
const apiInstance = new DeviceAuthorizationApi(configuration);

let deviceAuthorizeDto: DeviceAuthorizeDto; //

const { status, data } = await apiInstance.deviceAuthControllerAuthorize(
    deviceAuthorizeDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **deviceAuthorizeDto** | **DeviceAuthorizeDto**|  | |


### Return type

**DeviceAuthorizationResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deviceAuthControllerToken**
> DeviceTokenResponse deviceAuthControllerToken(deviceTokenDto)

Until approval this returns HTTP 400 with an RFC 8628 error code: `authorization_pending`, `slow_down`, `access_denied` or `expired_token`. On success the token is returned exactly once — a replayed device code gets `invalid_grant`.

### Example

```typescript
import {
    DeviceAuthorizationApi,
    Configuration,
    DeviceTokenDto
} from './api';

const configuration = new Configuration();
const apiInstance = new DeviceAuthorizationApi(configuration);

let deviceTokenDto: DeviceTokenDto; //

const { status, data } = await apiInstance.deviceAuthControllerToken(
    deviceTokenDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **deviceTokenDto** | **DeviceTokenDto**|  | |


### Return type

**DeviceTokenResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

