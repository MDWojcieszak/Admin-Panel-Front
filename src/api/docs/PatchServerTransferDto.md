# PatchServerTransferDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **string** |  | [optional] [default to undefined]
**description** | **string** |  | [optional] [default to undefined]
**originPath** | **string** |  | [optional] [default to undefined]
**targetPath** | **string** |  | [optional] [default to undefined]
**agentLogPath** | **string** |  | [optional] [default to undefined]
**enableMoveBackup** | **boolean** |  | [optional] [default to undefined]
**moveBackupPath** | **string** |  | [optional] [default to undefined]
**mode** | [**ServerTransferMode**](ServerTransferMode.md) |  | [optional] [default to undefined]
**bwLimitKbps** | **number** |  | [optional] [default to undefined]
**secondsStart** | **number** |  | [optional] [default to undefined]
**secondsStop** | **number** |  | [optional] [default to undefined]
**isEnabled** | **boolean** |  | [optional] [default to undefined]

## Example

```typescript
import { PatchServerTransferDto } from './api';

const instance: PatchServerTransferDto = {
    name,
    description,
    originPath,
    targetPath,
    agentLogPath,
    enableMoveBackup,
    moveBackupPath,
    mode,
    bwLimitKbps,
    secondsStart,
    secondsStop,
    isEnabled,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
