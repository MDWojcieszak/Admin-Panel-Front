# ExportScanResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**photoEntryId** | **string** |  | [default to undefined]
**folder** | **string** |  | [default to undefined]
**folderExists** | **boolean** |  | [default to undefined]
**scannedAt** | **string** |  | [default to undefined]
**urlsExpireAt** | **string** |  | [default to undefined]
**files** | [**Array&lt;ExportFileResponse&gt;**](ExportFileResponse.md) |  | [default to undefined]
**summary** | [**ExportSummaryResponse**](ExportSummaryResponse.md) |  | [default to undefined]

## Example

```typescript
import { ExportScanResponse } from './api';

const instance: ExportScanResponse = {
    photoEntryId,
    folder,
    folderExists,
    scannedAt,
    urlsExpireAt,
    files,
    summary,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
