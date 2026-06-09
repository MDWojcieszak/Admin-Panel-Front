# CreateCategoryDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**kind** | [**CategoryKind**](CategoryKind.md) |  | [default to undefined]
**key** | **string** | Canonical, language-neutral key (normalized server-side). | [default to undefined]
**icon** | **string** |  | [optional] [default to undefined]
**color** | **string** |  | [optional] [default to undefined]
**order** | **number** |  | [optional] [default to undefined]
**locale** | **string** | Locale for the initial label. Defaults to the default locale. | [optional] [default to undefined]
**label** | **string** |  | [optional] [default to undefined]

## Example

```typescript
import { CreateCategoryDto } from './api';

const instance: CreateCategoryDto = {
    kind,
    key,
    icon,
    color,
    order,
    locale,
    label,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
