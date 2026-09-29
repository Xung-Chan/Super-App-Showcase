import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './navigation/Navigator';
import { useFreeRasp } from 'freerasp-react-native';



function App() {
  // app configuration
  const config = {
    androidConfig: {
      //ApplicationId
      packageName: 'com.hostapp',
      certificateHashes: ['+sYXRdwJA3hvue3mKpYrOZ9zSPC7b4mbgzJmdZEDO5w='],  // replace with your release (!) signing certificate hash(es)
      supportedAlternativeStores: ['com.sec.android.app.samsungapps'],
    },
    iosConfig: {
      appBundleId: 'com.hostapp',
      appTeamId: 'your_team_ID',
    },
    watcherMail: 'nmdtruong18032004@gmail.com', // for Security Reports, Talsec Portal, Updates
    isProd: __DEV__,
    killOnBypass: true,
  };
  // reactions for detected threats
  const actions = {
    // Android & iOS
    privilegedAccess: () => {
      console.log('privilegedAccess');
    },
    // Android & iOS
    debug: () => {
      console.log('debug');
    },
    // Android & iOS
    simulator: () => {
      console.log('simulator');
    },
    // Android & iOS
    appIntegrity: () => {
      console.log('appIntegrity');
    },
    // Android & iOS
    unofficialStore: () => {
      console.log('unofficialStore');
    },
    // Android & iOS
    hooks: () => {
      console.log('hooks');
    },
    // Android & iOS
    deviceBinding: () => {
      console.log('deviceBinding');
    },
    // Android & iOS
    secureHardwareNotAvailable: () => {
      console.log('secureHardwareNotAvailable');
    },
    // Android & iOS
    systemVPN: () => {
      console.log('systemVPN');
    },
    // Android & iOS
    passcode: () => {
      console.log('passcode');
    },
    // iOS only
    deviceID: () => {
      console.log('deviceID');
    },
    // Android only
    obfuscationIssues: () => {
      console.log('obfuscationIssues');
    },
    // Android only
    devMode: () => {
      console.log('devMode');
    },
    // Android only
    adbEnabled: () => {
      console.log('adbEnabled');
    },
    // Android & iOS
    screenshot: () => {
      console.log('screenshot');
    },
    // Android & iOS
    screenRecording: () => {
      console.log('screenRecording');
    },
    // Android only
    multiInstance: () => {
      console.log('multiInstance');
    },
    // Android & iOS  
    timeSpoofing: () => {
      console.log('timeSpoofing');
    },
    // Android only
    locationSpoofing: () => {
      console.log('locationSpoofing');
    },
    // Android only
    unsecureWifi: () => {
      console.log('unsecureWifi');
    },
    // Android only
    automation: () => {
      console.log('automation');
    },
    // Android only
    bootloader: () => {
      console.log('bootloader');
    },
  };
  const raspExecutionStateActions = {
    allChecksFinished: () => {
      console.log('allChecksFinished');
    },
  };
  useFreeRasp(config, actions, raspExecutionStateActions);
  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  );
}


export default App;
