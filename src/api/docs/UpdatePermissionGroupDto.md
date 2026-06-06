# UpdatePermissionGroupDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **string** |  | [optional] [default to undefined]
**description** | **string** |  | [optional] [default to undefined]
**permissions** | **Array&lt;string&gt;** | Permission keys from the catalog (replaces the existing set) | [optional] [default to undefined]

## Example

```typescript
import { UpdatePermissionGroupDto } from './api';

const instance: UpdatePermissionGroupDto = {
    name,
    description,
    permissions,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
