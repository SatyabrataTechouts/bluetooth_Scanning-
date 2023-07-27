import React, { useEffect, useState } from 'react';
import { Button, PermissionsAndroid, Platform, Text, View } from 'react-native';
import BleManager from 'react-native-ble-plx';

const BluetoothComponent = () => {
  const [scanning, setScanning] = useState(false);
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    const initializeBluetooth = async () => {
      try {
        const granted = await requestBluetoothPermission();
        if (!granted) {
          console.log('Bluetooth permission denied.');
          return;
        }

        BleManager.start({ showAlert: false })
          .then(() => {
            console.log('BleManager initialized successfully');
          })
          .catch((error) => {
            console.error('Error initializing BleManager:', error);
          });
      } catch (error) {
        console.error('Error initializing Bluetooth:', error);
      }
    };

    initializeBluetooth();

    return () => {
      BleManager.stopScan();
    };
  }, []);

  const startScan = () => {
    setScanning(true);
    setDevices([]);

    BleManager.startDeviceScan([], null, (error, results) => {
      if (error) {
        console.error('Error scanning for devices:', error);
      } else {
        console.log('Scanning results:', results);
        setDevices(results);
        setScanning(false);
      }})
  };

  const requestBluetoothPermission = async () => {
    if (Platform.OS === 'android' && Platform.Version >= 23) {
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const connectToDevice = async (device) => {
    try {
      await device.connect();
      console.log('Connected to device:', device.name);
      // You can now perform any actions with the connected device.
    } catch (error) {
      console.error('Error connecting to device:', error);
    }
  };

  return (
    <View>
      <Button title="Start Scan" onPress={startScan} disabled={scanning} />
      {devices.map((device) => (
        <View key={device.id}>
          <Text>{device.name}</Text>
          <Button title="Connect" onPress={() => connectToDevice(device)} />
        </View>
      ))}
    </View>
  );
};

export default BluetoothComponent;
