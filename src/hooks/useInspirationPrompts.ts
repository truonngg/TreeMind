"use client";

import { useState, useEffect, useCallback } from 'react';
import { getRandomPrompts } from '@/lib/prompts/curatedPrompts';
import { listEntries } from '@/lib/storage/entries';

export interface InspirationPrompt {
  text: string;
  isContextAware: boolean;
  type: 'curated' | 'context';
}

export function useInspirationPrompts() {
  const [prompts, setPrompts] = useState<InspirationPrompt[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePrompts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get 2 random curated prompts
      const curatedPrompts = getRandomPrompts(2);
      
      // Get recent entries for context
      const recentEntries = await listEntries();
      const last5Entries = recentEntries.slice(0, 5);

      // Generate context-aware prompt
      let contextPrompt: InspirationPrompt;
      
      if (last5Entries.length > 0) {
        try {
          const response = await fetch('/api/generate-context-prompt', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              recentEntries: last5Entries
            }),
          });

          if (response.ok) {
            const data = await response.json();
            contextPrompt = {
              text: data.prompt,
              isContextAware: data.isContextAware,
              type: 'context'
            };
          } else {
            // Handle quota exceeded or other API errors gracefully
            console.warn('Context prompt API failed, using fallback');
            contextPrompt = {
              text: "What's on your mind today?",
              isContextAware: false,
              type: 'context'
            };
          }
        } catch (contextError) {
          console.error('Context prompt error:', contextError);
          // Fallback to a general prompt
          contextPrompt = {
            text: "What's on your mind today?",
            isContextAware: false,
            type: 'context'
          };
        }
      } else {
        // No previous entries, use a general prompt
        contextPrompt = {
          text: "What's on your mind today?",
          isContextAware: false,
          type: 'context'
        };
      }

      // Combine all prompts
      const allPrompts: InspirationPrompt[] = [
        ...curatedPrompts.map(text => ({
          text,
          isContextAware: false,
          type: 'curated' as const
        })),
        contextPrompt
      ];

      setPrompts(allPrompts);
    } catch (error) {
      console.error('Error generating prompts:', error);
      setError('Failed to generate prompts. Please try again.');
      
      // Fallback to basic prompts
      setPrompts([
        { text: "How was your day?", isContextAware: false, type: 'curated' },
        { text: "What's on your mind?", isContextAware: false, type: 'curated' },
        { text: "What are you grateful for?", isContextAware: false, type: 'context' }
      ]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Generate initial prompts on mount
  useEffect(() => {
    generatePrompts();
  }, [generatePrompts]);

  return {
    prompts,
    isLoading,
    error,
    refreshPrompts: generatePrompts
  };
}
