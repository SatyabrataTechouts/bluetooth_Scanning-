import React, { useEffect, useState } from 'react';
import {
  FlatList,
  NativeEventEmitter,
  NativeModules,
  PermissionsAndroid,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import BleManager from 'react-native-ble-manager';

const BleManagerModule = NativeModules.BleManager;
const BleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const BluetoothComp = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    BleManager.start({ showAlert: false }).then(() => {
      console.log('BleManager initialized');
    });
    bluetoothInitialize();

    const stopListener = BleManagerEmitter.addListener('BleManagerStopScan', () => {
      setIsScanning(false);
      console.log('Scan is stopped');
    });

    const discoverListener = BleManagerEmitter.addListener('BleManagerDiscoverPeripheral', peripheral => {
      console.log('Discovered Peripheral:', peripheral);
      // Add the discovered peripheral to the devices state if it doesn't already exist
      setDevices(prevDevices => {
        const updatedDevices = [...prevDevices];
        const index = updatedDevices.findIndex(dev => dev.id === peripheral.id);
        if (index === -1) {
          updatedDevices.push(peripheral);
        }
        return updatedDevices;
      });
    });

    return () => {
      stopListener.remove();
      discoverListener.remove();
    };
  }, []);

  const bluetoothInitialize = () => {
    PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then(result => {
      if (result) {
        console.log('User accepted location permission.');
      } else {
        console.log('User refused location permission.');
      }
    });

    BleManager.enableBluetooth()
      .then(() => {
        console.log('Bluetooth is turned on!');
      })
      .catch(e => console.log(e));
  };

  const handleGetConnectedDevices = () => {
    BleManager.getConnectedPeripherals([]).then(results => {
      if (results.length === 0) {
        console.log('No connected Bluetooth devices.');
      } else {
        const peripheralsMap = new Map();
        results.forEach(peripheral => {
          peripheralsMap.set(peripheral.id, peripheral);
        });
        const connectedDevicesArray = Array.from(peripheralsMap.values());
        setDevices(connectedDevicesArray);
      }
    });
  };

  const startScan = () => {
    PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN).then(res => {
      if (res) {
        if (!isScanning) {
          BleManager.scan([], 5, true)
            .then(data => {
              setIsScanning(true);
              console.log('Scan data:', data);
            })
            .catch(error => {
              console.error(error);
            });
        }
      }
    });
  };

  const connectDevice = device => {
    // You can implement the logic to connect to a specific device here
  };

  const disconnectDevice = device => {
    // You can implement the logic to disconnect from a specific device here
  };
  console.log('device',devices)
  return (
    <View style={styles.mainContainer}>
      {devices.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={startScan}
            style={styles.circleView}>
            <Text style={styles.boldTextStyle}>Tap to Start Scanning</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          style={{ flex: 1 }}
          data={devices}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.6}
              onPress={() => connectDevice(item)}
              style={{
                width: '100%',
                paddingVertical: 10,
                paddingHorizontal: 12,
                borderWidth: 1,
                borderRadius: 10,
                
              }}>
              <Text style={{ color: 'black', fontSize: 18 }}>{item.name}</Text>
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

export default BluetoothComp;
