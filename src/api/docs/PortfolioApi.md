# PortfolioApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**portfolioControllerBySlug**](#portfoliocontrollerbyslug) | **GET** /portfolio/galleries/{slug} | |
|[**portfolioControllerGear**](#portfoliocontrollergear) | **GET** /portfolio/gear | |
|[**portfolioControllerHero**](#portfoliocontrollerhero) | **GET** /portfolio/hero | |
|[**portfolioControllerHome**](#portfoliocontrollerhome) | **GET** /portfolio/home | |
|[**portfolioControllerListGalleries**](#portfoliocontrollerlistgalleries) | **GET** /portfolio/galleries | |
|[**portfolioControllerSettings**](#portfoliocontrollersettings) | **GET** /portfolio/settings | |
|[**publicContactControllerGet**](#publiccontactcontrollerget) | **GET** /portfolio/contact | Contact form configuration|
|[**publicInquiryControllerCreate**](#publicinquirycontrollercreate) | **POST** /portfolio/inquiries | Send an inquiry from the contact form|

# **portfolioControllerBySlug**
> PortfolioGalleryPageResponse portfolioControllerBySlug()


### Example

```typescript
import {
    PortfolioApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PortfolioApi(configuration);

let slug: string; // (default to undefined)
let orientation: ImageOrientation; // (optional) (default to undefined)
let locale: string; // (optional) (default to undefined)
let take: number; // (optional) (default to undefined)
let skip: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.portfolioControllerBySlug(
    slug,
    orientation,
    locale,
    take,
    skip
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **slug** | [**string**] |  | defaults to undefined|
| **orientation** | **ImageOrientation** |  | (optional) defaults to undefined|
| **locale** | [**string**] |  | (optional) defaults to undefined|
| **take** | [**number**] |  | (optional) defaults to undefined|
| **skip** | [**number**] |  | (optional) defaults to undefined|


### Return type

**PortfolioGalleryPageResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | A published gallery with its ordered, visible images and the contact form (privacy notice included) in the language given by ?locale&#x3D; |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **portfolioControllerGear**
> GearOverviewResponse portfolioControllerGear()


### Example

```typescript
import {
    PortfolioApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PortfolioApi(configuration);

const { status, data } = await apiInstance.portfolioControllerGear();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**GearOverviewResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Photographer gear grouped by camera system (visible only) |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **portfolioControllerHero**
> PortfolioHeroResponse portfolioControllerHero()


### Example

```typescript
import {
    PortfolioApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PortfolioApi(configuration);

let limit: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.portfolioControllerHero(
    limit
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **limit** | [**number**] |  | (optional) defaults to undefined|


### Return type

**PortfolioHeroResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Hero-role images for the homepage |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **portfolioControllerHome**
> PortfolioHomeResponse portfolioControllerHome()


### Example

```typescript
import {
    PortfolioApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PortfolioApi(configuration);

const { status, data } = await apiInstance.portfolioControllerHome();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**PortfolioHomeResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Composed home page: hero + featured galleries with previews |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **portfolioControllerListGalleries**
> PortfolioGalleryListResponse portfolioControllerListGalleries()


### Example

```typescript
import {
    PortfolioApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PortfolioApi(configuration);

const { status, data } = await apiInstance.portfolioControllerListGalleries();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**PortfolioGalleryListResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Published galleries |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **portfolioControllerSettings**
> PortfolioSettingsResponse portfolioControllerSettings()


### Example

```typescript
import {
    PortfolioApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PortfolioApi(configuration);

const { status, data } = await apiInstance.portfolioControllerSettings();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**PortfolioSettingsResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Public portfolio home settings (display limits) |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **publicContactControllerGet**
> PublicContactResponse publicContactControllerGet()

?locale=en picks the language (default one when missing). enabled=false → hide the form. Otherwise: intro, offered topics, the privacy notice (markdown) with its version, and the data controller.

### Example

```typescript
import {
    PortfolioApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PortfolioApi(configuration);

let locale: string; // (default to undefined)

const { status, data } = await apiInstance.publicContactControllerGet(
    locale
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **locale** | [**string**] |  | defaults to undefined|


### Return type

**PublicContactResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **publicInquiryControllerCreate**
> InquiryReceivedResponse publicInquiryControllerCreate(createInquiryDto)

No account needed. Optional galleryId / imageId say what it is about (must be public). acknowledgedPrivacyNotice must be true; 403 while the form is disabled in the panel. Keep the honeypot `website` field hidden and empty. The answer is the same for every accepted submission.

### Example

```typescript
import {
    PortfolioApi,
    Configuration,
    CreateInquiryDto
} from './api';

const configuration = new Configuration();
const apiInstance = new PortfolioApi(configuration);

let createInquiryDto: CreateInquiryDto; //

const { status, data } = await apiInstance.publicInquiryControllerCreate(
    createInquiryDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createInquiryDto** | **CreateInquiryDto**|  | |


### Return type

**InquiryReceivedResponse**

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

