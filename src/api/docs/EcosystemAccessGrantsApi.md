# EcosystemAccessGrantsApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**grantControllerIssue**](#grantcontrollerissue) | **POST** /ecosystem/grants | |
|[**grantControllerList**](#grantcontrollerlist) | **GET** /ecosystem/grants | |
|[**grantControllerMine**](#grantcontrollermine) | **GET** /ecosystem/grants/mine | |
|[**grantControllerRevoke**](#grantcontrollerrevoke) | **DELETE** /ecosystem/grants/{id} | |

# **grantControllerIssue**
> GrantResponse grantControllerIssue(createGrantDto)


### Example

```typescript
import {
    EcosystemAccessGrantsApi,
    Configuration,
    CreateGrantDto
} from './api';

const configuration = new Configuration();
const apiInstance = new EcosystemAccessGrantsApi(configuration);

let createGrantDto: CreateGrantDto; //

const { status, data } = await apiInstance.grantControllerIssue(
    createGrantDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createGrantDto** | **CreateGrantDto**|  | |


### Return type

**GrantResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Issued grant |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **grantControllerList**
> GrantListResponse grantControllerList()


### Example

```typescript
import {
    EcosystemAccessGrantsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new EcosystemAccessGrantsApi(configuration);

let take: number; // (optional) (default to undefined)
let skip: number; // (optional) (default to 0)
let userId: string; //Filter by user (admin only). (optional) (default to undefined)

const { status, data } = await apiInstance.grantControllerList(
    take,
    skip,
    userId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **take** | [**number**] |  | (optional) defaults to undefined|
| **skip** | [**number**] |  | (optional) defaults to 0|
| **userId** | [**string**] | Filter by user (admin only). | (optional) defaults to undefined|


### Return type

**GrantListResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | List grants |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **grantControllerMine**
> GrantListResponse grantControllerMine()


### Example

```typescript
import {
    EcosystemAccessGrantsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new EcosystemAccessGrantsApi(configuration);

let take: number; // (optional) (default to undefined)
let skip: number; // (optional) (default to 0)
let userId: string; //Filter by user (admin only). (optional) (default to undefined)

const { status, data } = await apiInstance.grantControllerMine(
    take,
    skip,
    userId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **take** | [**number**] |  | (optional) defaults to undefined|
| **skip** | [**number**] |  | (optional) defaults to 0|
| **userId** | [**string**] | Filter by user (admin only). | (optional) defaults to undefined|


### Return type

**GrantListResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | My access grants |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **grantControllerRevoke**
> GrantResponse grantControllerRevoke()


### Example

```typescript
import {
    EcosystemAccessGrantsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new EcosystemAccessGrantsApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.grantControllerRevoke(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**GrantResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Revoked grant |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

