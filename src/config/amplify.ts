import { Amplify } from 'aws-amplify';
import { ENV } from './env';

export function configureAmplify() {
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: ENV.COGNITO_USER_POOL_ID,
        userPoolClientId: ENV.COGNITO_CLIENT_ID,
        loginWith: {
          oauth: {
            domain: ENV.COGNITO_DOMAIN,
            scopes: ['email', 'profile', 'openid', 'aws.cognito.signin.user.admin'],
            // Aseguramos que coincida con lo que tienes en la consola de AWS
            redirectSignIn: ['http://localhost:5173/callback'],
            redirectSignOut: ['http://localhost:5173/login'],
            responseType: 'code',
            providers: ['Google'],
          }
        }
      }
    }
  });
}