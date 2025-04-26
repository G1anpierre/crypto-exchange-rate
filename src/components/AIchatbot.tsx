"use client"
import React from 'react'
import { useEffect } from 'react';
import '@n8n/chat/style.css';
import { createChat } from '@n8n/chat';

export const AIChatbot = () => {
  useEffect(() => {
    // 1. Get the webhook URL from environment variables
    const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;

    // 2. Validate if the URL exists and is not empty
    if (!webhookUrl) {
      console.error("Error: NEXT_PUBLIC_N8N_WEBHOOK_URL is not defined or empty. Chatbot cannot be initialized.");
      // Optionally, you could display a message to the user in the UI here
      return; // Stop execution if the URL is missing
    }

    // 3. (Optional) Basic URL format validation (can be more sophisticated)
    try {
        new URL(webhookUrl); // Check if it's a valid URL structure
    } catch (e) {
        console.error(`Error: Invalid URL format for NEXT_PUBLIC_N8N_WEBHOOK_URL: ${webhookUrl}`);
        return; // Stop execution if the URL format is invalid
    }

    // 4. If validation passes, create the chat
        createChat({
            webhookUrl: webhookUrl, // Use the validated variable
            target: '#n8n-chat',
            mode: 'window',
            chatInputKey: 'chatInput',
            chatSessionKey: 'sessionId',
            metadata: {},
            showWelcomeScreen: false,
            defaultLanguage: 'en',
            initialMessages: [
                'Hi there from CryptoCurrent!👋',
                'My name is Gianpierre. How can I assist you today?'
            ],
            i18n: {
                en: {
                    title: 'Crypto Current AI 🤖',
                    subtitle: "Start a chat. We're here to help you 24/7.",
                    footer: '',
                    getStarted: 'New Conversation',
                    inputPlaceholder: 'Type your question..',
                    closeButtonTooltip: 'Close the chat',
                },
            },
        });
    }, []); // Empty dependency array ensures this runs only once on mount

    return (<div id="n8n-chat"></div>);
}


