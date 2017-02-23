import {AuthMethods, AuthProviders} from "angularfire2";

export const firebaseConfig = {
    apiKey: "xxxx",
    authDomain: "xxxx",
    databaseURL: "xxxx",
    storageBucket: "xxxx",
    messagingSenderId: "xxxx"
};

export const firebaseAuthConfig = {
  provider: AuthProviders.Google,
  method: AuthMethods.Redirect, 
  scope: ['email','id','name','picture'],
  offline: true
};

export const webClientId = 'xxxxx.apps.googleusercontent.com';