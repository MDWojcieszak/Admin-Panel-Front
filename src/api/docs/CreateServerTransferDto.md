# CreateServerTransferDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **string** |  | [default to undefined]
**description** | **string** |  | [optional] [default to undefined]
**originPath** | **string** |  | [default to undefined]
**targetPath** | **string** |  | [default to undefined]
**agentLogPath** | **string** |  | [optional] [default to undefined]
**enableMoveBackup** | **boolean** |  | [default to undefined]
**moveBackupPath** | **string** |  | [optional] [default to undefined]
**mode** | [**ServerTransferMode**](ServerTransferMode.md) |  | [default to undefined]
**bwLimitKbps** | **number** |  | [optional] [default to undefined]
**secondsStart** | **number** |  | [default to undefined]
**secondsStop** | **number** |  | [default to undefined]
**isEnabled** | **boolean** |  | [default to undefined]

## Example

```typescript
import { CreateServerTransferDto } from './api';

const instance: CreateServerTransferDto = {
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
