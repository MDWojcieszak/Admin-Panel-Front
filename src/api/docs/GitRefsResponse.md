# GitRefsResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**branch** | **string** |  | [default to undefined]
**head** | [**GitCommitResponse**](GitCommitResponse.md) |  | [optional] [default to undefined]
**tags** | [**Array&lt;GitTagResponse&gt;**](GitTagResponse.md) |  | [default to undefined]
**commits** | [**Array&lt;GitCommitResponse&gt;**](GitCommitResponse.md) |  | [default to undefined]
**branches** | [**Array&lt;GitBranchResponse&gt;**](GitBranchResponse.md) |  | [default to undefined]

## Example

```typescript
import { GitRefsResponse } from './api';

const instance: GitRefsResponse = {
    branch,
    head,
    tags,
    commits,
    branches,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
