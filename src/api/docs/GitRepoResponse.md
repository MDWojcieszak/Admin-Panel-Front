# GitRepoResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [default to undefined]
**name** | **string** |  | [default to undefined]
**repo** | **string** |  | [default to undefined]
**branch** | **string** |  | [default to undefined]
**clonePath** | **string** |  | [optional] [default to undefined]
**account** | [**GitRepoAccountResponse**](GitRepoAccountResponse.md) |  | [optional] [default to undefined]
**lastCommit** | **string** |  | [optional] [default to undefined]
**lastFetchedAt** | **string** |  | [optional] [default to undefined]
**applications** | [**Array&lt;GitRepoApplicationResponse&gt;**](GitRepoApplicationResponse.md) |  | [default to undefined]
**createdAt** | **string** |  | [default to undefined]
**updatedAt** | **string** |  | [default to undefined]

## Example

```typescript
import { GitRepoResponse } from './api';

const instance: GitRepoResponse = {
    id,
    name,
    repo,
    branch,
    clonePath,
    account,
    lastCommit,
    lastFetchedAt,
    applications,
    createdAt,
    updatedAt,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
