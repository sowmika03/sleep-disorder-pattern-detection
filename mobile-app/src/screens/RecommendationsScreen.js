import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { recommendationAPI } from '../services/api';
import { COLORS } from '../utils/constants';

export default function RecommendationsScreen() {
  const [recommendations, setRecommendations] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all' or 'unread'
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadRecommendations();
  }, [filter]);

  const loadRecommendations = async () => {
    try {
      const response = await recommendationAPI.getAll(filter === 'unread');
      if (response.data?.recommendations) {
        setRecommendations(response.data.recommendations);
      }
    } catch (error) {
      console.error('Error loading recommendations:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRecommendations();
    setRefreshing(false);
  };

  const handleMarkAsRead = async (id) => {
    try {
      await recommendationAPI.markAsRead(id);
      await loadRecommendations();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 1:
        return COLORS.danger;
      case 2:
        return COLORS.warning;
      default:
        return COLORS.info;
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 1:
        return 'High';
      case 2:
        return 'Medium';
      default:
        return 'Low';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.filters}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterActive]}
          onPress={() => setFilter('all')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'all' && styles.filterTextActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'unread' && styles.filterActive]}
          onPress={() => setFilter('unread')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'unread' && styles.filterTextActive,
            ]}
          >
            Unread
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {recommendations.length > 0 ? (
          recommendations.map((rec) => (
            <View
              key={rec.id}
              style={[
                styles.card,
                !rec.is_read && styles.cardUnread,
              ]}
            >
              <View style={styles.cardHeader}>
                <View
                  style={[
                    styles.priorityBadge,
                    { backgroundColor: getPriorityColor(rec.priority) },
                  ]}
                >
                  <Text style={styles.priorityText}>
                    {getPriorityLabel(rec.priority)}
                  </Text>
                </View>
                {!rec.is_read && (
                  <View style={styles.unreadDot} />
                )}
              </View>

              <Text style={styles.cardTitle}>{rec.title}</Text>
              <Text style={styles.cardDescription}>{rec.description}</Text>

              <View style={styles.cardFooter}>
                <Text style={styles.cardType}>{rec.recommendation_type}</Text>
                {!rec.is_read && (
                  <TouchableOpacity
                    style={styles.markReadButton}
                    onPress={() => handleMarkAsRead(rec.id)}
                  >
                    <Text style={styles.markReadText}>Mark as Read</Text>
                  </TouchableOpacity>
                )}
              </View>

              <Text style={styles.cardDate}>
                {new Date(rec.created_at).toLocaleDateString()}
              </Text>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No recommendations</Text>
            <Text style={styles.emptySubtext}>
              Generate a prediction to receive personalized recommendations
            </Text>
          </View>
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
  filters: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.background,
  },
  filterActive: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
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
  cardUnread: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardType: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textTransform: 'capitalize',
  },
  markReadButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: COLORS.primary + '20',
  },
  markReadText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  cardDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
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
    textAlign: 'center',
  },
});

