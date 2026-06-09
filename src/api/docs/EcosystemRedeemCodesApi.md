# EcosystemRedeemCodesApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**redeemControllerCreateCode**](#redeemcontrollercreatecode) | **POST** /ecosystem/codes | |
|[**redeemControllerListCodes**](#redeemcontrollerlistcodes) | **GET** /ecosystem/codes | |
|[**redeemControllerRedeem**](#redeemcontrollerredeem) | **POST** /ecosystem/redeem | |
|[**redeemControllerRevokeCode**](#redeemcontrollerrevokecode) | **DELETE** /ecosystem/codes/{id} | |

# **redeemControllerCreateCode**
> RedeemCodeResponse redeemControllerCreateCode(createCodeDto)


### Example

```typescript
import {
    EcosystemRedeemCodesApi,
    Configuration,
    CreateCodeDto
} from './api';

const configuration = new Configuration();
const apiInstance = new EcosystemRedeemCodesApi(configuration);

let createCodeDto: CreateCodeDto; //

const { status, data } = await apiInstance.redeemControllerCreateCode(
    createCodeDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createCodeDto** | **CreateCodeDto**|  | |


### Return type

**RedeemCodeResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Created code |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **redeemControllerListCodes**
> CodeListResponse redeemControllerListCodes()


### Example

```typescript
import {
    EcosystemRedeemCodesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new EcosystemRedeemCodesApi(configuration);

let take: number; // (optional) (default to undefined)
let skip: number; // (optional) (default to 0)

const { status, data } = await apiInstance.redeemControllerListCodes(
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

**CodeListResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | List codes |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **redeemControllerRedeem**
> RedeemResultResponse redeemControllerRedeem(redeemCodeDto)


### Example

```typescript
import {
    EcosystemRedeemCodesApi,
    Configuration,
    RedeemCodeDto
} from './api';

const configuration = new Configuration();
const apiInstance = new EcosystemRedeemCodesApi(configuration);

let redeemCodeDto: RedeemCodeDto; //

const { status, data } = await apiInstance.redeemControllerRedeem(
    redeemCodeDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **redeemCodeDto** | **RedeemCodeDto**|  | |


### Return type

**RedeemResultResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Redeemed a code |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **redeemControllerRevokeCode**
> RedeemCodeResponse redeemControllerRevokeCode()


### Example

```typescript
import {
    EcosystemRedeemCodesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new EcosystemRedeemCodesApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.redeemControllerRevokeCode(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**RedeemCodeResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Revoked code |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

