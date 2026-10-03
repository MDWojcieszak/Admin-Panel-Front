# PublicContactResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**enabled** | **boolean** |  | [default to undefined]
**intro** | **string** |  | [optional] [default to undefined]
**topics** | [**Array&lt;InquiryTopic&gt;**](InquiryTopic.md) |  | [default to undefined]
**privacyNotice** | **string** |  | [optional] [default to undefined]
**privacyNoticeVersion** | **number** |  | [optional] [default to undefined]
**administrator** | [**ContactAdministratorResponse**](ContactAdministratorResponse.md) |  | [optional] [default to undefined]

## Example

```typescript
import { PublicContactResponse } from './api';

const instance: PublicContactResponse = {
    enabled,
    intro,
    topics,
    privacyNotice,
    privacyNoticeVersion,
    administrator,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
