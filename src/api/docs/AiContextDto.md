# AiContextDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**userPrompt** | **string** | Prompt from user to the AI | [optional] [default to undefined]
**aiResponse** | **string** | AI-generated response | [optional] [default to undefined]
**aiMeta** | **object** | Meta/object for AI log details | [optional] [default to undefined]
**summary** | **string** |  | [optional] [default to undefined]
**keywords** | **object** |  | [optional] [default to undefined]
**context** | **string** |  | [optional] [default to undefined]
**aiConfidence** | **number** |  | [optional] [default to undefined]
**aiSource** | **string** |  | [optional] [default to undefined]

## Example

```typescript
import { AiContextDto } from './api';

const instance: AiContextDto = {
    userPrompt,
    aiResponse,
    aiMeta,
    summary,
    keywords,
    context,
    aiConfidence,
    aiSource,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
