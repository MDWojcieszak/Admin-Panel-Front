# PhotoEntryApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**photoEntryCommentControllerCreate**](#photoentrycommentcontrollercreate) | **POST** /photo-entry/{id}/comments | Add a comment|
|[**photoEntryCommentControllerList**](#photoentrycommentcontrollerlist) | **GET** /photo-entry/{id}/comments | Comments of an entry, grouped by stage|
|[**photoEntryCommentControllerPatch**](#photoentrycommentcontrollerpatch) | **PATCH** /photo-entry/comments/{commentId} | Edit body or kind|
|[**photoEntryCommentControllerRemove**](#photoentrycommentcontrollerremove) | **DELETE** /photo-entry/comments/{commentId} | |
|[**photoEntryCommentControllerReopen**](#photoentrycommentcontrollerreopen) | **POST** /photo-entry/comments/{commentId}/reopen | Undo a resolve|
|[**photoEntryCommentControllerResolve**](#photoentrycommentcontrollerresolve) | **POST** /photo-entry/comments/{commentId}/resolve | Tick a TODO off (TODO comments only)|
|[**photoEntryControllerCreate**](#photoentrycontrollercreate) | **POST** /photo-entry | |
|[**photoEntryControllerCreateFolders**](#photoentrycontrollercreatefolders) | **POST** /photo-entry/{id}/create-folders | |
|[**photoEntryControllerDelete**](#photoentrycontrollerdelete) | **DELETE** /photo-entry/{id} | |
|[**photoEntryControllerGetById**](#photoentrycontrollergetbyid) | **GET** /photo-entry/{id} | |
|[**photoEntryControllerGetFolderStructure**](#photoentrycontrollergetfolderstructure) | **GET** /photo-entry/{id}/folder-structure | Folder layout of a single entry|
|[**photoEntryControllerList**](#photoentrycontrollerlist) | **GET** /photo-entry | |
|[**photoEntryControllerMarkMediaUploaded**](#photoentrycontrollermarkmediauploaded) | **POST** /photo-entry/{id}/mark-media-uploaded | Mark all media as secured|
|[**photoEntryControllerPatch**](#photoentrycontrollerpatch) | **PATCH** /photo-entry/{id} | |
|[**photoEntryControllerPatchPostStage**](#photoentrycontrollerpatchpoststage) | **PATCH** /photo-entry/{id}/post-stage | |
|[**photoEntryControllerPatchProgress**](#photoentrycontrollerpatchprogress) | **PATCH** /photo-entry/{id}/progress | |
|[**photoEntryControllerPatchStatus**](#photoentrycontrollerpatchstatus) | **PATCH** /photo-entry/{id}/status | |
|[**photoEntryControllerRefreshCounts**](#photoentrycontrollerrefreshcounts) | **POST** /photo-entry/{id}/refresh-counts | Count photos from the entry folders|
|[**photoEntryExportControllerPreview**](#photoentryexportcontrollerpreview) | **GET** /photo-entry/{id}/exports/preview | Preview of an export file (signed URL)|
|[**photoEntryExportControllerPublish**](#photoentryexportcontrollerpublish) | **POST** /photo-entry/{id}/exports/publish | Publish selected export files to a gallery|
|[**photoEntryExportControllerScan**](#photoentryexportcontrollerscan) | **GET** /photo-entry/{id}/exports | Scan the export folder|
|[**photoEntryGearControllerAdd**](#photoentrygearcontrolleradd) | **POST** /photo-entry/{id}/gear/{gearItemId} | |
|[**photoEntryGearControllerAddFromKit**](#photoentrygearcontrolleraddfromkit) | **POST** /photo-entry/{id}/gear/from-kit/{kitId} | Expand a kit into the list|
|[**photoEntryGearControllerConfirm**](#photoentrygearcontrollerconfirm) | **POST** /photo-entry/{id}/gear/confirm | Declare the gear as complete|
|[**photoEntryGearControllerList**](#photoentrygearcontrollerlist) | **GET** /photo-entry/{id}/gear | Gear list of an entry|
|[**photoEntryGearControllerPatch**](#photoentrygearcontrollerpatch) | **PATCH** /photo-entry/{id}/gear/{gearItemId} | Tick one row|
|[**photoEntryGearControllerPendingMedia**](#photoentrygearcontrollerpendingmedia) | **GET** /photo-entry/pending-media | Media still waiting to be secured|
|[**photoEntryGearControllerRemove**](#photoentrygearcontrollerremove) | **DELETE** /photo-entry/{id}/gear/{gearItemId} | |
|[**photoEntryGearControllerReplace**](#photoentrygearcontrollerreplace) | **PUT** /photo-entry/{id}/gear | Replace the gear list|
|[**photoEntryGearControllerShoppingList**](#photoentrygearcontrollershoppinglist) | **GET** /photo-entry/{id}/shopping-list | |
|[**photoEntryPlanningControllerGet**](#photoentryplanningcontrollerget) | **GET** /photo-entry/attention | What needs a decision|
|[**photoEntryPlanningControllerGetForecast**](#photoentryplanningcontrollergetforecast) | **GET** /photo-entry/{id}/forecast | Weather forecast for the entry (Open-Meteo)|
|[**photoEntryPlanningControllerGetSky**](#photoentryplanningcontrollergetsky) | **GET** /photo-entry/{id}/sky | Sun, moon, darkness and eclipses for the entry|

# **photoEntryCommentControllerCreate**
> PhotoEntryCommentResponse photoEntryCommentControllerCreate(createPhotoEntryCommentDto)

The stage is stamped from the entry as it is now and cannot be changed later.

### Example

```typescript
import {
    PhotoEntryApi,
    Configuration,
    CreatePhotoEntryCommentDto
} from './api';

const configuration = new Configuration();
const apiInstance = new PhotoEntryApi(configuration);

let id: string; // (default to undefined)
let createPhotoEntryCommentDto: CreatePhotoEntryCommentDto; //

const { status, data } = await apiInstance.photoEntryCommentControllerCreate(
    id,
    createPhotoEntryCommentDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createPhotoEntryCommentDto** | **CreatePhotoEntryCommentDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**PhotoEntryCommentResponse**

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

# **photoEntryCommentControllerList**
> PhotoEntryCommentListResponse photoEntryCommentControllerList()

Groups follow the entry history: planning, after the shoot, selecting, editing, finished. `unresolved=true` keeps only open TODOs.

### Example

```typescript
import {
    PhotoEntryApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PhotoEntryApi(configuration);

let id: string; // (default to undefined)
let unresolved: boolean; // (optional) (default to undefined)
let kind: PhotoEntryCommentKind; // (optional) (default to undefined)

const { status, data } = await apiInstance.photoEntryCommentControllerList(
    id,
    unresolved,
    kind
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|
| **unresolved** | [**boolean**] |  | (optional) defaults to undefined|
| **kind** | **PhotoEntryCommentKind** |  | (optional) defaults to undefined|


### Return type

**PhotoEntryCommentListResponse**

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

# **photoEntryCommentControllerPatch**
> PhotoEntryCommentResponse photoEntryCommentControllerPatch(patchPhotoEntryCommentDto)

Turning a TODO into another kind drops its resolution.

### Example

```typescript
import {
    PhotoEntryApi,
    Configuration,
    PatchPhotoEntryCommentDto
} from './api';

const configuration = new Configuration();
const apiInstance = new PhotoEntryApi(configuration);

let commentId: string; // (default to undefined)
let patchPhotoEntryCommentDto: PatchPhotoEntryCommentDto; //

const { status, data } = await apiInstance.photoEntryCommentControllerPatch(
    commentId,
    patchPhotoEntryCommentDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **patchPhotoEntryCommentDto** | **PatchPhotoEntryCommentDto**|  | |
| **commentId** | [**string**] |  | defaults to undefined|


### Return type

**PhotoEntryCommentResponse**

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

# **photoEntryCommentControllerRemove**
> photoEntryCommentControllerRemove()


### Example

```typescript
import {
    PhotoEntryApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PhotoEntryApi(configuration);

let commentId: string; // (default to undefined)

const { status, data } = await apiInstance.photoEntryCommentControllerRemove(
    commentId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **commentId** | [**string**] |  | defaults to undefined|


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
|**200** | Deleted comment |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **photoEntryCommentControllerReopen**
> PhotoEntryCommentResponse photoEntryCommentControllerReopen()


### Example

```typescript
import {
    PhotoEntryApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PhotoEntryApi(configuration);

let commentId: string; // (default to undefined)

const { status, data } = await apiInstance.photoEntryCommentControllerReopen(
    commentId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **commentId** | [**string**] |  | defaults to undefined|


### Return type

**PhotoEntryCommentResponse**

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

# **photoEntryCommentControllerResolve**
> PhotoEntryCommentResponse photoEntryCommentControllerResolve()


### Example

```typescript
import {
    PhotoEntryApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PhotoEntryApi(configuration);

let commentId: string; // (default to undefined)

const { status, data } = await apiInstance.photoEntryCommentControllerResolve(
    commentId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **commentId** | [**string**] |  | defaults to undefined|


### Return type

**PhotoEntryCommentResponse**

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

# **photoEntryControllerCreate**
> PhotoEntryResponse photoEntryControllerCreate(createPhotoEntryDto)


### Example

```typescript
import {
    PhotoEntryApi,
    Configuration,
    CreatePhotoEntryDto
} from './api';

const configuration = new Configuration();
const apiInstance = new PhotoEntryApi(configuration);

let createPhotoEntryDto: CreatePhotoEntryDto; //

const { status, data } = await apiInstance.photoEntryControllerCreate(
    createPhotoEntryDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createPhotoEntryDto** | **CreatePhotoEntryDto**|  | |


### Return type

**PhotoEntryResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Created photo entry |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **photoEntryControllerCreateFolders**
> PhotoEntryResponse photoEntryControllerCreateFolders()


### Example

```typescript
import {
    PhotoEntryApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PhotoEntryApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.photoEntryControllerCreateFolders(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**PhotoEntryResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Created photo entry folders |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **photoEntryControllerDelete**
> PhotoEntryResponse photoEntryControllerDelete()


### Example

```typescript
import {
    PhotoEntryApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PhotoEntryApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.photoEntryControllerDelete(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**PhotoEntryResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Deleted photo entry |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **photoEntryControllerGetById**
> PhotoEntryDetailsResponse photoEntryControllerGetById()


### Example

```typescript
import {
    PhotoEntryApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PhotoEntryApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.photoEntryControllerGetById(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**PhotoEntryDetailsResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Photo entry details |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **photoEntryControllerGetFolderStructure**
> PhotoEntryFolderStructureResponse photoEntryControllerGetFolderStructure()

For external tools that create or mirror the entry folders themselves. Returns the entry root folder plus the sub-folders to create under it, each tagged with a stable `role` — match on the role, not on the path. GENERAL and WORK entries only: ASTRO entries are filed per astro object and have no single root.

### Example

```typescript
import {
    PhotoEntryApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PhotoEntryApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.photoEntryControllerGetFolderStructure(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**PhotoEntryFolderStructureResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Entry root folder and its sub-folder structure |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **photoEntryControllerList**
> PhotoEntryListResponse photoEntryControllerList()


### Example

```typescript
import {
    PhotoEntryApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PhotoEntryApi(configuration);

let type: PhotoEntryType; // (optional) (default to undefined)
let status: PhotoEntryStatus; // (optional) (default to undefined)
let postStage: PhotoEntryPostStage; // (optional) (default to undefined)
let astroObjectId: string; // (optional) (default to undefined)
let search: string; // (optional) (default to undefined)
let take: number; // (optional) (default to undefined)
let skip: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.photoEntryControllerList(
    type,
    status,
    postStage,
    astroObjectId,
    search,
    take,
    skip
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **type** | **PhotoEntryType** |  | (optional) defaults to undefined|
| **status** | **PhotoEntryStatus** |  | (optional) defaults to undefined|
| **postStage** | **PhotoEntryPostStage** |  | (optional) defaults to undefined|
| **astroObjectId** | [**string**] |  | (optional) defaults to undefined|
| **search** | [**string**] |  | (optional) defaults to undefined|
| **take** | [**number**] |  | (optional) defaults to undefined|
| **skip** | [**number**] |  | (optional) defaults to undefined|


### Return type

**PhotoEntryListResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | List photo entries |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **photoEntryControllerMarkMediaUploaded**
> PhotoEntryResponse photoEntryControllerMarkMediaUploaded()

Shortcut for \"everything is offloaded\": secures every used gear row that produces media and declares the gear, then derives uploadStatus.

### Example

```typescript
import {
    PhotoEntryApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PhotoEntryApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.photoEntryControllerMarkMediaUploaded(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**PhotoEntryResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Photo entry with media marked as uploaded |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **photoEntryControllerPatch**
> PhotoEntryResponse photoEntryControllerPatch(patchPhotoEntryDto)


### Example

```typescript
import {
    PhotoEntryApi,
    Configuration,
    PatchPhotoEntryDto
} from './api';

const configuration = new Configuration();
const apiInstance = new PhotoEntryApi(configuration);

let id: string; // (default to undefined)
let patchPhotoEntryDto: PatchPhotoEntryDto; //

const { status, data } = await apiInstance.photoEntryControllerPatch(
    id,
    patchPhotoEntryDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **patchPhotoEntryDto** | **PatchPhotoEntryDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**PhotoEntryResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Patched photo entry |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **photoEntryControllerPatchPostStage**
> PhotoEntryResponse photoEntryControllerPatchPostStage(patchPhotoEntryPostStageDto)


### Example

```typescript
import {
    PhotoEntryApi,
    Configuration,
    PatchPhotoEntryPostStageDto
} from './api';

const configuration = new Configuration();
const apiInstance = new PhotoEntryApi(configuration);

let id: string; // (default to undefined)
let patchPhotoEntryPostStageDto: PatchPhotoEntryPostStageDto; //

const { status, data } = await apiInstance.photoEntryControllerPatchPostStage(
    id,
    patchPhotoEntryPostStageDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **patchPhotoEntryPostStageDto** | **PatchPhotoEntryPostStageDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**PhotoEntryResponse**

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

# **photoEntryControllerPatchProgress**
> PhotoEntryResponse photoEntryControllerPatchProgress(patchPhotoEntryProgressDto)


### Example

```typescript
import {
    PhotoEntryApi,
    Configuration,
    PatchPhotoEntryProgressDto
} from './api';

const configuration = new Configuration();
const apiInstance = new PhotoEntryApi(configuration);

let id: string; // (default to undefined)
let patchPhotoEntryProgressDto: PatchPhotoEntryProgressDto; //

const { status, data } = await apiInstance.photoEntryControllerPatchProgress(
    id,
    patchPhotoEntryProgressDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **patchPhotoEntryProgressDto** | **PatchPhotoEntryProgressDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**PhotoEntryResponse**

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

# **photoEntryControllerPatchStatus**
> PhotoEntryResponse photoEntryControllerPatchStatus(patchPhotoEntryStatusDto)


### Example

```typescript
import {
    PhotoEntryApi,
    Configuration,
    PatchPhotoEntryStatusDto
} from './api';

const configuration = new Configuration();
const apiInstance = new PhotoEntryApi(configuration);

let id: string; // (default to undefined)
let patchPhotoEntryStatusDto: PatchPhotoEntryStatusDto; //

const { status, data } = await apiInstance.photoEntryControllerPatchStatus(
    id,
    patchPhotoEntryStatusDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **patchPhotoEntryStatusDto** | **PatchPhotoEntryStatusDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**PhotoEntryResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Patched photo entry status |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **photoEntryControllerRefreshCounts**
> PhotoEntryResponse photoEntryControllerRefreshCounts()

photoCount from SOURCE (RAW+JPEG pairs count once; VIDEO and SEQUENCES excluded), selectedCount from SELECTS, editedCount from EXPORT. A stage holding fewer frames than the next one is reported as unknown. Always applies; the nightly run instead keeps counts reported after the folders last changed. GENERAL and WORK entries with created folders only.

### Example

```typescript
import {
    PhotoEntryApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PhotoEntryApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.photoEntryControllerRefreshCounts(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**PhotoEntryResponse**

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

# **photoEntryExportControllerPreview**
> photoEntryExportControllerPreview()

Do not build this URL — take thumbUrl / previewUrl from the scan.

### Example

```typescript
import {
    PhotoEntryApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PhotoEntryApi(configuration);

let id: string; // (default to undefined)
let key: string; // (default to undefined)
let size: PreviewSize; // (default to undefined)
let exp: number; // (default to undefined)
let sig: string; // (default to undefined)
let v: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.photoEntryExportControllerPreview(
    id,
    key,
    size,
    exp,
    sig,
    v
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|
| **key** | [**string**] |  | defaults to undefined|
| **size** | **PreviewSize** |  | defaults to undefined|
| **exp** | [**number**] |  | defaults to undefined|
| **sig** | [**string**] |  | defaults to undefined|
| **v** | [**string**] |  | (optional) defaults to undefined|


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

# **photoEntryExportControllerPublish**
> PublishExportsResponse photoEntryExportControllerPublish(publishExportsDto)

Queues the files and returns at once; progress shows in the next scan. NEW files are uploaded, CHANGED (re-exported) ones replace their image in place, PUBLISHED ones are skipped. A new gallery is created as DRAFT.

### Example

```typescript
import {
    PhotoEntryApi,
    Configuration,
    PublishExportsDto
} from './api';

const configuration = new Configuration();
const apiInstance = new PhotoEntryApi(configuration);

let id: string; // (default to undefined)
let publishExportsDto: PublishExportsDto; //

const { status, data } = await apiInstance.photoEntryExportControllerPublish(
    id,
    publishExportsDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **publishExportsDto** | **PublishExportsDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**PublishExportsResponse**

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

# **photoEntryExportControllerScan**
> ExportScanResponse photoEntryExportControllerScan()

Lists 04_EXPORT on demand with each file’s publication status (NEW, PENDING, PUBLISHED, CHANGED, FAILED) and signed preview URLs valid ~1 h — use them directly in <img loading=\"lazy\">. GENERAL and WORK entries with created folders only.

### Example

```typescript
import {
    PhotoEntryApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PhotoEntryApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.photoEntryExportControllerScan(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**ExportScanResponse**

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

# **photoEntryGearControllerAdd**
> PhotoEntryGearListResponse photoEntryGearControllerAdd(addPhotoEntryGearDto)


### Example

```typescript
import {
    PhotoEntryApi,
    Configuration,
    AddPhotoEntryGearDto
} from './api';

const configuration = new Configuration();
const apiInstance = new PhotoEntryApi(configuration);

let id: string; // (default to undefined)
let gearItemId: string; // (default to undefined)
let addPhotoEntryGearDto: AddPhotoEntryGearDto; //

const { status, data } = await apiInstance.photoEntryGearControllerAdd(
    id,
    gearItemId,
    addPhotoEntryGearDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **addPhotoEntryGearDto** | **AddPhotoEntryGearDto**|  | |
| **id** | [**string**] |  | defaults to undefined|
| **gearItemId** | [**string**] |  | defaults to undefined|


### Return type

**PhotoEntryGearListResponse**

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

# **photoEntryGearControllerAddFromKit**
> PhotoEntryGearListResponse photoEntryGearControllerAddFromKit()

Copies the kit into ordinary rows. Rows already on the list are kept; RETIRED gear is skipped.

### Example

```typescript
import {
    PhotoEntryApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PhotoEntryApi(configuration);

let id: string; // (default to undefined)
let kitId: string; // (default to undefined)

const { status, data } = await apiInstance.photoEntryGearControllerAddFromKit(
    id,
    kitId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|
| **kitId** | [**string**] |  | defaults to undefined|


### Return type

**PhotoEntryGearListResponse**

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

# **photoEntryGearControllerConfirm**
> PhotoEntryGearListResponse photoEntryGearControllerConfirm()

SHOT entries only; valid with an empty list.

### Example

```typescript
import {
    PhotoEntryApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PhotoEntryApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.photoEntryGearControllerConfirm(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**PhotoEntryGearListResponse**

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

# **photoEntryGearControllerList**
> PhotoEntryGearListResponse photoEntryGearControllerList()

One list, read by phase: PACK before the shoot, SECURE after it. `listed` marks the rows that belong on the list for the current phase.

### Example

```typescript
import {
    PhotoEntryApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PhotoEntryApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.photoEntryGearControllerList(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**PhotoEntryGearListResponse**

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

# **photoEntryGearControllerPatch**
> PhotoEntryGearListResponse photoEntryGearControllerPatch(patchPhotoEntryGearDto)

`secured: true` implies `used`; `used: false` clears `secured`. used/secured need a SHOT entry and gear that is not on the wishlist.

### Example

```typescript
import {
    PhotoEntryApi,
    Configuration,
    PatchPhotoEntryGearDto
} from './api';

const configuration = new Configuration();
const apiInstance = new PhotoEntryApi(configuration);

let id: string; // (default to undefined)
let gearItemId: string; // (default to undefined)
let patchPhotoEntryGearDto: PatchPhotoEntryGearDto; //

const { status, data } = await apiInstance.photoEntryGearControllerPatch(
    id,
    gearItemId,
    patchPhotoEntryGearDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **patchPhotoEntryGearDto** | **PatchPhotoEntryGearDto**|  | |
| **id** | [**string**] |  | defaults to undefined|
| **gearItemId** | [**string**] |  | defaults to undefined|


### Return type

**PhotoEntryGearListResponse**

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

# **photoEntryGearControllerPendingMedia**
> PendingMediaResponse photoEntryGearControllerPendingMedia()

`unsecured`: declared gear with media not yet offloaded/scanned/copied, with per-source thresholds (cards 7 days, film 90). `undeclared`: SHOT entries whose gear was never declared — unknown, never emailed about.

### Example

```typescript
import {
    PhotoEntryApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PhotoEntryApi(configuration);

const { status, data } = await apiInstance.photoEntryGearControllerPendingMedia();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**PendingMediaResponse**

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

# **photoEntryGearControllerRemove**
> PhotoEntryGearListResponse photoEntryGearControllerRemove()


### Example

```typescript
import {
    PhotoEntryApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PhotoEntryApi(configuration);

let id: string; // (default to undefined)
let gearItemId: string; // (default to undefined)

const { status, data } = await apiInstance.photoEntryGearControllerRemove(
    id,
    gearItemId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|
| **gearItemId** | [**string**] |  | defaults to undefined|


### Return type

**PhotoEntryGearListResponse**

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

# **photoEntryGearControllerReplace**
> PhotoEntryGearListResponse photoEntryGearControllerReplace(putPhotoEntryGearDto)

Rows missing from `items` are removed; omitted flags on existing rows are left alone.

### Example

```typescript
import {
    PhotoEntryApi,
    Configuration,
    PutPhotoEntryGearDto
} from './api';

const configuration = new Configuration();
const apiInstance = new PhotoEntryApi(configuration);

let id: string; // (default to undefined)
let putPhotoEntryGearDto: PutPhotoEntryGearDto; //

const { status, data } = await apiInstance.photoEntryGearControllerReplace(
    id,
    putPhotoEntryGearDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **putPhotoEntryGearDto** | **PutPhotoEntryGearDto**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

**PhotoEntryGearListResponse**

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

# **photoEntryGearControllerShoppingList**
> PhotoEntryShoppingListResponse photoEntryGearControllerShoppingList()


### Example

```typescript
import {
    PhotoEntryApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PhotoEntryApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.photoEntryGearControllerShoppingList(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**PhotoEntryShoppingListResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Wishlist gear attached to the entry, with the total |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **photoEntryPlanningControllerGet**
> AttentionResponse photoEntryPlanningControllerGet()

Planned entries whose dates are over (did it happen?), media past its threshold, undeclared gear, wishlist gear needed within 30 days and open TODOs. All derived on read.

### Example

```typescript
import {
    PhotoEntryApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PhotoEntryApi(configuration);

const { status, data } = await apiInstance.photoEntryPlanningControllerGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**AttentionResponse**

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

# **photoEntryPlanningControllerGetForecast**
> PhotoEntryForecastResponse photoEntryPlanningControllerGetForecast()

Hourly cloud (total/low/mid/high), rain, wind, visibility and a daily summary for the day, the evening golden hour and the astronomical night. Only within ~16 days of the start: otherwise available=false with reason TOO_EARLY (and availableFrom) or PAST. Sends the entry coordinates to Open-Meteo; cached for an hour.

### Example

```typescript
import {
    PhotoEntryApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PhotoEntryApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.photoEntryPlanningControllerGetForecast(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**PhotoEntryForecastResponse**

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

# **photoEntryPlanningControllerGetSky**
> PhotoEntrySkyResponse photoEntryPlanningControllerGetSky()

Per local day at the entry location: sunrise/sunset, golden and blue hour, twilights, moon phase and rise/set, astronomical darkness with the moonless part and Milky Way core visibility; plus eclipses peaking during the entry. Needs a location and a start date. All times are UTC — display them in `timezone`.

### Example

```typescript
import {
    PhotoEntryApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PhotoEntryApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.photoEntryPlanningControllerGetSky(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**PhotoEntrySkyResponse**

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

