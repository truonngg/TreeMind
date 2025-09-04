import { describe, it, expect } from 'vitest';
import { generateLocalWeeklyInsights, getWeeklyEntries } from '../weeklyInsights';
import { Entry } from '../../storage/entries';

describe('Weekly Insights', () => {
  const mockEntries: Entry[] = [
    {
      id: '1',
      createdAt: Date.now() - (2 * 24 * 60 * 60 * 1000), // 2 days ago
      title: 'Great workout',
      text: 'Had an amazing workout today. Feeling strong and energized!',
      sentiment: { score: 0.8, label: 'positive' },
      themes: ['health', 'fitness']
    },
    {
      id: '2',
      createdAt: Date.now() - (1 * 24 * 60 * 60 * 1000), // 1 day ago
      title: 'Work stress',
      text: 'Feeling overwhelmed with work deadlines. Need to manage time better.',
      sentiment: { score: -0.3, label: 'negative' },
      themes: ['work', 'stress']
    },
    {
      id: '3',
      createdAt: Date.now() - (8 * 24 * 60 * 60 * 1000), // 8 days ago (should be excluded)
      title: 'Old entry',
      text: 'This should not be included in weekly analysis',
      sentiment: { score: 0.5, label: 'positive' },
      themes: ['general']
    }
  ];

  describe('getWeeklyEntries', () => {
    it('should filter entries to only include those from the past 7 days', () => {
      const weeklyEntries = getWeeklyEntries(mockEntries);
      expect(weeklyEntries).toHaveLength(2);
      expect(weeklyEntries.map(e => e.id)).toEqual(['1', '2']);
    });

    it('should return empty array when no entries in past week', () => {
      const oldEntries = mockEntries.map(entry => ({
        ...entry,
        createdAt: Date.now() - (10 * 24 * 60 * 60 * 1000) // 10 days ago
      }));
      const weeklyEntries = getWeeklyEntries(oldEntries);
      expect(weeklyEntries).toHaveLength(0);
    });
  });

  describe('generateLocalWeeklyInsights', () => {
    it('should generate insights for entries from the past week', () => {
      const insights = generateLocalWeeklyInsights(mockEntries);
      
      expect(insights.totalEntries).toBe(2);
      expect(insights.topThemes.length).toBeGreaterThan(0);
      
      // Check that health and work themes are present
      const healthTheme = insights.topThemes.find(t => t.theme === 'health');
      const workTheme = insights.topThemes.find(t => t.theme === 'work');
      expect(healthTheme).toBeDefined();
      expect(workTheme).toBeDefined();
      
      expect(insights.sentimentTrend.positive).toBe(50);
      expect(insights.sentimentTrend.negative).toBe(50);
      expect(insights.sentimentTrend.neutral).toBe(0);
      
      expect(insights.insights.length).toBeGreaterThan(0);
    });

    it('should return empty insights when no entries exist', () => {
      const insights = generateLocalWeeklyInsights([]);
      
      expect(insights.totalEntries).toBe(0);
      expect(insights.insights).toHaveLength(0);
      expect(insights.topThemes).toHaveLength(0);
    });

    it('should calculate average entry length correctly', () => {
      const insights = generateLocalWeeklyInsights(mockEntries);
      const expectedLength = Math.round((mockEntries[0].text.length + mockEntries[1].text.length) / 2);
      expect(insights.averageEntryLength).toBe(expectedLength);
    });

    it('should identify most active day', () => {
      const insights = generateLocalWeeklyInsights(mockEntries);
      expect(insights.mostActiveDay).toBeTruthy();
      expect(typeof insights.mostActiveDay).toBe('string');
    });
  });
});
