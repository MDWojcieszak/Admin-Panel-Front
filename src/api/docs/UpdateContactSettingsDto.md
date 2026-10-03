# UpdateContactSettingsDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**enabled** | **boolean** |  | [optional] [default to undefined]
**administratorName** | **string** |  | [optional] [default to undefined]
**administratorEmail** | **string** |  | [optional] [default to undefined]
**administratorAddress** | **string** |  | [optional] [default to undefined]
**translations** | [**Array&lt;ContactTextDto&gt;**](ContactTextDto.md) |  | [optional] [default to undefined]
**topics** | [**Array&lt;InquiryTopic&gt;**](InquiryTopic.md) |  | [optional] [default to undefined]
**retentionDays** | **number** |  | [optional] [default to undefined]
**spamRetentionDays** | **number** |  | [optional] [default to undefined]

## Example

```typescript
import { UpdateContactSettingsDto } from './api';

const instance: UpdateContactSettingsDto = {
    enabled,
    administratorName,
    administratorEmail,
    administratorAddress,
    translations,
    topics,
    retentionDays,
    spamRetentionDays,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
