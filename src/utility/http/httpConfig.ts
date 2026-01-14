// ** Api Endpoints

// const domain = 'cafeapi.chjind.com'
const domain = 'www.cafeapi.gofactz.com'

export default {
  // ** This will be prefixed in authorization header with token
  // ? e.g. Authorization: Bearer <token>
  tokenType: 'Bearer',
  entryPoint: 'web',

  // ** Value of this property will be used as key to store JWT token in storage
  storageTokenKeyName: 'token',
  storageRefreshTokenKeyName: 'token',
  storageUserData: 'kpmg-meeting-notes-userdata',

  // base api urls
  baseUrl: `https://${domain}/api/`,
  baseUrl2: `https://${domain}/`,
  baseUrl3: `https://${domain}`,

  enableSocket: false,
  socketChatUrl: `ws://${domain}:8090`,

  socketNotificationUrl: domain,
  socketNotificationPort: 6001,

  encryptKey: '',
  enableAES: false
}
