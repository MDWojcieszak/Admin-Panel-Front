# PersonDetailResponseDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [default to undefined]
**name** | **string** |  | [default to undefined]
**nickname** | **string** |  | [optional] [default to undefined]
**email** | **string** |  | [optional] [default to undefined]
**phone** | **string** |  | [optional] [default to undefined]
**notes** | **string** |  | [optional] [default to undefined]
**birthday** | **string** |  | [optional] [default to undefined]
**avatarUrl** | **string** |  | [optional] [default to undefined]
**relation** | [**PersonRelation**](PersonRelation.md) |  | [optional] [default to undefined]
**createdAt** | **string** |  | [default to undefined]
**updatedAt** | **string** |  | [default to undefined]
**aiContext** | [**AiContextResponseDto**](AiContextResponseDto.md) |  | [optional] [default to undefined]

## Example

```typescript
import { PersonDetailResponseDto } from './api';

const instance: PersonDetailResponseDto = {
    id,
    name,
    nickname,
    email,
    phone,
    notes,
    birthday,
    avatarUrl,
    relation,
    createdAt,
    updatedAt,
    aiContext,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
