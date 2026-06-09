# EcosystemAppDevicesApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**deviceControllerFetchLicense**](#devicecontrollerfetchlicense) | **GET** /ecosystem/devices/{id}/license | |
|[**deviceControllerGet**](#devicecontrollerget) | **GET** /ecosystem/devices/{id} | |
|[**deviceControllerList**](#devicecontrollerlist) | **GET** /ecosystem/devices | |
|[**deviceControllerRegister**](#devicecontrollerregister) | **POST** /ecosystem/devices/register | |
|[**deviceControllerRevoke**](#devicecontrollerrevoke) | **DELETE** /ecosystem/devices/{id} | |

# **deviceControllerFetchLicense**
> LicenseResponse deviceControllerFetchLicense()


### Example

```typescript
import {
    EcosystemAppDevicesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new EcosystemAppDevicesApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.deviceControllerFetchLicense(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**LicenseResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Re-issued license |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deviceControllerGet**
> DeviceResponse deviceControllerGet()


### Example

```typescript
import {
    EcosystemAppDevicesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new EcosystemAppDevicesApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.deviceControllerGet(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**DeviceResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | My device detail |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deviceControllerList**
> DeviceListResponse deviceControllerList()


### Example

```typescript
import {
    EcosystemAppDevicesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new EcosystemAppDevicesApi(configuration);

let take: number; // (optional) (default to undefined)
let skip: number; // (optional) (default to 0)

const { status, data } = await apiInstance.deviceControllerList(
    take,
    skip
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **take** | [**number**] |  | (optional) defaults to undefined|
| **skip** | [**number**] |  | (optional) defaults to 0|


### Return type

**DeviceListResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | My devices |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deviceControllerRegister**
> DeviceWithLicenseResponse deviceControllerRegister(registerDeviceDto)


### Example

```typescript
import {
    EcosystemAppDevicesApi,
    Configuration,
    RegisterDeviceDto
} from './api';

const configuration = new Configuration();
const apiInstance = new EcosystemAppDevicesApi(configuration);

let registerDeviceDto: RegisterDeviceDto; //

const { status, data } = await apiInstance.deviceControllerRegister(
    registerDeviceDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **registerDeviceDto** | **RegisterDeviceDto**|  | |


### Return type

**DeviceWithLicenseResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Activated/renewed device + fresh license |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deviceControllerRevoke**
> DeviceResponse deviceControllerRevoke()


### Example

```typescript
import {
    EcosystemAppDevicesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new EcosystemAppDevicesApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.deviceControllerRevoke(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**DeviceResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Revoked device |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

