import React, { useEffect, useState } from 'react';
import { FlatList, PermissionsAndroid, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BleManager } from 'react-native-ble-plx';

const _BleManager = new BleManager();

const BluetoothComponent = () => {
  const [scanning, setScanning] = useState(false);
  const [devices, setDevices] = useState([]);
  const [connectedDevice, setConnectedDevice] = useState({});
  const [characteristics, setCharacteristics] = useState([]);
  const [isBluetoothInitialized,setIsBluetoothInitialized]=useState(false)
  useEffect(() => {
    const initializeBluetooth = async () => {
      try {
        const granted = await requestBluetoothPermission();
        if (!granted) {
          console.log('Bluetooth permission denied.');
          return;
        }

        setIsBluetoothInitialized(true);
      } catch (error) {
        console.error('Error initializing Bluetooth:', error);
      }
    };

    initializeBluetooth();

    return () => {
      _BleManager.stopDeviceScan();
    };
  }, []);

  const startScan = () => {
    _BleManager.startDeviceScan(null, { allowDuplicates: false }, async (error, device) => {
      if (error) {
        console.error('Error scanning for devices:', error);
        _BleManager.stopDeviceScan();
        return;
      }

      console.log(device.localName, device.name);
      if (device.localName === 'Test' || device.name === 'Test') {
        setDevices(prevDevices => [...prevDevices, device]);
      }
    });
  };

  const requestBluetoothPermission = async () => {
    if (Platform.OS === 'android' && Platform.Version >= 23) {
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const connectDevice = (device) => {
    _BleManager.stopDeviceScan();
    _BleManager.connectToDevice(device.id)
      .then(async (connectedDevice) => {
        await connectedDevice.discoverAllServicesAndCharacteristics();
        setConnectedDevice(connectedDevice);
        setDevices([]);
        connectedDevice.services().then((service) => {
          for (const ser of service) {
            ser.characteristics().then((characteristic) => {
              setCharacteristics((prevCharacteristics) => [...prevCharacteristics, characteristic]);
            });
          }
        });
      })
      .catch((error) => {
        console.error('Error connecting to device:', error);
      });
  };

  const disconnectDevice = () => {
    connectedDevice.cancelConnection();
    setConnectedDevice({});
  };

  return (
    <View style={styles.mainContainer}>
      {devices.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <TouchableOpacity activeOpacity={0.6} onPress={()=>startScan()} style={styles.circleView}>
            <Text style={styles.boldTextStyle}>Tap to Start Scanning</Text>
          </TouchableOpacity>
        </View>
      ) : Object.keys(connectedDevice).length !== 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ marginBottom: 12, textAlign: 'center' }}>Tap button to disconnect device.</Text>
          <TouchableOpacity activeOpacity={0.6} onPress={disconnectDevice} style={styles.circleView}>
            <Text style={styles.boldTextStyle}>Tap to Disconnect</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          style={{ flex: 1 }}
          data={devices}
          keyExtractor={(item) => item.id.toString()}
          renderItem={(items) => (
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
              <Text style={{ color: 'black', fontSize: 18 }}>{items.item.name}</Text>
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
