# CreatePostDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**slug** | **string** | Unique URL slug for the post. | [default to undefined]
**title** | **string** | Title for the initial locale (default locale unless &#x60;locale&#x60; is set). | [default to undefined]
**locale** | **string** | Locale of the initial content. Defaults to the default BlogLocale. | [optional] [default to undefined]
**subtitle** | **string** |  | [optional] [default to undefined]
**excerpt** | **string** |  | [optional] [default to undefined]
**accessTier** | [**BlogAccessTier**](BlogAccessTier.md) |  | [optional] [default to undefined]
**country** | **string** |  | [optional] [default to undefined]
**region** | **string** |  | [optional] [default to undefined]
**coverImageId** | **string** |  | [optional] [default to undefined]
**ogImageId** | **string** |  | [optional] [default to undefined]
**seriesId** | **string** |  | [optional] [default to undefined]
**seriesOrder** | **number** |  | [optional] [default to undefined]

## Example

```typescript
import { CreatePostDto } from './api';

const instance: CreatePostDto = {
    slug,
    title,
    locale,
    subtitle,
    excerpt,
    accessTier,
    country,
    region,
    coverImageId,
    ogImageId,
    seriesId,
    seriesOrder,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
