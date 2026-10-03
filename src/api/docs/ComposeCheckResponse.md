# ComposeCheckResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**compose** | **string** |  | [default to undefined]
**movedSecrets** | **Array&lt;string&gt;** |  | [default to undefined]
**notes** | **Array&lt;string&gt;** |  | [default to undefined]
**buildMode** | [**BuildMode**](BuildMode.md) |  | [default to undefined]
**variables** | [**Array&lt;ComposeVariableResponse&gt;**](ComposeVariableResponse.md) |  | [default to undefined]

## Example

```typescript
import { ComposeCheckResponse } from './api';

const instance: ComposeCheckResponse = {
    compose,
    movedSecrets,
    notes,
    buildMode,
    variables,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
