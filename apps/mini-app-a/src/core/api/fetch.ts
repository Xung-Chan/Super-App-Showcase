import axios, {
    AxiosError,
    AxiosHeaders,
    AxiosRequestHeaders,
    InternalAxiosRequestConfig,
} from 'axios';
import { ENDPOINTS } from './endpoints';
import { ApiError, ApiResponse, RequestOptions } from './api-type';

export const AUTH_STORAGE_KEYS = {
    accessToken: 'F88Token',
    refreshToken: 'F88RefreshToken',
    role: 'F88Role',
    userId: 'F88UserId',
} as const;

export const API_CONFIG = {
    TIMEOUT: 30000,
    HEADERS: {
        'Content-Type': 'application/json',
        'Ngrok-Skip-Browser-Warning': 'true',

    },
} as const;

const PUBLIC_AUTH_ENDPOINTS = [
    ENDPOINTS.LOGIN,
    // ENDPOINTS.REGISTER,
    ENDPOINTS.REFRESH_TOKEN,
];

type AuthRequestConfig = InternalAxiosRequestConfig & {
    _retry?: boolean;
    skipAuth?: boolean;
    skipAuthRefresh?: boolean;
    skipAuthRedirect?: boolean;
};

type ApiErrorResponse = {
    message?: string;
    error?: string;
};

type AccessTokenPayload = {
    userId?: unknown;
};

export class ApiRequestError extends Error implements ApiError {
    status: number;
    data?: unknown;

    constructor(message: string, status: number, data?: unknown) {
        super(message);
        this.name = 'ApiRequestError';
        this.status = status;
        this.data = data;
    }
}

export const apiClient = axios.create({
    timeout: API_CONFIG.TIMEOUT,
    headers: API_CONFIG.HEADERS,
});

const refreshClient = axios.create({
    timeout: API_CONFIG.TIMEOUT,
    headers: API_CONFIG.HEADERS,
});

let refreshTokenRequest: Promise<string> | null = null;

function isPublicAuthEndpoint(url?: string) {
    if (!url) {
        return false;
    }

    return PUBLIC_AUTH_ENDPOINTS.some(endpoint => url.includes(endpoint));
}

function withAuthorizationHeader(
    headers: InternalAxiosRequestConfig['headers'] | AxiosRequestHeaders | undefined,
    accessToken: string,
) {
    const nextHeaders = AxiosHeaders.from(headers);
    nextHeaders.set('Authorization', `Bearer ${accessToken}`);
    return nextHeaders;
}

function withNgrokHeader(
    headers: InternalAxiosRequestConfig['headers'] | AxiosRequestHeaders | undefined,
) {
    const nextHeaders = AxiosHeaders.from(headers);
    nextHeaders.set('Ngrok-Skip-browser-warning', 'true');
    return nextHeaders;
}

function normalizeEndpoint(endpoint: string) {
    const normalizedEndpoint = endpoint.trim();

    if (/^https?:\/\//i.test(normalizedEndpoint) || normalizedEndpoint.startsWith('/')) {
        return normalizedEndpoint;
    }

    return `http://${normalizedEndpoint}`;
}

function isNgrokEndpoint(endpoint?: string) {
    return Boolean(endpoint?.includes('.ngrok-free.'));
}

function getAxiosErrorMessage(error: AxiosError<ApiErrorResponse | string>) {
    const responseData = error.response?.data;

    if (typeof responseData === 'string') {
        return responseData;
    }

    if (responseData?.message) {
        return responseData.message;
    }

    if (responseData?.error) {
        return responseData.error;
    }

    if (error.code === 'ECONNABORTED') {
        return 'Request timeout';
    }

    if (error.message === 'Network Error') {
        return 'Network error';
    }

    return error.message || 'Something went wrong';
}

