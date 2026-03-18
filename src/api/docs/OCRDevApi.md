# OCRDevApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**ocrControllerRecognize**](#ocrcontrollerrecognize) | **POST** /dev/ocr/recognize | |
|[**ocrControllerStructured**](#ocrcontrollerstructured) | **POST** /dev/ocr/structured | Recognize, clean, and structure OCR into items and totals|

# **ocrControllerRecognize**
> OcrResponseDto ocrControllerRecognize()


### Example

```typescript
import {
    OCRDevApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new OCRDevApi(configuration);

let rotate: number; // (default to 0)
let timeoutMs: number; // (default to 15000)
let lang: OcrLang; // (optional) (default to undefined)
let psm: OcrPSM; // (optional) (default to undefined)
let oem: OcrOEM; // (optional) (default to undefined)
let maxWidth: number; //Max image width after resize (optional) (default to 1800)
let threshold: boolean; // (optional) (default to false)

const { status, data } = await apiInstance.ocrControllerRecognize(
    rotate,
    timeoutMs,
    lang,
    psm,
    oem,
    maxWidth,
    threshold
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **rotate** | [**number**] |  | defaults to 0|
| **timeoutMs** | [**number**] |  | defaults to 15000|
| **lang** | **OcrLang** |  | (optional) defaults to undefined|
| **psm** | **OcrPSM** |  | (optional) defaults to undefined|
| **oem** | **OcrOEM** |  | (optional) defaults to undefined|
| **maxWidth** | [**number**] | Max image width after resize | (optional) defaults to 1800|
| **threshold** | [**boolean**] |  | (optional) defaults to false|


### Return type

**OcrResponseDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: multipart/form-data
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **ocrControllerStructured**
> OcrStructuredResponseDto ocrControllerStructured()


### Example

```typescript
import {
    OCRDevApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new OCRDevApi(configuration);

const { status, data } = await apiInstance.ocrControllerStructured();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**OcrStructuredResponseDto**

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

