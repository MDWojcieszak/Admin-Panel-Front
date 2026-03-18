# PlaceDetailResponseDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [default to undefined]
**name** | **string** |  | [default to undefined]
**description** | **string** |  | [optional] [default to undefined]
**type** | [**PlaceType**](PlaceType.md) |  | [optional] [default to undefined]
**createdAt** | **string** |  | [optional] [default to undefined]
**updatedAt** | **string** |  | [optional] [default to undefined]
**aiContext** | [**AiContextResponseDto**](AiContextResponseDto.md) |  | [optional] [default to undefined]
**location** | [**LocationResponseDto**](LocationResponseDto.md) |  | [optional] [default to undefined]

## Example

```typescript
import { PlaceDetailResponseDto } from './api';

const instance: PlaceDetailResponseDto = {
    id,
    name,
    description,
    type,
    createdAt,
    updatedAt,
    aiContext,
    location,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
