# PortfolioApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**portfolioControllerBySlug**](#portfoliocontrollerbyslug) | **GET** /portfolio/galleries/{slug} | |
|[**portfolioControllerGear**](#portfoliocontrollergear) | **GET** /portfolio/gear | |
|[**portfolioControllerHero**](#portfoliocontrollerhero) | **GET** /portfolio/hero | |
|[**portfolioControllerListGalleries**](#portfoliocontrollerlistgalleries) | **GET** /portfolio/galleries | |

# **portfolioControllerBySlug**
> PortfolioGalleryDetailResponse portfolioControllerBySlug()


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

const { status, data } = await apiInstance.portfolioControllerBySlug(
    slug,
    orientation
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **slug** | [**string**] |  | defaults to undefined|
| **orientation** | **ImageOrientation** |  | (optional) defaults to undefined|


### Return type

**PortfolioGalleryDetailResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | A published gallery with its ordered, visible images |  -  |

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

