# AuthApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**authControllerHandleUserCreatedEvent**](#authcontrollerhandleusercreatedevent) | **POST** /auth/check-register | Check if registration token is valid|
|[**authControllerLogout**](#authcontrollerlogout) | **POST** /auth/logout | Log out user and invalidate session|
|[**authControllerRefreshToken**](#authcontrollerrefreshtoken) | **POST** /auth/refresh | Refresh access and refresh tokens|
|[**authControllerRegister**](#authcontrollerregister) | **POST** /auth/register | Finish registration by setting password|
|[**authControllerResetPassword**](#authcontrollerresetpassword) | **POST** /auth/reset-password | Reset password using reset token|
|[**authControllerResetPasswordRequest**](#authcontrollerresetpasswordrequest) | **POST** /auth/reset-password-request | Initiate password reset request|
|[**authControllerSignIn**](#authcontrollersignin) | **POST** /auth/local/signin | Sign in using email and password|

# **authControllerHandleUserCreatedEvent**
> AuthControllerHandleUserCreatedEvent200Response authControllerHandleUserCreatedEvent()


### Example

```typescript
import {
    AuthApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AuthApi(configuration);

const { status, data } = await apiInstance.authControllerHandleUserCreatedEvent();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**AuthControllerHandleUserCreatedEvent200Response**

### Authorization

[JWT-register-user](../README.md#JWT-register-user)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Returns email and first name if valid token |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authControllerLogout**
> authControllerLogout()


### Example

```typescript
import {
    AuthApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AuthApi(configuration);

const { status, data } = await apiInstance.authControllerLogout();
```

### Parameters
This endpoint does not have any parameters.


### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | User successfully logged out |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authControllerRefreshToken**
> TokensDto authControllerRefreshToken()


### Example

```typescript
import {
    AuthApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AuthApi(configuration);

const { status, data } = await apiInstance.authControllerRefreshToken();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**TokensDto**

### Authorization

[JWT-refresh](../README.md#JWT-refresh)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** |  |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authControllerRegister**
> authControllerRegister(registerDto)


### Example

```typescript
import {
    AuthApi,
    Configuration,
    RegisterDto
} from './api';

const configuration = new Configuration();
const apiInstance = new AuthApi(configuration);

let registerDto: RegisterDto; //

const { status, data } = await apiInstance.authControllerRegister(
    registerDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **registerDto** | **RegisterDto**|  | |


### Return type

void (empty response body)

### Authorization

[JWT-register-user](../README.md#JWT-register-user)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | User registered successfully |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authControllerResetPassword**
> authControllerResetPassword(resetPasswordDto)


### Example

```typescript
import {
    AuthApi,
    Configuration,
    ResetPasswordDto
} from './api';

const configuration = new Configuration();
const apiInstance = new AuthApi(configuration);

let resetPasswordDto: ResetPasswordDto; //

const { status, data } = await apiInstance.authControllerResetPassword(
    resetPasswordDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **resetPasswordDto** | **ResetPasswordDto**|  | |


### Return type

void (empty response body)

### Authorization

[JWT-reset-password](../README.md#JWT-reset-password)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Password reset successful |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authControllerResetPasswordRequest**
> authControllerResetPasswordRequest(requestResetPasswordDto)


### Example

```typescript
import {
    AuthApi,
    Configuration,
    RequestResetPasswordDto
} from './api';

const configuration = new Configuration();
const apiInstance = new AuthApi(configuration);

let requestResetPasswordDto: RequestResetPasswordDto; //

const { status, data } = await apiInstance.authControllerResetPasswordRequest(
    requestResetPasswordDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **requestResetPasswordDto** | **RequestResetPasswordDto**|  | |


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Reset password email sent (if user exists) |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authControllerSignIn**
> TokensDto authControllerSignIn(signInDto)


### Example

```typescript
import {
    AuthApi,
    Configuration,
    SignInDto
} from './api';

const configuration = new Configuration();
const apiInstance = new AuthApi(configuration);

let signInDto: SignInDto; //

const { status, data } = await apiInstance.authControllerSignIn(
    signInDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **signInDto** | **SignInDto**|  | |


### Return type

**TokensDto**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successfully logged in |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

