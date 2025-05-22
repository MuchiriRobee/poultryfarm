import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { WEATHER_API_KEY } from '@env';

export default function LandingScreen({ navigation, route }) {
  const [farmName, setFarmName] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hatchRateData, setHatchRateData] = useState({
    labels: ['Batch 1', 'Batch 2', 'Batch 3', 'Batch 4'],
    datasets: [{ data: [85, 90, 78, 92] }],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch farmName
        const navFarmName = route.params?.farmName;
        if (navFarmName) {
          setFarmName(navFarmName);
          await AsyncStorage.setItem('farmName', navFarmName);
        } else {
          const storedFarmName = await AsyncStorage.getItem('farmName');
          if (storedFarmName) setFarmName(storedFarmName);
        }

        // Fetch weather
        const weatherResponse = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?q=Nairobi&appid=${WEATHER_API_KEY}&units=metric`
        );
        setWeather(weatherResponse.data);

        // Fetch hatch rate data
        const token = await AsyncStorage.getItem('token');
        const farmName = await AsyncStorage.getItem('farmName');
        const batchResponse = await axios.get('http://192.168.1.66:5000/api/batch', {
          headers: { Authorization: `Bearer ${token}` },
          params: { farmName },
        });
        const batches = batchResponse.data.slice(0, 4); // Limit to 4 for chart
        setHatchRateData({
          labels: batches.map((b) => b.batch_name),
          datasets: [{ data: batches.map((b) => b.hatch_rate || 0) }],
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [route.params?.farmName]);

  // Mock data for feed consumption
  const feedConsumptionData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    datasets: [{ data: [50, 60, 55, 70, 65] }],
  };

  const chartConfig = {
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    decimalPlaces: 0,
  };

  return (
    <View style={styles.container}>
      {/* App Bar */}
      <View style={styles.appBar}>
        <Text style={styles.appBarTitle}>Welcome {farmName || 'User'}</Text>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Icon name="menu" size={30} color="#fff" style={styles.menuIcon} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Weather Widget */}
        <View style={styles.widget}>
          <Text style={styles.widgetTitle}>Weather</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#007bff" />
          ) : weather ? (
            <View>
              <Text style={styles.weatherText}>
                {weather.name}: {weather.main.temp}°C, {weather.weather[0].description}
              </Text>
            </View>
          ) : (
            <Text>Failed to load weather data</Text>
          )}
        </View>

        {/* Feed Consumption Chart */}
        <View style={styles.widget}>
          <Text style={styles.widgetTitle}>Feed Consumption (kg)</Text>
          <BarChart
            data={feedConsumptionData}
            width={Dimensions.get('window').width - 40}
            height={220}
            chartConfig={chartConfig}
            style={styles.chart}
          />
        </View>

        {/* Hatch Rate Chart */}
        <View style={styles.widget}>
          <Text style={styles.widgetTitle}>Hatch Rate (%)</Text>
          <BarChart
            data={hatchRateData}
            width={Dimensions.get('window').width - 40}
            height={220}
            chartConfig={chartConfig}
            style={styles.chart}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  appBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#007bff',
    padding: 15,
  },
  appBarTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  menuIcon: {
    marginRight: 10,
  },
  content: {
    flex: 1,
  },
  widget: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 15,
    borderRadius: 10,
    elevation: 3,
  },
  widgetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  weatherText: {
    fontSize: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});