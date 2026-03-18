# DefaultApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**serverTransferControllerCreate**](#servertransfercontrollercreate) | **POST** /server-transfer/category/{id} | |
|[**serverTransferControllerListByCategory**](#servertransfercontrollerlistbycategory) | **GET** /server-transfer/category/{id} | |
|[**serverTransferControllerPatch**](#servertransfercontrollerpatch) | **PATCH** /server-transfer/{id} | |

# **serverTransferControllerCreate**
> ServerTransferResponse serverTransferControllerCreate(createServerTransferDto)


### Example

```typescript
import {
    DefaultApi,
    Configuration,
    CreateServerTransferDto
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let id: string; // (default to undefined)
let createServerTransferDto: CreateServerTransferDto; //

const { status, data } = await apiInstance.serverTransferControllerCreate(
    id,
    createServerTransferDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createServerTransferDto** | **CreateServerTransferDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**ServerTransferResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Created transfer |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **serverTransferControllerListByCategory**
> ServerTransferListResponse serverTransferControllerListByCategory()


### Example

```typescript
import {
    DefaultApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.serverTransferControllerListByCategory(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**ServerTransferListResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | List transfers by category |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **serverTransferControllerPatch**
> ServerTransferResponse serverTransferControllerPatch(patchServerTransferDto)


### Example

```typescript
import {
    DefaultApi,
    Configuration,
    PatchServerTransferDto
} from './api';

const configuration = new Configuration();
const apiInstance = new DefaultApi(configuration);

let id: string; // (default to undefined)
let patchServerTransferDto: PatchServerTransferDto; //

const { status, data } = await apiInstance.serverTransferControllerPatch(
    id,
    patchServerTransferDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **patchServerTransferDto** | **PatchServerTransferDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**ServerTransferResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Patched transfer |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

