# InquiriesApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**inquiryControllerGet**](#inquirycontrollerget) | **GET** /inquiries/{id} | |
|[**inquiryControllerGetSettings**](#inquirycontrollergetsettings) | **GET** /inquiries/settings | |
|[**inquiryControllerList**](#inquirycontrollerlist) | **GET** /inquiries | List inquiries|
|[**inquiryControllerPatch**](#inquirycontrollerpatch) | **PATCH** /inquiries/{id} | Change status or the internal note|
|[**inquiryControllerRemove**](#inquirycontrollerremove) | **DELETE** /inquiries/{id} | |
|[**inquiryControllerSummary**](#inquirycontrollersummary) | **GET** /inquiries/summary | |
|[**inquiryControllerUpdateSettings**](#inquirycontrollerupdatesettings) | **PATCH** /inquiries/settings | Update the contact form configuration|

# **inquiryControllerGet**
> InquiryResponse inquiryControllerGet()


### Example

```typescript
import {
    InquiriesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new InquiriesApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.inquiryControllerGet(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**InquiryResponse**

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

# **inquiryControllerGetSettings**
> ContactSettingsResponse inquiryControllerGetSettings()


### Example

```typescript
import {
    InquiriesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new InquiriesApi(configuration);

const { status, data } = await apiInstance.inquiryControllerGetSettings();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**ContactSettingsResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Contact form configuration |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **inquiryControllerList**
> InquiryListResponse inquiryControllerList()

Newest first. Without `status` it is the inbox: everything except ARCHIVED and SPAM.

### Example

```typescript
import {
    InquiriesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new InquiriesApi(configuration);

let take: number; // (optional) (default to undefined)
let skip: number; // (optional) (default to 0)
let status: InquiryStatus; // (optional) (default to undefined)
let topic: InquiryTopic; // (optional) (default to undefined)
let search: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.inquiryControllerList(
    take,
    skip,
    status,
    topic,
    search
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **take** | [**number**] |  | (optional) defaults to undefined|
| **skip** | [**number**] |  | (optional) defaults to 0|
| **status** | **InquiryStatus** |  | (optional) defaults to undefined|
| **topic** | **InquiryTopic** |  | (optional) defaults to undefined|
| **search** | [**string**] |  | (optional) defaults to undefined|


### Return type

**InquiryListResponse**

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

# **inquiryControllerPatch**
> InquiryResponse inquiryControllerPatch(patchInquiryDto)

Leaving NEW stamps readAt; ANSWERED stamps answeredAt; NEW again = mark as unread.

### Example

```typescript
import {
    InquiriesApi,
    Configuration,
    PatchInquiryDto
} from './api';

const configuration = new Configuration();
const apiInstance = new InquiriesApi(configuration);

let id: string; // (default to undefined)
let patchInquiryDto: PatchInquiryDto; //

const { status, data } = await apiInstance.inquiryControllerPatch(
    id,
    patchInquiryDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **patchInquiryDto** | **PatchInquiryDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**InquiryResponse**

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

# **inquiryControllerRemove**
> inquiryControllerRemove()


### Example

```typescript
import {
    InquiriesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new InquiriesApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.inquiryControllerRemove(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


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
|**200** | Deleted inquiry |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **inquiryControllerSummary**
> InquirySummaryResponse inquiryControllerSummary()


### Example

```typescript
import {
    InquiriesApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new InquiriesApi(configuration);

const { status, data } = await apiInstance.inquiryControllerSummary();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**InquirySummaryResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Counts for the navigation badge |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **inquiryControllerUpdateSettings**
> ContactSettingsResponse inquiryControllerUpdateSettings(updateContactSettingsDto)

Enabling is refused (400) until administratorName, administratorEmail and privacyNotice are filled in. A real change of privacyNotice bumps its version; each inquiry records the version its sender confirmed.

### Example

```typescript
import {
    InquiriesApi,
    Configuration,
    UpdateContactSettingsDto
} from './api';

const configuration = new Configuration();
const apiInstance = new InquiriesApi(configuration);

let updateContactSettingsDto: UpdateContactSettingsDto; //

const { status, data } = await apiInstance.inquiryControllerUpdateSettings(
    updateContactSettingsDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateContactSettingsDto** | **UpdateContactSettingsDto**|  | |


### Return type

**ContactSettingsResponse**

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

