# DashboardGalleryResponseDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**totals** | [**GalleryTotalsDto**](GalleryTotalsDto.md) |  | [default to undefined]
**completeness** | [**GalleryCompletenessDto**](GalleryCompletenessDto.md) |  | [default to undefined]
**byAuthor** | [**Array&lt;GalleryAuthorDto&gt;**](GalleryAuthorDto.md) |  | [default to undefined]
**byLocalization** | [**Array&lt;GalleryLocalizationDto&gt;**](GalleryLocalizationDto.md) |  | [default to undefined]
**recent** | [**Array&lt;GalleryRecentDto&gt;**](GalleryRecentDto.md) |  | [default to undefined]

## Example

```typescript
import { DashboardGalleryResponseDto } from './api';

const instance: DashboardGalleryResponseDto = {
    totals,
    completeness,
    byAuthor,
    byLocalization,
    recent,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
