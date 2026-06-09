# PoiAdminResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [default to undefined]
**name** | **string** |  | [default to undefined]
**country** | **string** |  | [optional] [default to undefined]
**region** | **string** |  | [optional] [default to undefined]
**city** | **string** |  | [optional] [default to undefined]
**address** | **string** |  | [optional] [default to undefined]
**latitude** | **number** |  | [default to undefined]
**longitude** | **number** |  | [default to undefined]
**timezone** | **string** |  | [optional] [default to undefined]
**googlePlaceId** | **string** |  | [optional] [default to undefined]
**osmId** | **string** |  | [optional] [default to undefined]
**visitDurationMin** | **number** |  | [optional] [default to undefined]
**creatorRating** | **number** |  | [optional] [default to undefined]
**creatorVerdict** | [**PoiVerdict**](PoiVerdict.md) |  | [optional] [default to undefined]
**internalNote** | **string** |  | [optional] [default to undefined]
**priceLevel** | [**PoiPriceLevel**](PoiPriceLevel.md) |  | [optional] [default to undefined]
**bestSeasons** | [**Array&lt;PoiSeason&gt;**](PoiSeason.md) |  | [default to undefined]
**websiteUrl** | **string** |  | [optional] [default to undefined]
**bookingUrl** | **string** |  | [optional] [default to undefined]
**mapsUrl** | **string** |  | [optional] [default to undefined]
**difficulty** | [**PoiDifficulty**](PoiDifficulty.md) |  | [optional] [default to undefined]
**distanceKm** | **number** |  | [optional] [default to undefined]
**elevationGainM** | **number** |  | [optional] [default to undefined]
**status** | [**PoiStatus**](PoiStatus.md) |  | [default to undefined]
**coverImageId** | **string** |  | [optional] [default to undefined]
**categories** | [**Array&lt;PoiCategoryRefResponse&gt;**](PoiCategoryRefResponse.md) |  | [default to undefined]
**hours** | [**Array&lt;PoiHoursResponse&gt;**](PoiHoursResponse.md) |  | [default to undefined]
**images** | [**Array&lt;PoiImageResponse&gt;**](PoiImageResponse.md) |  | [default to undefined]
**translations** | [**Array&lt;PoiTranslationResponse&gt;**](PoiTranslationResponse.md) |  | [default to undefined]
**createdAt** | **string** |  | [default to undefined]
**updatedAt** | **string** |  | [default to undefined]

## Example

```typescript
import { PoiAdminResponse } from './api';

const instance: PoiAdminResponse = {
    id,
    name,
    country,
    region,
    city,
    address,
    latitude,
    longitude,
    timezone,
    googlePlaceId,
    osmId,
    visitDurationMin,
    creatorRating,
    creatorVerdict,
    internalNote,
    priceLevel,
    bestSeasons,
    websiteUrl,
    bookingUrl,
    mapsUrl,
    difficulty,
    distanceKm,
    elevationGainM,
    status,
    coverImageId,
    categories,
    hours,
    images,
    translations,
    createdAt,
    updatedAt,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
