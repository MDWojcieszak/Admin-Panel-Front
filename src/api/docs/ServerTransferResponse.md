# ServerTransferResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [default to undefined]
**serverCategoryId** | **string** |  | [default to undefined]
**name** | **string** |  | [default to undefined]
**description** | **string** |  | [optional] [default to undefined]
**originPath** | **string** |  | [default to undefined]
**targetPath** | **string** |  | [default to undefined]
**agentLogPath** | **string** |  | [optional] [default to undefined]
**enableMoveBackup** | **boolean** |  | [default to undefined]
**moveBackupPath** | **string** |  | [optional] [default to undefined]
**mode** | [**ServerTransferMode**](ServerTransferMode.md) |  | [default to undefined]
**status** | [**ServerTransferStatus**](ServerTransferStatus.md) |  | [default to undefined]
**bwLimitKbps** | **number** |  | [optional] [default to undefined]
**secondsStart** | **number** |  | [default to undefined]
**secondsStop** | **number** |  | [default to undefined]
**isEnabled** | **boolean** |  | [default to undefined]
**queuedFiles** | **number** |  | [default to undefined]
**queuedBytes** | **number** |  | [default to undefined]
**sentFiles** | **number** |  | [default to undefined]
**sentBytes** | **number** |  | [default to undefined]
**currentProcessId** | **string** |  | [optional] [default to undefined]
**lastProcessId** | **string** |  | [optional] [default to undefined]
**lastRunAt** | **string** |  | [optional] [default to undefined]
**lastSuccessAt** | **string** |  | [optional] [default to undefined]
**lastError** | **string** |  | [optional] [default to undefined]
**createdAt** | **string** |  | [default to undefined]
**updatedAt** | **string** |  | [default to undefined]

## Example

```typescript
import { ServerTransferResponse } from './api';

const instance: ServerTransferResponse = {
    id,
    serverCategoryId,
    name,
    description,
    originPath,
    targetPath,
    agentLogPath,
    enableMoveBackup,
    moveBackupPath,
    mode,
    status,
    bwLimitKbps,
    secondsStart,
    secondsStop,
    isEnabled,
    queuedFiles,
    queuedBytes,
    sentFiles,
    sentBytes,
    currentProcessId,
    lastProcessId,
    lastRunAt,
    lastSuccessAt,
    lastError,
    createdAt,
    updatedAt,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
