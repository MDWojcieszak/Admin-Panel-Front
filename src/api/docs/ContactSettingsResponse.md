# ContactSettingsResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**enabled** | **boolean** |  | [default to undefined]
**defaultLocale** | **string** |  | [default to undefined]
**missingForEnable** | **Array&lt;string&gt;** |  | [default to undefined]
**localesWithoutNotice** | **Array&lt;string&gt;** |  | [default to undefined]
**administratorName** | **string** |  | [optional] [default to undefined]
**administratorEmail** | **string** |  | [optional] [default to undefined]
**administratorAddress** | **string** |  | [optional] [default to undefined]
**translations** | [**Array&lt;ContactTextResponse&gt;**](ContactTextResponse.md) |  | [default to undefined]
**topics** | [**Array&lt;InquiryTopic&gt;**](InquiryTopic.md) |  | [default to undefined]
**retentionDays** | **number** |  | [default to undefined]
**spamRetentionDays** | **number** |  | [default to undefined]
**updatedAt** | **string** |  | [default to undefined]

## Example

```typescript
import { ContactSettingsResponse } from './api';

const instance: ContactSettingsResponse = {
    enabled,
    defaultLocale,
    missingForEnable,
    localesWithoutNotice,
    administratorName,
    administratorEmail,
    administratorAddress,
    translations,
    topics,
    retentionDays,
    spamRetentionDays,
    updatedAt,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
