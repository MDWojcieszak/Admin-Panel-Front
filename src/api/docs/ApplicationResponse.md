# ApplicationResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [default to undefined]
**slug** | **string** |  | [default to undefined]
**displayName** | **string** |  | [optional] [default to undefined]
**description** | **string** |  | [optional] [default to undefined]
**tier** | [**ApplicationTier**](ApplicationTier.md) |  | [default to undefined]
**sourceType** | [**AppSourceType**](AppSourceType.md) |  | [default to undefined]
**origin** | [**ContainerOrigin**](ContainerOrigin.md) |  | [default to undefined]
**buildMode** | [**BuildMode**](BuildMode.md) |  | [default to undefined]
**image** | **string** |  | [optional] [default to undefined]
**gitRepoId** | **string** |  | [optional] [default to undefined]
**gitRef** | **string** |  | [optional] [default to undefined]
**compose** | **string** |  | [optional] [default to undefined]
**spec** | **object** |  | [default to undefined]
**runtimeStatus** | [**CommandRuntimeStatus**](CommandRuntimeStatus.md) |  | [default to undefined]
**runtimeSince** | **string** |  | [optional] [default to undefined]
**runtimeMessage** | **string** |  | [optional] [default to undefined]
**availableDigest** | **string** |  | [optional] [default to undefined]
**lastPolledAt** | **string** |  | [optional] [default to undefined]
**webhookEnabled** | **boolean** |  | [default to undefined]
**hasWebhookSecret** | **boolean** |  | [default to undefined]
**currentRelease** | [**ReleaseResponse**](ReleaseResponse.md) |  | [optional] [default to undefined]
**createdAt** | **string** |  | [default to undefined]
**updatedAt** | **string** |  | [default to undefined]

## Example

```typescript
import { ApplicationResponse } from './api';

const instance: ApplicationResponse = {
    id,
    slug,
    displayName,
    description,
    tier,
    sourceType,
    origin,
    buildMode,
    image,
    gitRepoId,
    gitRef,
    compose,
    spec,
    runtimeStatus,
    runtimeSince,
    runtimeMessage,
    availableDigest,
    lastPolledAt,
    webhookEnabled,
    hasWebhookSecret,
    currentRelease,
    createdAt,
    updatedAt,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
