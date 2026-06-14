# DocumentColumnDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [optional] [default to undefined]
**clientKey** | **string** |  | [optional] [default to undefined]
**width** | **number** | Column width share, 0..1 (relative; FE normalizes). | [optional] [default to undefined]
**blocks** | [**Array&lt;DocumentLeafBlockDto&gt;**](DocumentLeafBlockDto.md) |  | [default to undefined]

## Example

```typescript
import { DocumentColumnDto } from './api';

const instance: DocumentColumnDto = {
    id,
    clientKey,
    width,
    blocks,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
