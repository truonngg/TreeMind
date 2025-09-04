"use client";

import { useState, useEffect } from 'react';

export type PrivacyMode = 'private' | 'gemini';

interface PrivacyPreferences {
  titleGenerationMode: PrivacyMode;
  analyticsEnabled: boolean;
}

const DEFAULT_PREFERENCES: PrivacyPreferences = {
  titleGenerationMode: 'private',
  analyticsEnabled: false,
};

export function usePrivacyPreferences() {
  const [preferences, setPreferences] = useState<PrivacyPreferences>(DEFAULT_PREFERENCES);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('treeMind-privacy-preferences');
      if (stored) {
        const parsed = JSON.parse(stored);
        setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
      }
    } catch (error) {
      console.error('Failed to load privacy preferences:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('treeMind-privacy-preferences', JSON.stringify(preferences));
      } catch (error) {
        console.error('Failed to save privacy preferences:', error);
      }
    }
  }, [preferences, isLoaded]);

  const updateTitleGenerationMode = (mode: PrivacyMode) => {
    setPreferences(prev => ({ ...prev, titleGenerationMode: mode }));
  };

  const updateAnalyticsEnabled = (enabled: boolean) => {
    setPreferences(prev => ({ ...prev, analyticsEnabled: enabled }));
  };

  const resetToDefaults = () => {
    setPreferences(DEFAULT_PREFERENCES);
  };

  return {
    preferences,
    isLoaded,
    updateTitleGenerationMode,
    updateAnalyticsEnabled,
    resetToDefaults,
  };
}
