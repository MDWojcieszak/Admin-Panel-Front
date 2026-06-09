# CategoryResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [default to undefined]
**kind** | [**CategoryKind**](CategoryKind.md) |  | [default to undefined]
**key** | **string** |  | [default to undefined]
**icon** | **string** |  | [optional] [default to undefined]
**color** | **string** |  | [optional] [default to undefined]
**isSystem** | **boolean** |  | [default to undefined]
**order** | **number** |  | [optional] [default to undefined]
**translations** | [**Array&lt;CategoryTranslationResponse&gt;**](CategoryTranslationResponse.md) |  | [default to undefined]
**createdAt** | **string** |  | [default to undefined]
**updatedAt** | **string** |  | [default to undefined]

## Example

```typescript
import { CategoryResponse } from './api';

const instance: CategoryResponse = {
    id,
    kind,
    key,
    icon,
    color,
    isSystem,
    order,
    translations,
    createdAt,
    updatedAt,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
