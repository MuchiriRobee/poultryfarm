import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Alert } from 'react-native';
import { Agenda } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import moment from 'moment';
import * as Notifications from 'expo-notifications';

export default function HatchingRateScreen() {
  const [batches, setBatches] = useState({});
  const [batchName, setBatchName] = useState('');
  const [eggCount, setEggCount] = useState('');
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
  const [hatchedCount, setHatchedCount] = useState('');
  const [selectedBatchId, setSelectedBatchId] = useState(null);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const farmName = await AsyncStorage.getItem('farmName');
      const response = await axios.get('http://192.168.1.66:5000/api/batch', {
        headers: { Authorization: `Bearer ${token}` },
        params: { farmName },
      });
      const batchData = response.data.reduce((acc, batch) => {
        const date = moment(batch.input_date).format('YYYY-MM-DD');
        if (!acc[date]) acc[date] = [];
        acc[date].push({
          id: batch.id, // Changed from _id to id
          name: batch.batch_name,
          eggCount: batch.egg_count,
          hatchedCount: batch.hatched_count,
          hatchRate: batch.hatch_rate,
        });
        return acc;
      }, {});
      setBatches(batchData);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch batches');
    }
  };

  const scheduleNotification = async (batchName, inputDate) => {
    const dropDate = moment(inputDate).add(17, 'days').toDate();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Egg Batch Drop Reminder',
        body: `Batch ${batchName} is due for dropping to trays tomorrow!`,
      },
      trigger: {
        date: dropDate,
      },
    });
  };

  const addBatch = async () => {
    if (!batchName || !eggCount || isNaN(eggCount)) {
      Alert.alert('Error', 'Please enter a valid batch name and egg count');
      return;
    }
    try {
      const token = await AsyncStorage.getItem('token');
      const farmName = await AsyncStorage.getItem('farmName');
      const response = await axios.post(
        'http://192.168.1.66:5000/api/batch',
        {
          batchName,
          inputDate: selectedDate,
          eggCount: parseInt(eggCount),
          farmName,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await scheduleNotification(batchName, selectedDate);
      setBatches((prev) => {
        const date = selectedDate;
        const newBatch = {
          id: response.data.id, // Changed from _id to id
          name: batchName,
          eggCount: parseInt(eggCount),
          hatchedCount: 0,
          hatchRate: 0,
        };
        return {
          ...prev,
          [date]: prev[date] ? [...prev[date], newBatch] : [newBatch],
        };
      });
      setBatchName('');
      setEggCount('');
    } catch (error) {
      Alert.alert('Error', 'Failed to add batch');
    }
  };

  const updateHatchRate = async () => {
    if (!selectedBatchId || !hatchedCount || isNaN(hatchedCount)) {
      Alert.alert('Error', 'Please select a batch and enter a valid hatched count');
      return;
    }
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.put(
        `http://192.168.1.66:5000/api/batch/${selectedBatchId}`,
        { hatchedCount: parseInt(hatchedCount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBatches((prev) => {
        const updatedBatches = { ...prev };
        for (const date in updatedBatches) {
          updatedBatches[date] = updatedBatches[date].map((batch) =>
            batch.id === selectedBatchId
              ? {
                  ...batch,
                  hatchedCount: parseInt(hatchedCount),
                  hatchRate: response.data.hatch_rate, // Changed from hatchRate to hatch_rate
                }
              : batch
          );
        }
        return updatedBatches;
      });
      setHatchedCount('');
      setSelectedBatchId(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to update hatch rate');
    }
  };

  const markedDates = Object.keys(batches).reduce((acc, date) => {
    acc[date] = {
      marked: true,
      dotColor: '#007bff',
      selected: date === selectedDate,
      selectedColor: '#007bff',
    };
    return acc;
  }, {});

  const renderItem = (item) => (
    <View style={styles.batchItem}>
      <Text style={styles.batchText}>
        {item.name}: {item.eggCount} eggs, Hatched: {item.hatchedCount}, Hatch Rate: {item.hatchRate.toFixed(2)}%
      </Text>
      <Button
        title="Update Hatch Rate"
        onPress={() => setSelectedBatchId(item.id)}
      />
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Hatching Rate Management</Text>

      <Agenda
        items={batches}
        selected={selectedDate}
        onDayPress={(day) => setSelectedDate(day.dateString)}
        renderItem={renderItem}
        markedDates={markedDates}
        theme={{
          selectedDayBackgroundColor: '#007bff',
          dotColor: '#007bff',
          todayTextColor: '#007bff',
        }}
      />

      <View style={styles.inputContainer}>
        <Text style={styles.subtitle}>Add New Batch</Text>
        <TextInput
          style={styles.input}
          placeholder="Batch Name"
          value={batchName}
          onChangeText={setBatchName}
        />
        <TextInput
          style={styles.input}
          placeholder="Number of Eggs"
          value={eggCount}
          onChangeText={setEggCount}
          keyboardType="numeric"
        />
        <Button title="Add Batch" onPress={addBatch} />
      </View>

      {selectedBatchId && (
        <View style={styles.inputContainer}>
          <Text style={styles.subtitle}>Update Hatch Rate</Text>
          <TextInput
            style={styles.input}
            placeholder="Number of Hatched Eggs"
            value={hatchedCount}
            onChangeText={setHatchedCount}
            keyboardType="numeric"
          />
          <Button title="Update Hatch Rate" onPress={updateHatchRate} />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    margin: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  inputContainer: {
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  batchItem: {
    backgroundColor: '#fff',
    padding: 15,
    margin: 10,
    borderRadius: 5,
    elevation: 3,
  },
  batchText: {
    fontSize: 16,
    marginBottom: 10,
  },
});