function decodeBase64Url(value: string) {
    const base64 = value
        .replace(/-/g, '+')
        .replace(/_/g, '/')
        .padEnd(value.length + ((4 - (value.length % 4)) % 4), '=');
    const { atob } = globalThis as typeof globalThis & {
        atob?: (data: string) => string;
    };

    if (!atob) {
        throw new Error('atob is not available');
    }

    const binaryString = atob(base64);
    const json = binaryString
        .split('')
        .map(char => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join('');

    return decodeURIComponent(json);
}

function decodeAccessTokenPayload(accessToken: string) {
    const payload = accessToken.split('.')[1];

    if (!payload) {
        return undefined;
    }

    try {
        return JSON.parse(decodeBase64Url(payload)) as AccessTokenPayload;
    } catch (error) {
        console.error('Failed to decode access token payload', error);
        return undefined;
    }
}

function getUserIdFromAccessToken(accessToken: string) {
    const userId = decodeAccessTokenPayload(accessToken)?.userId;

    if (typeof userId !== 'string') {
        return undefined;
    }

    const normalizedUserId = userId.trim();
    return normalizedUserId || undefined;
}

export function toApiRequestError(error: unknown) {
    if (axios.isAxiosError<ApiErrorResponse | string>(error)) {
        return new ApiRequestError(
            getAxiosErrorMessage(error),
            error.response?.status ?? 0,
            error.response?.data,
        );
    }

    if (error instanceof Error) {
        return new ApiRequestError(error.message, 0);
    }

    return new ApiRequestError('Something went wrong', 0, error);
}

// export async function clearAuthSession(shouldRedirect = true) {
//     await removeMultipleData(Object.values(AUTH_STORAGE_KEYS));

//     if (shouldRedirect) {
//         reset('LoginScreen');
//     }
// }

// export async function saveAuthSession(data: Partial<LoginResponseData>) {
//     const writes: Promise<boolean>[] = [];

//     if (data.accessToken) {
//         writes.push(storeData(AUTH_STORAGE_KEYS.accessToken, data.accessToken));

//         const userId = getUserIdFromAccessToken(data.accessToken);

//         if (userId) {
//             writes.push(storeData(AUTH_STORAGE_KEYS.userId, userId));
//         }
//     }

//     if (data.refreshToken) {
//         writes.push(storeData(AUTH_STORAGE_KEYS.refreshToken, data.refreshToken));
//     }

//     if (data.role) {
//         writes.push(storeData(AUTH_STORAGE_KEYS.role, data.role));
//     }

//     await Promise.all(writes);
// }

// async function requestNewAccessToken() {
//     const refreshToken = await getData(AUTH_STORAGE_KEYS.refreshToken);

//     if (!refreshToken) {
//         throw new ApiRequestError('Missing refresh token', 401);
//     }

//     const response = await refreshClient.post<ApiResponse<LoginResponseData>>(
//         normalizeEndpoint(ENDPOINTS.REFRESH_TOKEN),
//         { refreshToken },
//     );

//     const session = response.data.data;

//     if (!session?.accessToken) {
//         throw new ApiRequestError('Invalid refresh token response', 401, response.data);
//     }

//     await saveAuthSession(session);
//     return session.accessToken;
// }

// function refreshAuthToken() {
//     if (!refreshTokenRequest) {
//         refreshTokenRequest = requestNewAccessToken().finally(() => {
//             refreshTokenRequest = null;
//         });
//     }

//     return refreshTokenRequest;
// }

// apiClient.interceptors.request.use(
//     async config => {
//         const requestConfig = config as AuthRequestConfig;

//         if (requestConfig.url) {
//             requestConfig.url = normalizeEndpoint(requestConfig.url);
//         }

//         requestConfig.baseURL = undefined;

//         if (isNgrokEndpoint(requestConfig.url)) {
//             requestConfig.headers = withNgrokHeader(requestConfig.headers);
//         }

//         if (requestConfig.skipAuth || isPublicAuthEndpoint(requestConfig.url)) {
//             return requestConfig;
//         }

//         const accessToken = await getData(AUTH_STORAGE_KEYS.accessToken);

//         if (accessToken) {
//             requestConfig.headers = withAuthorizationHeader(
//                 requestConfig.headers,
//                 accessToken,
//             );
//         }

//         return requestConfig;
//     },
//     error => Promise.reject(toApiRequestError(error)),
// );

// apiClient.interceptors.response.use(
//     response => response,
//     async error => {
//         // console.log('apiClient response error', error);
//         const apiError = toApiRequestError(error);

//         if (!axios.isAxiosError(error) || !error.config) {
//             return Promise.reject(apiError);
//         }

//         const originalRequest = error.config as AuthRequestConfig;
//         const status = error.response?.status;
//         const isPublicEndpoint = isPublicAuthEndpoint(originalRequest.url);
//         const shouldRefresh =
//             status === 401 &&
//             !originalRequest._retry &&
//             !originalRequest.skipAuthRefresh &&
//             !isPublicEndpoint;

//         if (shouldRefresh) {
//             originalRequest._retry = true;

//             try {
//                 const accessToken = await refreshAuthToken();
//                 originalRequest.headers = withAuthorizationHeader(
//                     originalRequest.headers,
//                     accessToken,
//                 );

//                 return apiClient(originalRequest);
//             } catch (refreshError) {
//                 await clearAuthSession();
//                 return Promise.reject(toApiRequestError(refreshError));
//             }
//         }

//         if (status === 401 && !originalRequest.skipAuthRedirect && !isPublicEndpoint) {
//             await clearAuthSession();
//         }

//         return Promise.reject(apiError);
//     },
// );

export async function apiRequest<T>(
    endpoint: string,
    options: RequestOptions = {},
): Promise<ApiResponse<T>> {
    const { body, ...requestOptions } = options;
    // console.log('apiRequest', { endpoint, body, requestOptions });
    const response = await apiClient.request<ApiResponse<T>>({
        ...requestOptions,
        url: endpoint,
        data: body,
    });

    return response.data;
}

export const api = {
    get: <T>(endpoint: string, options?: RequestOptions) =>
        apiRequest<T>(endpoint, { ...options, method: 'GET' }),

    post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
        apiRequest<T>(endpoint, { ...options, method: 'POST', body }),

    put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
        apiRequest<T>(endpoint, { ...options, method: 'PUT', body }),

    patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
        apiRequest<T>(endpoint, { ...options, method: 'PATCH', body }),

    delete: <T>(endpoint: string, options?: RequestOptions) =>
        apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
};
