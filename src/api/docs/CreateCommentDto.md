# CreateCommentDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**sectionId** | **string** | Section to anchor to; omit for a post-level thread. | [optional] [default to undefined]
**anchorStart** | **number** |  | [optional] [default to undefined]
**anchorEnd** | **number** |  | [optional] [default to undefined]
**quote** | **string** | Cached quote of the anchored text. | [optional] [default to undefined]
**body** | **string** |  | [default to undefined]

## Example

```typescript
import { CreateCommentDto } from './api';

const instance: CreateCommentDto = {
    sectionId,
    anchorStart,
    anchorEnd,
    quote,
    body,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
