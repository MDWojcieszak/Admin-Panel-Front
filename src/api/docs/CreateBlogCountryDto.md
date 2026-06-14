# CreateBlogCountryDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**slug** | **string** | Canonical key (normalized lowercase). | [default to undefined]
**code** | **string** | ISO-3166-1 alpha-2. | [optional] [default to undefined]
**coverImageId** | **string** |  | [optional] [default to undefined]
**order** | **number** |  | [optional] [default to undefined]
**locale** | **string** | Locale for the initial name/intro; defaults to default locale. | [optional] [default to undefined]
**name** | **string** | Localized country name. | [optional] [default to undefined]
**intro** | **string** |  | [optional] [default to undefined]

## Example

```typescript
import { CreateBlogCountryDto } from './api';

const instance: CreateBlogCountryDto = {
    slug,
    code,
    coverImageId,
    order,
    locale,
    name,
    intro,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
