# ResolvedSectionPoiResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [default to undefined]
**poiId** | **string** |  | [default to undefined]
**order** | **number** |  | [default to undefined]
**name** | **string** |  | [default to undefined]
**description** | **string** |  | [optional] [default to undefined]
**country** | **string** |  | [optional] [default to undefined]
**region** | **string** |  | [optional] [default to undefined]
**city** | **string** |  | [optional] [default to undefined]
**latitude** | **number** |  | [default to undefined]
**longitude** | **number** |  | [default to undefined]
**timezone** | **string** |  | [optional] [default to undefined]
**status** | [**PoiStatus**](PoiStatus.md) |  | [default to undefined]
**coverImageId** | **string** |  | [optional] [default to undefined]
**categoryIds** | **Array&lt;string&gt;** |  | [default to undefined]
**creatorRating** | **number** |  | [optional] [default to undefined]
**priceLevel** | [**PoiPriceLevel**](PoiPriceLevel.md) |  | [optional] [default to undefined]
**bestSeasons** | [**Array&lt;PoiSeason&gt;**](PoiSeason.md) |  | [default to undefined]
**difficulty** | [**PoiDifficulty**](PoiDifficulty.md) |  | [optional] [default to undefined]
**distanceKm** | **number** |  | [optional] [default to undefined]
**elevationGainM** | **number** |  | [optional] [default to undefined]
**visitDurationMin** | **number** |  | [optional] [default to undefined]
**websiteUrl** | **string** |  | [optional] [default to undefined]
**bookingUrl** | **string** |  | [optional] [default to undefined]
**mapsUrl** | **string** |  | [optional] [default to undefined]
**googlePlaceId** | **string** |  | [optional] [default to undefined]
**osmId** | **string** |  | [optional] [default to undefined]
**untranslated** | **boolean** |  | [default to undefined]

## Example

```typescript
import { ResolvedSectionPoiResponse } from './api';

const instance: ResolvedSectionPoiResponse = {
    id,
    poiId,
    order,
    name,
    description,
    country,
    region,
    city,
    latitude,
    longitude,
    timezone,
    status,
    coverImageId,
    categoryIds,
    creatorRating,
    priceLevel,
    bestSeasons,
    difficulty,
    distanceKm,
    elevationGainM,
    visitDurationMin,
    websiteUrl,
    bookingUrl,
    mapsUrl,
    googlePlaceId,
    osmId,
    untranslated,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
