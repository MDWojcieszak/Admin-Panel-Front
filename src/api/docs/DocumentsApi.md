# DocumentsApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**documentControllerFile**](#documentcontrollerfile) | **GET** /documents/{id}/file | A document file or preview (signed URL)|
|[**documentControllerGet**](#documentcontrollerget) | **GET** /documents/{id} | |
|[**documentControllerLink**](#documentcontrollerlink) | **POST** /documents/{id}/links | |
|[**documentControllerList**](#documentcontrollerlist) | **GET** /documents | |
|[**documentControllerRemove**](#documentcontrollerremove) | **DELETE** /documents/{id} | |
|[**documentControllerUnlink**](#documentcontrollerunlink) | **DELETE** /documents/{id}/links/{linkId} | |
|[**documentControllerUpdate**](#documentcontrollerupdate) | **PATCH** /documents/{id} | |
|[**documentControllerUpload**](#documentcontrollerupload) | **POST** /documents | Upload any file to your library|

# **documentControllerFile**
> documentControllerFile()

Do not build this URL: take fileUrl / thumbUrl / previewUrl from the document.

### Example

```typescript
import {
    DocumentsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DocumentsApi(configuration);

let id: string; // (default to undefined)
let variant: DocumentVariant; // (default to undefined)
let exp: string; // (default to undefined)
let sig: string; // (default to undefined)
let download: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.documentControllerFile(
    id,
    variant,
    exp,
    sig,
    download
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|
| **variant** | **DocumentVariant** |  | defaults to undefined|
| **exp** | [**string**] |  | defaults to undefined|
| **sig** | [**string**] |  | defaults to undefined|
| **download** | [**string**] |  | (optional) defaults to undefined|


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **documentControllerGet**
> DocumentResponse documentControllerGet()


### Example

```typescript
import {
    DocumentsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DocumentsApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.documentControllerGet(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**DocumentResponse**

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

# **documentControllerLink**
> DocumentResponse documentControllerLink(createDocumentLinkDto)


### Example

```typescript
import {
    DocumentsApi,
    Configuration,
    CreateDocumentLinkDto
} from './api';

const configuration = new Configuration();
const apiInstance = new DocumentsApi(configuration);

let id: string; // (default to undefined)
let createDocumentLinkDto: CreateDocumentLinkDto; //

const { status, data } = await apiInstance.documentControllerLink(
    id,
    createDocumentLinkDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createDocumentLinkDto** | **CreateDocumentLinkDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**DocumentResponse**

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

# **documentControllerList**
> Array<DocumentResponse> documentControllerList()


### Example

```typescript
import {
    DocumentsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DocumentsApi(configuration);

let projectId: string; // (optional) (default to undefined)
let taskId: string; // (optional) (default to undefined)
let q: string; // (optional) (default to undefined)
let kind: DocumentKind; // (optional) (default to undefined)

const { status, data } = await apiInstance.documentControllerList(
    projectId,
    taskId,
    q,
    kind
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **projectId** | [**string**] |  | (optional) defaults to undefined|
| **taskId** | [**string**] |  | (optional) defaults to undefined|
| **q** | [**string**] |  | (optional) defaults to undefined|
| **kind** | **DocumentKind** |  | (optional) defaults to undefined|


### Return type

**Array<DocumentResponse>**

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

# **documentControllerRemove**
> documentControllerRemove()


### Example

```typescript
import {
    DocumentsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DocumentsApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.documentControllerRemove(
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
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **documentControllerUnlink**
> DocumentResponse documentControllerUnlink()


### Example

```typescript
import {
    DocumentsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DocumentsApi(configuration);

let id: string; // (default to undefined)
let linkId: string; // (default to undefined)

const { status, data } = await apiInstance.documentControllerUnlink(
    id,
    linkId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|
| **linkId** | [**string**] |  | defaults to undefined|


### Return type

**DocumentResponse**

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

# **documentControllerUpdate**
> DocumentResponse documentControllerUpdate(updateDocumentDto)


### Example

```typescript
import {
    DocumentsApi,
    Configuration,
    UpdateDocumentDto
} from './api';

const configuration = new Configuration();
const apiInstance = new DocumentsApi(configuration);

let id: string; // (default to undefined)
let updateDocumentDto: UpdateDocumentDto; //

const { status, data } = await apiInstance.documentControllerUpdate(
    id,
    updateDocumentDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateDocumentDto** | **UpdateDocumentDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**DocumentResponse**

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

# **documentControllerUpload**
> UploadDocumentResponse documentControllerUpload()

Optionally pinned to a project or task at once. The same file uploaded again returns the document you already have (duplicate: true).

### Example

```typescript
import {
    DocumentsApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DocumentsApi(configuration);

let file: File; // (default to undefined)
let title: string; // (optional) (default to undefined)
let description: string; // (optional) (default to undefined)
let projectId: string; // (optional) (default to undefined)
let taskId: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.documentControllerUpload(
    file,
    title,
    description,
    projectId,
    taskId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **file** | [**File**] |  | defaults to undefined|
| **title** | [**string**] |  | (optional) defaults to undefined|
| **description** | [**string**] |  | (optional) defaults to undefined|
| **projectId** | [**string**] |  | (optional) defaults to undefined|
| **taskId** | [**string**] |  | (optional) defaults to undefined|


### Return type

**UploadDocumentResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: multipart/form-data
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

