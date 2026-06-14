# CreatePoiDto


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **string** | Canonical name (proper noun). | [default to undefined]
**latitude** | **number** |  | [default to undefined]
**longitude** | **number** |  | [default to undefined]
**countryId** | **string** | BlogCountry id (FK). | [optional] [default to undefined]
**region** | **string** |  | [optional] [default to undefined]
**city** | **string** |  | [optional] [default to undefined]
**address** | **string** |  | [optional] [default to undefined]
**timezone** | **string** | IANA timezone, e.g. Atlantic/Reykjavik. | [optional] [default to undefined]
**googlePlaceId** | **string** |  | [optional] [default to undefined]
**osmId** | **string** |  | [optional] [default to undefined]
**visitDurationMin** | **number** |  | [optional] [default to undefined]
**creatorRating** | **number** | Public AI weight 1–5. | [optional] [default to undefined]
**creatorVerdict** | [**PoiVerdict**](PoiVerdict.md) |  | [optional] [default to undefined]
**internalNote** | **string** | INTERNAL — never public. | [optional] [default to undefined]
**priceLevel** | [**PoiPriceLevel**](PoiPriceLevel.md) |  | [optional] [default to undefined]
**bestSeasons** | [**Array&lt;PoiSeason&gt;**](PoiSeason.md) |  | [optional] [default to undefined]
**websiteUrl** | **string** |  | [optional] [default to undefined]
**bookingUrl** | **string** |  | [optional] [default to undefined]
**mapsUrl** | **string** |  | [optional] [default to undefined]
**difficulty** | [**PoiDifficulty**](PoiDifficulty.md) |  | [optional] [default to undefined]
**distanceKm** | **number** |  | [optional] [default to undefined]
**elevationGainM** | **number** |  | [optional] [default to undefined]
**status** | [**PoiStatus**](PoiStatus.md) |  | [optional] [default to undefined]
**coverImageId** | **string** |  | [optional] [default to undefined]
**categoryIds** | **Array&lt;string&gt;** | ATTRACTION category ids. | [optional] [default to undefined]
**locale** | **string** | Locale for the initial translation. Defaults to the default locale. | [optional] [default to undefined]
**localizedName** | **string** | Localized name override for &#x60;locale&#x60;. | [optional] [default to undefined]
**description** | **string** |  | [optional] [default to undefined]

## Example

```typescript
import { CreatePoiDto } from './api';

const instance: CreatePoiDto = {
    name,
    latitude,
    longitude,
    countryId,
    region,
    city,
    address,
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
    categoryIds,
    locale,
    localizedName,
    description,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
