# CreateInquiryDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **string** |  | [default to undefined]
**email** | **string** |  | [default to undefined]
**phone** | **string** |  | [optional] [default to undefined]
**topic** | [**InquiryTopic**](InquiryTopic.md) |  | [default to undefined]
**message** | **string** |  | [default to undefined]
**galleryId** | **string** |  | [optional] [default to undefined]
**imageId** | **string** |  | [optional] [default to undefined]
**acknowledgedPrivacyNotice** | **boolean** |  | [default to undefined]
**locale** | **string** |  | [optional] [default to undefined]
**website** | **string** |  | [optional] [default to undefined]

## Example

```typescript
import { CreateInquiryDto } from './api';

const instance: CreateInquiryDto = {
    name,
    email,
    phone,
    topic,
    message,
    galleryId,
    imageId,
    acknowledgedPrivacyNotice,
    locale,
    website,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
