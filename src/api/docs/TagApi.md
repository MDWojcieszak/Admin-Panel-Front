# TagApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**tagControllerCreateTag**](#tagcontrollercreatetag) | **POST** /tag | |
|[**tagControllerDeleteTag**](#tagcontrollerdeletetag) | **DELETE** /tag/{id} | |
|[**tagControllerListTags**](#tagcontrollerlisttags) | **GET** /tag/list | |
|[**tagControllerUpdateTag**](#tagcontrollerupdatetag) | **PUT** /tag/{id} | |

# **tagControllerCreateTag**
> TagDetailResponseDto tagControllerCreateTag(tagCreateDto)


### Example

```typescript
import {
    TagApi,
    Configuration,
    TagCreateDto
} from './api';

const configuration = new Configuration();
const apiInstance = new TagApi(configuration);

let tagCreateDto: TagCreateDto; //

const { status, data } = await apiInstance.tagControllerCreateTag(
    tagCreateDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **tagCreateDto** | **TagCreateDto**|  | |


### Return type

**TagDetailResponseDto**

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

# **tagControllerDeleteTag**
> TagDetailResponseDto tagControllerDeleteTag()


### Example

```typescript
import {
    TagApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new TagApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.tagControllerDeleteTag(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**TagDetailResponseDto**

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

# **tagControllerListTags**
> TagListResponseDto tagControllerListTags()


### Example

```typescript
import {
    TagApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new TagApi(configuration);

const { status, data } = await apiInstance.tagControllerListTags();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**TagListResponseDto**

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

# **tagControllerUpdateTag**
> TagDetailResponseDto tagControllerUpdateTag(tagUpdateDto)


### Example

```typescript
import {
    TagApi,
    Configuration,
    TagUpdateDto
} from './api';

const configuration = new Configuration();
const apiInstance = new TagApi(configuration);

let id: string; // (default to undefined)
let tagUpdateDto: TagUpdateDto; //

const { status, data } = await apiInstance.tagControllerUpdateTag(
    id,
    tagUpdateDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **tagUpdateDto** | **TagUpdateDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**TagDetailResponseDto**

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

