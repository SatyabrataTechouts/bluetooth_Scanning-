import React, { useEffect, useState } from 'react';
import {
  FlatList,
  NativeEventEmitter,
  NativeModules,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import BleManager from 'react-native-ble-manager';

const BleManagerModule = NativeModules.BleManager;
const BleManagerEmitter = new NativeEventEmitter(BleManagerModule);
const BluetoothComponent = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState([])

  useEffect(() => {
    let stopListener = BleManagerEmitter.addListener(
      'BleManagerStopScan',
      () => {
        setIsScanning(false);
        console.log('Scan is stopped');
      },
    );
    bluetoothInitilise()
 
  }, []);
 const bluetoothInitilise=()=>{
  BleManager.enableBluetooth().then(() => {
    console.log('Bluetooth is turned on!');
  }).catch((e)=>console.log(e));

     if (Platform.OS === 'android' && Platform.Version >= 23) {
    PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      
    ).then(result => {
   
    });
  }

    // PermissionsAndroid.request(
    //   PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    // ).then(result => {
    //   if (result) {
    //     console.log('User accept');
    //   } else {
    //     console.log('User refuse');
    //   }
    // });
  
 }
  const startScan = () => {
    if (!isScanning) {
      BleManager.scan([], 5, true)
        .then(() => {
          setIsScanning(true);
        })
        .catch(error => {
          console.error(error);
        });
    }
  };

  // const requestBluetoothPermission = async () => {
  //   BleManager.enableBluetooth().then(() => {
  //     console.log('Bluetooth is turned on!');
  //   });
  //   if (Platform.OS === 'android' && Platform.Version >= 23) {
  //     const granted = await PermissionsAndroid.request(
  //       PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  //     );
  //     return granted === PermissionsAndroid.RESULTS.GRANTED;
  //   }
  //   return true;
  // };

  const connectDevice = device => {
 
  };

  const disconnectDevice = () => {
  
  };

  // if (!isBluetoothInitialized) {
  //   return (
  //     <View style={styles.mainContainer}>
  //       <Text>Initializing Bluetooth...</Text>
  //     </View>
  //   );
  // }

  return (
    <View style={styles.mainContainer}>
      {devices.length === 0 ? (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={startScan}
            style={styles.circleView}>
            <Text style={styles.boldTextStyle}>Tap to Start Scanning</Text>
          </TouchableOpacity>
        </View>
      ) : Object.keys(connectedDevice).length !== 0 ? (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text style={{marginBottom: 12, textAlign: 'center'}}>
            Tap button to disconnect device.
          </Text>
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={disconnectDevice}
            style={styles.circleView}>
            <Text style={styles.boldTextStyle}>Tap to Disconnect</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          style={{flex: 1}}
          data={z}
          keyExtractor={item => item.id.toString()}
          renderItem={items => (
            <TouchableOpacity
              activeOpacity={0.6}
              onPress={() => connectDevice(items.item)}
              style={{
                width: '100%',
                paddingVertical: 10,
                paddingHorizontal: 12,
                borderWidth: 1,
                borderRadius: 10,
              }}>
              <Text style={{color: 'black', fontSize: 18}}>
                {items.item.name}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    padding: 10,
  },
  circleView: {
    width: 250,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    height: 250,
    borderRadius: 150,
    borderWidth: 1,
  },
  boldTextStyle: {
    fontSize: 20,
    color: '#000',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default BluetoothComponent;
