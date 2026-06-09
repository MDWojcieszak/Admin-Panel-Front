# CreateTemplateDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**key** | **string** | Stable key (normalized server-side); unique. | [default to undefined]
**name** | **string** |  | [default to undefined]
**description** | **string** |  | [optional] [default to undefined]
**icon** | **string** |  | [optional] [default to undefined]
**group** | **string** |  | [optional] [default to undefined]
**order** | **number** |  | [optional] [default to undefined]
**blocks** | [**Array&lt;CreateTemplateBlockDto&gt;**](CreateTemplateBlockDto.md) |  | [optional] [default to undefined]

## Example

```typescript
import { CreateTemplateDto } from './api';

const instance: CreateTemplateDto = {
    key,
    name,
    description,
    icon,
    group,
    order,
    blocks,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
