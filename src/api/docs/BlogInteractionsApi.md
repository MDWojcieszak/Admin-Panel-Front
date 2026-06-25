# BlogInteractionsApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**interactionControllerDeleteFeedback**](#interactioncontrollerdeletefeedback) | **DELETE** /blog/posts/{postId}/feedback | |
|[**interactionControllerInsights**](#interactioncontrollerinsights) | **GET** /blog/posts/{postId}/insights | |
|[**interactionControllerInteractions**](#interactioncontrollerinteractions) | **GET** /blog/posts/{postId}/interactions | |
|[**interactionControllerLike**](#interactioncontrollerlike) | **POST** /blog/posts/{postId}/like | |
|[**interactionControllerUnlike**](#interactioncontrollerunlike) | **DELETE** /blog/posts/{postId}/like | |
|[**interactionControllerUpsertFeedback**](#interactioncontrollerupsertfeedback) | **PUT** /blog/posts/{postId}/feedback | |
|[**interactionControllerView**](#interactioncontrollerview) | **POST** /blog/posts/{postId}/view | |
|[**interactionControllerViewPublic**](#interactioncontrollerviewpublic) | **POST** /blog/posts/public/{postId}/view | |

# **interactionControllerDeleteFeedback**
> FeedbackResponse interactionControllerDeleteFeedback()


### Example

```typescript
import {
    BlogInteractionsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogInteractionsApi(configuration);

let postId: string; // (default to undefined)

const { status, data } = await apiInstance.interactionControllerDeleteFeedback(
    postId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **postId** | [**string**] |  | defaults to undefined|


### Return type

**FeedbackResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Deleted feedback |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **interactionControllerInsights**
> InsightsResponse interactionControllerInsights()


### Example

```typescript
import {
    BlogInteractionsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogInteractionsApi(configuration);

let postId: string; // (default to undefined)
let recentFeedbackLimit: number; //Recent feedback rows (1–100). (optional) (default to undefined)

const { status, data } = await apiInstance.interactionControllerInsights(
    postId,
    recentFeedbackLimit
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **postId** | [**string**] |  | defaults to undefined|
| **recentFeedbackLimit** | [**number**] | Recent feedback rows (1–100). | (optional) defaults to undefined|


### Return type

**InsightsResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Post analytics (staff) |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **interactionControllerInteractions**
> InteractionStateResponse interactionControllerInteractions()


### Example

```typescript
import {
    BlogInteractionsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogInteractionsApi(configuration);

let postId: string; // (default to undefined)

const { status, data } = await apiInstance.interactionControllerInteractions(
    postId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **postId** | [**string**] |  | defaults to undefined|


### Return type

**InteractionStateResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Viewer engagement state + counters |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **interactionControllerLike**
> LikeToggleResponse interactionControllerLike()


### Example

```typescript
import {
    BlogInteractionsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogInteractionsApi(configuration);

let postId: string; // (default to undefined)

const { status, data } = await apiInstance.interactionControllerLike(
    postId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **postId** | [**string**] |  | defaults to undefined|


### Return type

**LikeToggleResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Liked the post |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **interactionControllerUnlike**
> LikeToggleResponse interactionControllerUnlike()


### Example

```typescript
import {
    BlogInteractionsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogInteractionsApi(configuration);

let postId: string; // (default to undefined)

const { status, data } = await apiInstance.interactionControllerUnlike(
    postId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **postId** | [**string**] |  | defaults to undefined|


### Return type

**LikeToggleResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Unliked the post |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **interactionControllerUpsertFeedback**
> FeedbackResponse interactionControllerUpsertFeedback(upsertFeedbackDto)


### Example

```typescript
import {
    BlogInteractionsApi,
    Configuration,
    UpsertFeedbackDto
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogInteractionsApi(configuration);

let postId: string; // (default to undefined)
let upsertFeedbackDto: UpsertFeedbackDto; //

const { status, data } = await apiInstance.interactionControllerUpsertFeedback(
    postId,
    upsertFeedbackDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **upsertFeedbackDto** | **UpsertFeedbackDto**|  | |
| **postId** | [**string**] |  | defaults to undefined|


### Return type

**FeedbackResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Upserted feedback |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **interactionControllerView**
> ViewResultResponse interactionControllerView()


### Example

```typescript
import {
    BlogInteractionsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogInteractionsApi(configuration);

let postId: string; // (default to undefined)

const { status, data } = await apiInstance.interactionControllerView(
    postId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **postId** | [**string**] |  | defaults to undefined|


### Return type

**ViewResultResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Recorded a view |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **interactionControllerViewPublic**
> ViewResultResponse interactionControllerViewPublic()


### Example

```typescript
import {
    BlogInteractionsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new BlogInteractionsApi(configuration);

let postId: string; // (default to undefined)

const { status, data } = await apiInstance.interactionControllerViewPublic(
    postId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **postId** | [**string**] |  | defaults to undefined|


### Return type

**ViewResultResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Register a public post view |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

