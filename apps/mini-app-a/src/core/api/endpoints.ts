
// export const ENDPOINTS = {
//     LOGIN: 'http://10.100.104.175:8082/api/v1/auth/login',
//     REFRESH_TOKEN: 'http://10.100.104.175:8082/api/v1/auth/refresh-token',

//     USER_PROFILE: (userId: string) => `http://10.100.104.175:8081/api/v1/users/${userId}`,

//     COMMISSION_OVERVIEW: 'http://10.100.104.175:8088/api/v1/commission/transactions/overview',
//     EXPECTED_COMMISSIONS: 'http://10.100.104.175:8088/api/v1/commission/transactions/collaborator',
//     DETAIL_COMMISSION: (id: string) => `http://10.100.104.175:8088/api/v1/commission/transactions/${id}/details`,

//     MY_PRODUCTS: 'http://10.100.104.175:8087/api/v1/products',
//     PRODUCT_DETAIL: (id: string) => `http://10.100.104.175:8087/api/v1/products/${id}`,

//     POLICIES: 'http://10.100.104.175:8089/api/v1/policies',
//     POLICY_DETAIL: (id: string) => `http://10.100.104.175:8089/api/v1/policies/${id}`,
//     POLICY_DETAIL_INCOME: (id: string) => ``,
//     POLICY_OVERVIEW: 'http://10.100.104.175:8089/api/v1/policies/overview'

// } as const;



export const ENDPOINTS = {
    LOGIN: 'https://affluent-unfixed-capital.ngrok-free.dev/auth-service/api/v1/auth/login',
    REFRESH_TOKEN: 'https://affluent-unfixed-capital.ngrok-free.dev/auth-service/api/v1/auth/refresh-token',

    USER_PROFILE: (userId: string) => `https://affluent-unfixed-capital.ngrok-free.dev/user-service/api/v1/users/${userId}`,

    COMMISSION_OVERVIEW: 'https://affluent-unfixed-capital.ngrok-free.dev/commission-service/api/v1/commission/transactions/overview',
    EXPECTED_COMMISSIONS: 'https://affluent-unfixed-capital.ngrok-free.dev/commission-service/api/v1/commission/transactions/collaborator',
    DETAIL_COMMISSION: (id: string) => `https://affluent-unfixed-capital.ngrok-free.dev/commission-service/api/v1/commission/transactions/${id}/details`,

    MY_PRODUCTS: 'https://affluent-unfixed-capital.ngrok-free.dev/product-service/api/v1/products',

    POLICIES: 'https://affluent-unfixed-capital.ngrok-free.dev/policy-service/api/v1/policies',
    POLICY_DETAIL: (id: string) => `https://affluent-unfixed-capital.ngrok-free.dev/policy-service/api/v1/policies/${id}`,
    POLICY_DETAIL_INCOME: (id: string) => ``,
    POLICY_OVERVIEW: 'https://affluent-unfixed-capital.ngrok-free.dev/policy-service/api/v1/policies/overview'

} as const;
