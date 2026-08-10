import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { COLORS } from '../utils/constants';

const screenWidth = Dimensions.get('window').width;

export default function SleepGraph({ sleepData }) {
  if (!sleepData || sleepData.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>No sleep data available</Text>
      </View>
    );
  }

  // Prepare data for chart
  const labels = sleepData.map((_, index) => `Day ${index + 1}`);
  const sleepStartHours = sleepData.map(item => {
    if (item.sleepStart) {
      const date = new Date(item.sleepStart);
      return date.getHours() + date.getMinutes() / 60;
    }
    return 22;
  });

  const data = {
    labels: labels.slice(-7), // Last 7 days
    datasets: [
      {
        data: sleepStartHours.slice(-7),
        color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: COLORS.surface,
    backgroundGradientFrom: COLORS.surface,
    backgroundGradientTo: COLORS.surface,
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(31, 41, 55, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: COLORS.primary,
    },
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sleep Start Time (Last 7 Days)</Text>
      <LineChart
        data={data}
        width={screenWidth - 40}
        height={220}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
        yAxisLabel=""
        yAxisSuffix="h"
        fromZero={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  noDataText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    padding: 20,
  },
});

