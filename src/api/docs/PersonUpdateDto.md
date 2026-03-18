# PersonUpdateDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **string** |  | [optional] [default to undefined]
**nickname** | **string** |  | [optional] [default to undefined]
**email** | **string** |  | [optional] [default to undefined]
**phone** | **string** |  | [optional] [default to undefined]
**notes** | **string** |  | [optional] [default to undefined]
**birthday** | **string** |  | [optional] [default to undefined]
**avatarUrl** | **string** |  | [optional] [default to undefined]
**relation** | [**PersonRelation**](PersonRelation.md) |  | [optional] [default to undefined]
**locationId** | **string** | Location ID to associate with this person | [optional] [default to undefined]

## Example

```typescript
import { PersonUpdateDto } from './api';

const instance: PersonUpdateDto = {
    name,
    nickname,
    email,
    phone,
    notes,
    birthday,
    avatarUrl,
    relation,
    locationId,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
