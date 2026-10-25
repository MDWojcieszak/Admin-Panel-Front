# DocumentResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [default to undefined]
**title** | **string** |  | [default to undefined]
**description** | **string** |  | [optional] [default to undefined]
**originalName** | **string** |  | [default to undefined]
**mimeType** | **string** |  | [default to undefined]
**kind** | [**DocumentKind**](DocumentKind.md) |  | [default to undefined]
**sizeBytes** | **number** |  | [default to undefined]
**extension** | **string** |  | [optional] [default to undefined]
**width** | **number** |  | [optional] [default to undefined]
**height** | **number** |  | [optional] [default to undefined]
**owner** | [**ProjectUserResponse**](ProjectUserResponse.md) |  | [default to undefined]
**isMine** | **boolean** |  | [default to undefined]
**inline** | **boolean** |  | [default to undefined]
**thumbUrl** | **string** |  | [optional] [default to undefined]
**previewUrl** | **string** |  | [optional] [default to undefined]
**fileUrl** | **string** |  | [default to undefined]
**downloadUrl** | **string** |  | [default to undefined]
**links** | [**Array&lt;DocumentLinkResponse&gt;**](DocumentLinkResponse.md) |  | [default to undefined]
**createdAt** | **string** |  | [default to undefined]
**updatedAt** | **string** |  | [default to undefined]

## Example

```typescript
import { DocumentResponse } from './api';

const instance: DocumentResponse = {
    id,
    title,
    description,
    originalName,
    mimeType,
    kind,
    sizeBytes,
    extension,
    width,
    height,
    owner,
    isMine,
    inline,
    thumbUrl,
    previewUrl,
    fileUrl,
    downloadUrl,
    links,
    createdAt,
    updatedAt,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
