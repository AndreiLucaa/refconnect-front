import { useState } from 'react';

export function useAIModeration() {
    const [isChecking, setIsChecking] = useState(false);

    // Mock moderation check
    const checkContent = async (text: string): Promise<{ safe: boolean; reason?: string }> => {
        setIsChecking(true);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
        setIsChecking(false);

        const lowerText = text.toLowerCase();
        const forbiddenWords = ['hate', 'violence', 'abuse', 'spam'];

        const foundWord = forbiddenWords.find(word => lowerText.includes(word));

        if (foundWord) {
            return { safe: false, reason: `Content contains inappropriate language: "${foundWord}"` };
        }

        return { safe: true };
    };

    return { checkContent, isChecking };
}
