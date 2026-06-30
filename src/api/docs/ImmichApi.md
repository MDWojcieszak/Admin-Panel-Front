# ImmichApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**immichControllerAttachEntry**](#immichcontrollerattachentry) | **POST** /immich/album/{albumId}/attach | |
|[**immichControllerBrowseAlbums**](#immichcontrollerbrowsealbums) | **GET** /immich/albums | |
|[**immichControllerCreateAlbum**](#immichcontrollercreatealbum) | **POST** /immich/album/create | |
|[**immichControllerCreateEmptyAlbum**](#immichcontrollercreateemptyalbum) | **POST** /immich/album/empty | |
|[**immichControllerDeleteAlbum**](#immichcontrollerdeletealbum) | **DELETE** /immich/album/{albumId} | |
|[**immichControllerDetachEntry**](#immichcontrollerdetachentry) | **DELETE** /immich/album/link/{id} | |
|[**immichControllerGetAssetThumbnail**](#immichcontrollergetassetthumbnail) | **GET** /immich/asset/{id}/thumbnail | |
|[**immichControllerGetStatus**](#immichcontrollergetstatus) | **GET** /immich/status | |
|[**immichControllerListAlbums**](#immichcontrollerlistalbums) | **GET** /immich/album | |
|[**immichControllerListLibraries**](#immichcontrollerlistlibraries) | **GET** /immich/libraries | |
|[**immichControllerPreviewAlbum**](#immichcontrollerpreviewalbum) | **POST** /immich/album/preview | |
|[**immichControllerRefreshAlbum**](#immichcontrollerrefreshalbum) | **POST** /immich/album/link/{id}/refresh | |
|[**immichControllerRemoveConfig**](#immichcontrollerremoveconfig) | **DELETE** /immich/config | |
|[**immichControllerSaveConfig**](#immichcontrollersaveconfig) | **PUT** /immich/config | |
|[**immichControllerScanLibrary**](#immichcontrollerscanlibrary) | **POST** /immich/library/{id}/scan | |

# **immichControllerAttachEntry**
> ImmichAlbumSyncResponse immichControllerAttachEntry(attachEntryDto)


### Example

```typescript
import {
    ImmichApi,
    Configuration,
    AttachEntryDto
} from './api';

const configuration = new Configuration();
const apiInstance = new ImmichApi(configuration);

let albumId: string; // (default to undefined)
let attachEntryDto: AttachEntryDto; //

const { status, data } = await apiInstance.immichControllerAttachEntry(
    albumId,
    attachEntryDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **attachEntryDto** | **AttachEntryDto**|  | |
| **albumId** | [**string**] |  | defaults to undefined|


### Return type

**ImmichAlbumSyncResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Attach a photo entry folder to an existing Immich album |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **immichControllerBrowseAlbums**
> ImmichAlbumBrowseResponse immichControllerBrowseAlbums()


### Example

```typescript
import {
    ImmichApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ImmichApi(configuration);

const { status, data } = await apiInstance.immichControllerBrowseAlbums();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**ImmichAlbumBrowseResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Browse all Immich albums enriched with linked photo entries |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **immichControllerCreateAlbum**
> ImmichAlbumSyncResponse immichControllerCreateAlbum(createImmichAlbumDto)


### Example

```typescript
import {
    ImmichApi,
    Configuration,
    CreateImmichAlbumDto
} from './api';

const configuration = new Configuration();
const apiInstance = new ImmichApi(configuration);

let createImmichAlbumDto: CreateImmichAlbumDto; //

const { status, data } = await apiInstance.immichControllerCreateAlbum(
    createImmichAlbumDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createImmichAlbumDto** | **CreateImmichAlbumDto**|  | |


### Return type

**ImmichAlbumSyncResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Create a new Immich album from a photo entry folder |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **immichControllerCreateEmptyAlbum**
> ImmichBrowseAlbumResponse immichControllerCreateEmptyAlbum(createEmptyAlbumDto)


### Example

```typescript
import {
    ImmichApi,
    Configuration,
    CreateEmptyAlbumDto
} from './api';

const configuration = new Configuration();
const apiInstance = new ImmichApi(configuration);

let createEmptyAlbumDto: CreateEmptyAlbumDto; //

const { status, data } = await apiInstance.immichControllerCreateEmptyAlbum(
    createEmptyAlbumDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createEmptyAlbumDto** | **CreateEmptyAlbumDto**|  | |


### Return type

**ImmichBrowseAlbumResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Create an empty Immich album (attach entries later) |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **immichControllerDeleteAlbum**
> ImmichAlbumRemovedResponse immichControllerDeleteAlbum()


### Example

```typescript
import {
    ImmichApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ImmichApi(configuration);

let albumId: string; // (default to undefined)

const { status, data } = await apiInstance.immichControllerDeleteAlbum(
    albumId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **albumId** | [**string**] |  | defaults to undefined|


### Return type

**ImmichAlbumRemovedResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Delete the whole album in Immich (keeps the photos) + remove our links |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **immichControllerDetachEntry**
> ImmichAlbumDeletedResponse immichControllerDetachEntry()


### Example

```typescript
import {
    ImmichApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ImmichApi(configuration);

let id: string; // (default to undefined)
let removeAssets: boolean; //Also remove this entry’s assets from the Immich album (default true) (optional) (default to undefined)

const { status, data } = await apiInstance.immichControllerDetachEntry(
    id,
    removeAssets
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|
| **removeAssets** | [**boolean**] | Also remove this entry’s assets from the Immich album (default true) | (optional) defaults to undefined|


### Return type

**ImmichAlbumDeletedResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Detach a tracked link (optionally remove the entry assets from the album) |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **immichControllerGetAssetThumbnail**
> immichControllerGetAssetThumbnail()


### Example

```typescript
import {
    ImmichApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ImmichApi(configuration);

let id: string; // (default to undefined)
let size: ThumbnailSize; // (optional) (default to undefined)

const { status, data } = await apiInstance.immichControllerGetAssetThumbnail(
    id,
    size
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|
| **size** | **ThumbnailSize** |  | (optional) defaults to undefined|


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
|**200** | Asset thumbnail image (binary stream) |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **immichControllerGetStatus**
> ImmichStatusResponse immichControllerGetStatus()


### Example

```typescript
import {
    ImmichApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ImmichApi(configuration);

const { status, data } = await apiInstance.immichControllerGetStatus();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**ImmichStatusResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Immich connection status (live ping) |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **immichControllerListAlbums**
> ImmichAlbumListResponse immichControllerListAlbums()


### Example

```typescript
import {
    ImmichApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ImmichApi(configuration);

let photoEntryId: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.immichControllerListAlbums(
    photoEntryId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **photoEntryId** | [**string**] |  | (optional) defaults to undefined|


### Return type

**ImmichAlbumListResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | List tracked album links (optionally by photo entry) |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **immichControllerListLibraries**
> ImmichLibraryListResponse immichControllerListLibraries()


### Example

```typescript
import {
    ImmichApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ImmichApi(configuration);

const { status, data } = await apiInstance.immichControllerListLibraries();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**ImmichLibraryListResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | List Immich external libraries with statistics |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **immichControllerPreviewAlbum**
> ImmichAlbumPreviewResponse immichControllerPreviewAlbum(previewImmichAlbumDto)


### Example

```typescript
import {
    ImmichApi,
    Configuration,
    PreviewImmichAlbumDto
} from './api';

const configuration = new Configuration();
const apiInstance = new ImmichApi(configuration);

let previewImmichAlbumDto: PreviewImmichAlbumDto; //

const { status, data } = await apiInstance.immichControllerPreviewAlbum(
    previewImmichAlbumDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **previewImmichAlbumDto** | **PreviewImmichAlbumDto**|  | |


### Return type

**ImmichAlbumPreviewResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Preview assets that would be added to an album (no-op) |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **immichControllerRefreshAlbum**
> ImmichAlbumSyncResponse immichControllerRefreshAlbum()


### Example

```typescript
import {
    ImmichApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ImmichApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.immichControllerRefreshAlbum(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**ImmichAlbumSyncResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Refresh a tracked link with newly added assets |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **immichControllerRemoveConfig**
> ImmichStatusResponse immichControllerRemoveConfig()


### Example

```typescript
import {
    ImmichApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ImmichApi(configuration);

const { status, data } = await apiInstance.immichControllerRemoveConfig();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**ImmichStatusResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Remove the Immich connection config |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **immichControllerSaveConfig**
> ImmichStatusResponse immichControllerSaveConfig(saveImmichConfigDto)


### Example

```typescript
import {
    ImmichApi,
    Configuration,
    SaveImmichConfigDto
} from './api';

const configuration = new Configuration();
const apiInstance = new ImmichApi(configuration);

let saveImmichConfigDto: SaveImmichConfigDto; //

const { status, data } = await apiInstance.immichControllerSaveConfig(
    saveImmichConfigDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **saveImmichConfigDto** | **SaveImmichConfigDto**|  | |


### Return type

**ImmichStatusResponse**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Save Immich connection config (URL + token + library) + verify |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **immichControllerScanLibrary**
> immichControllerScanLibrary()


### Example

```typescript
import {
    ImmichApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ImmichApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.immichControllerScanLibrary(
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
|**200** | Trigger a (re)scan of an Immich library |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

