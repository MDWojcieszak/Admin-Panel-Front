# PublicPostCardResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [default to undefined]
**slug** | **string** |  | [default to undefined]
**title** | **string** |  | [optional] [default to undefined]
**excerpt** | **string** |  | [optional] [default to undefined]
**coverImageId** | **string** |  | [optional] [default to undefined]
**accessTier** | [**BlogAccessTier**](BlogAccessTier.md) |  | [default to undefined]
**readingMinutes** | **number** |  | [optional] [default to undefined]
**categoryIds** | **Array&lt;string&gt;** |  | [default to undefined]
**untranslated** | **boolean** |  | [default to undefined]
**authors** | [**Array&lt;PostAuthorResponse&gt;**](PostAuthorResponse.md) |  | [default to undefined]
**firstPublishedAt** | **string** |  | [optional] [default to undefined]

## Example

```typescript
import { PublicPostCardResponse } from './api';

const instance: PublicPostCardResponse = {
    id,
    slug,
    title,
    excerpt,
    coverImageId,
    accessTier,
    readingMinutes,
    categoryIds,
    untranslated,
    authors,
    firstPublishedAt,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
