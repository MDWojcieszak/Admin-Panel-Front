# PlaceUpdateDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**userPrompt** | **string** | Prompt from user to the AI | [optional] [default to undefined]
**aiResponse** | **string** | AI-generated response | [optional] [default to undefined]
**aiMeta** | **object** | Meta/object for AI log details | [optional] [default to undefined]
**name** | **string** |  | [optional] [default to undefined]
**description** | **string** |  | [optional] [default to undefined]
**type** | [**PlaceType**](PlaceType.md) |  | [optional] [default to undefined]
**location** | [**LocationCreateDto**](LocationCreateDto.md) |  | [optional] [default to undefined]

## Example

```typescript
import { PlaceUpdateDto } from './api';

const instance: PlaceUpdateDto = {
    userPrompt,
    aiResponse,
    aiMeta,
    name,
    description,
    type,
    location,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
