# InquiryResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [default to undefined]
**name** | **string** |  | [default to undefined]
**email** | **string** |  | [default to undefined]
**phone** | **string** |  | [optional] [default to undefined]
**topic** | [**InquiryTopic**](InquiryTopic.md) |  | [default to undefined]
**message** | **string** |  | [default to undefined]
**status** | [**InquiryStatus**](InquiryStatus.md) |  | [default to undefined]
**gallery** | [**InquiryGalleryRefResponse**](InquiryGalleryRefResponse.md) |  | [optional] [default to undefined]
**image** | [**InquiryImageRefResponse**](InquiryImageRefResponse.md) |  | [optional] [default to undefined]
**internalNote** | **string** |  | [optional] [default to undefined]
**replyMailto** | **string** |  | [default to undefined]
**readAt** | **string** |  | [optional] [default to undefined]
**answeredAt** | **string** |  | [optional] [default to undefined]
**noticeAcknowledgedAt** | **string** |  | [default to undefined]
**privacyNoticeLocale** | **string** |  | [default to undefined]
**privacyNoticeVersion** | **number** |  | [default to undefined]
**locale** | **string** |  | [default to undefined]
**createdAt** | **string** |  | [default to undefined]

## Example

```typescript
import { InquiryResponse } from './api';

const instance: InquiryResponse = {
    id,
    name,
    email,
    phone,
    topic,
    message,
    status,
    gallery,
    image,
    internalNote,
    replyMailto,
    readAt,
    answeredAt,
    noticeAcknowledgedAt,
    privacyNoticeLocale,
    privacyNoticeVersion,
    locale,
    createdAt,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
