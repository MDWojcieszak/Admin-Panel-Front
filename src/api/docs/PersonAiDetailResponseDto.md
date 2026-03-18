# PersonAiDetailResponseDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [default to undefined]
**name** | **string** |  | [default to undefined]
**nickname** | **string** |  | [optional] [default to undefined]
**email** | **string** |  | [optional] [default to undefined]
**phone** | **string** |  | [optional] [default to undefined]
**notes** | **string** |  | [optional] [default to undefined]
**avatarUrl** | **string** |  | [optional] [default to undefined]
**relation** | [**PersonRelation**](PersonRelation.md) |  | [optional] [default to undefined]
**aiContext** | [**AiContextDto**](AiContextDto.md) |  | [optional] [default to undefined]

## Example

```typescript
import { PersonAiDetailResponseDto } from './api';

const instance: PersonAiDetailResponseDto = {
    id,
    name,
    nickname,
    email,
    phone,
    notes,
    avatarUrl,
    relation,
    aiContext,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
