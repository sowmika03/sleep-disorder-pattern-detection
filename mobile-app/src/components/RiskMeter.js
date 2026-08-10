import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SLEEP_DISORDER_TYPES } from '../utils/constants';

export default function RiskMeter({ prediction, probability }) {
  if (!prediction) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>No prediction available</Text>
      </View>
    );
  }

  const getRiskColor = () => {
    switch (prediction) {
      case SLEEP_DISORDER_TYPES.INSOMNIA:
        return COLORS.danger;
      case SLEEP_DISORDER_TYPES.DSPS:
        return COLORS.warning;
      default:
        return COLORS.success;
    }
  };

  const getRiskLabel = () => {
    switch (prediction) {
      case SLEEP_DISORDER_TYPES.INSOMNIA:
        return 'High Risk - Insomnia';
      case SLEEP_DISORDER_TYPES.DSPS:
        return 'Moderate Risk - DSPS';
      default:
        return 'Low Risk - Normal';
    }
  };

  const riskPercentage = Math.round(probability * 100);
  const riskColor = getRiskColor();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Risk Assessment</Text>
      <View style={styles.meterContainer}>
        <View style={styles.meterBackground}>
          <View
            style={[
              styles.meterFill,
              {
                width: `${riskPercentage}%`,
                backgroundColor: riskColor,
              },
            ]}
          />
        </View>
        <Text style={[styles.riskLabel, { color: riskColor }]}>
          {getRiskLabel()}
        </Text>
        <Text style={styles.percentage}>{riskPercentage}%</Text>
      </View>
      <View style={styles.details}>
        <Text style={styles.detailText}>
          Prediction: <Text style={styles.bold}>{prediction.toUpperCase()}</Text>
        </Text>
        <Text style={styles.detailText}>
          Confidence: <Text style={styles.bold}>{riskPercentage}%</Text>
        </Text>
      </View>
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
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  meterContainer: {
    marginVertical: 12,
  },
  meterBackground: {
    height: 24,
    backgroundColor: COLORS.border,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  meterFill: {
    height: '100%',
    borderRadius: 12,
  },
  riskLabel: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  percentage: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: COLORS.text,
  },
  details: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  detailText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginVertical: 4,
  },
  bold: {
    fontWeight: '600',
    color: COLORS.text,
  },
  noDataText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    padding: 20,
  },
});

