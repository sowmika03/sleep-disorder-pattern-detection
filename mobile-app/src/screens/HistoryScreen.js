import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { activityAPI, predictionAPI } from '../services/api';
import ActivityCard from '../components/ActivityCard';
import { COLORS } from '../utils/constants';

export default function HistoryScreen() {
  const [activities, setActivities] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [activeTab, setActiveTab] = useState('activities');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'activities') {
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        const response = await activityAPI.getHistory(
          startDate.toISOString(),
          endDate.toISOString(),
          50
        );
        if (response.data?.activities) {
          setActivities(response.data.activities);
        }
      } else {
        // For predictions, we'll use getLatest for now
        // In a full implementation, you'd have a getHistory endpoint
        const response = await predictionAPI.getLatest();
        if (response.data?.prediction) {
          setPredictions([response.data.prediction]);
        }
      }
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'activities' && styles.tabActive]}
          onPress={() => setActiveTab('activities')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'activities' && styles.tabTextActive,
            ]}
          >
            Activities
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'predictions' && styles.tabActive]}
          onPress={() => setActiveTab('predictions')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'predictions' && styles.tabTextActive,
            ]}
          >
            Predictions
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeTab === 'activities' ? (
          <>
            {activities.length > 0 ? (
              activities.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No activities found</Text>
                <Text style={styles.emptySubtext}>
                  Upload activities to see your history
                </Text>
              </View>
            )}
          </>
        ) : (
          <>
            {predictions.length > 0 ? (
              predictions.map((prediction) => (
                <View key={prediction.id} style={styles.predictionCard}>
                  <Text style={styles.predictionType}>
                    {prediction.type.toUpperCase()}
                  </Text>
                  <Text style={styles.predictionProb}>
                    {(prediction.probability * 100).toFixed(1)}% probability
                  </Text>
                  <Text style={styles.predictionDate}>
                    {new Date(prediction.createdAt).toLocaleString()}
                  </Text>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No predictions found</Text>
                <Text style={styles.emptySubtext}>
                  Generate a prediction to see your history
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  predictionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  predictionType: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 8,
  },
  predictionProb: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 4,
  },
  predictionDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});

