# ServerDetailsResponseDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [default to undefined]
**name** | **string** |  | [default to undefined]
**ipAddress** | **string** |  | [default to undefined]
**location** | **string** |  | [optional] [default to undefined]
**createdAt** | **string** |  | [default to undefined]
**updatedAt** | **string** |  | [optional] [default to undefined]
**properties** | [**ServerPropertiesDto**](ServerPropertiesDto.md) |  | [optional] [default to undefined]
**categories** | [**Array&lt;ServerCategoriesDto&gt;**](ServerCategoriesDto.md) |  | [optional] [default to undefined]

## Example

```typescript
import { ServerDetailsResponseDto } from './api';

const instance: ServerDetailsResponseDto = {
    id,
    name,
    ipAddress,
    location,
    createdAt,
    updatedAt,
    properties,
    categories,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
