# AuditEntryResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [default to undefined]
**actor** | [**AuditActorResponse**](AuditActorResponse.md) |  | [optional] [default to undefined]
**source** | [**AuditSource**](AuditSource.md) |  | [default to undefined]
**action** | **string** |  | [default to undefined]
**entityType** | **string** |  | [default to undefined]
**entityId** | **string** |  | [default to undefined]
**entityName** | **string** |  | [optional] [default to undefined]
**diff** | **object** |  | [optional] [default to undefined]
**createdAt** | **string** |  | [default to undefined]

## Example

```typescript
import { AuditEntryResponse } from './api';

const instance: AuditEntryResponse = {
    id,
    actor,
    source,
    action,
    entityType,
    entityId,
    entityName,
    diff,
    createdAt,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
