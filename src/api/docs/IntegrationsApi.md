# IntegrationsApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**integrationControllerApproveDevice**](#integrationcontrollerapprovedevice) | **POST** /integrations/device/{userCode}/approve | Grant the pending device its token|
|[**integrationControllerCreateToken**](#integrationcontrollercreatetoken) | **POST** /integrations/tokens | Create a token manually (copy-paste path)|
|[**integrationControllerDenyDevice**](#integrationcontrollerdenydevice) | **POST** /integrations/device/{userCode}/deny | Refuse the pending device|
|[**integrationControllerGetPendingDevice**](#integrationcontrollergetpendingdevice) | **GET** /integrations/device/{userCode} | What a pending device is asking for|
|[**integrationControllerListTokens**](#integrationcontrollerlisttokens) | **GET** /integrations/tokens | Integrations connected to this account|
|[**integrationControllerRevokeToken**](#integrationcontrollerrevoketoken) | **DELETE** /integrations/tokens/{id} | Revoke an integration|

# **integrationControllerApproveDevice**
> DeviceApprovalResultResponse integrationControllerApproveDevice()


### Example

```typescript
import {
    IntegrationsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new IntegrationsApi(configuration);

let userCode: string; // (default to undefined)

const { status, data } = await apiInstance.integrationControllerApproveDevice(
    userCode
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **userCode** | [**string**] |  | defaults to undefined|


### Return type

**DeviceApprovalResultResponse**

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

# **integrationControllerCreateToken**
> IntegrationTokenCreatedResponse integrationControllerCreateToken(createIntegrationTokenDto)

The fallback to the device flow, for scripts and CLI tools. The value is returned once and never again — surface a copy button here.

### Example

```typescript
import {
    IntegrationsApi,
    Configuration,
    CreateIntegrationTokenDto
} from './api';

const configuration = new Configuration();
const apiInstance = new IntegrationsApi(configuration);

let createIntegrationTokenDto: CreateIntegrationTokenDto; //

const { status, data } = await apiInstance.integrationControllerCreateToken(
    createIntegrationTokenDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createIntegrationTokenDto** | **CreateIntegrationTokenDto**|  | |


### Return type

**IntegrationTokenCreatedResponse**

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

# **integrationControllerDenyDevice**
> DeviceApprovalResultResponse integrationControllerDenyDevice()


### Example

```typescript
import {
    IntegrationsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new IntegrationsApi(configuration);

let userCode: string; // (default to undefined)

const { status, data } = await apiInstance.integrationControllerDenyDevice(
    userCode
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **userCode** | [**string**] |  | defaults to undefined|


### Return type

**DeviceApprovalResultResponse**

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

# **integrationControllerGetPendingDevice**
> DeviceApprovalRequestResponse integrationControllerGetPendingDevice()

Renders the approval screen. Show `clientName`, `platform` and every entry of `scopes` — this is the only point where the user sees what they are about to grant.

### Example

```typescript
import {
    IntegrationsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new IntegrationsApi(configuration);

let userCode: string; // (default to undefined)

const { status, data } = await apiInstance.integrationControllerGetPendingDevice(
    userCode
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **userCode** | [**string**] |  | defaults to undefined|


### Return type

**DeviceApprovalRequestResponse**

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

# **integrationControllerListTokens**
> IntegrationTokenListResponse integrationControllerListTokens()

Metadata only — token values are never retrievable after creation.

### Example

```typescript
import {
    IntegrationsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new IntegrationsApi(configuration);

const { status, data } = await apiInstance.integrationControllerListTokens();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**IntegrationTokenListResponse**

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

# **integrationControllerRevokeToken**
> IntegrationTokenResponse integrationControllerRevokeToken()

Takes effect on the next request the app makes. Idempotent — revoking an already-revoked token is not an error.

### Example

```typescript
import {
    IntegrationsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new IntegrationsApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.integrationControllerRevokeToken(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**IntegrationTokenResponse**

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

