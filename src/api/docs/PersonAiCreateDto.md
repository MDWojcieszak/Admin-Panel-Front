# PersonAiCreateDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**userPrompt** | **string** | Prompt from user to the AI | [optional] [default to undefined]
**aiResponse** | **string** | AI-generated response | [optional] [default to undefined]
**aiMeta** | **object** | Meta/object for AI log details | [optional] [default to undefined]
**name** | **string** |  | [default to undefined]
**nickname** | **string** |  | [optional] [default to undefined]
**email** | **string** |  | [optional] [default to undefined]
**phone** | **string** |  | [optional] [default to undefined]
**notes** | **string** |  | [optional] [default to undefined]
**birthday** | **string** |  | [optional] [default to undefined]
**relation** | [**PersonRelation**](PersonRelation.md) |  | [optional] [default to undefined]

## Example

```typescript
import { PersonAiCreateDto } from './api';

const instance: PersonAiCreateDto = {
    userPrompt,
    aiResponse,
    aiMeta,
    name,
    nickname,
    email,
    phone,
    notes,
    birthday,
    relation,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
