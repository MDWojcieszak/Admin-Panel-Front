# MoveToGitDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**gitRepoId** | **string** |  | [default to undefined]
**gitRef** | **string** |  | [optional] [default to undefined]
**composeFile** | **string** |  | [optional] [default to undefined]
**runDirectory** | **string** |  | [optional] [default to undefined]
**composeInRepository** | **boolean** |  | [optional] [default to undefined]
**buildMode** | [**BuildMode**](BuildMode.md) |  | [optional] [default to undefined]

## Example

```typescript
import { MoveToGitDto } from './api';

const instance: MoveToGitDto = {
    gitRepoId,
    gitRef,
    composeFile,
    runDirectory,
    composeInRepository,
    buildMode,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
