"use client"
import React from 'react'
import { useEffect } from 'react';
import '@n8n/chat/style.css';
import { createChat } from '@n8n/chat';

export const AIchatbot = () => {
  useEffect(() => {
		createChat({
			webhookUrl: process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL,
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
	}, []);

	return (<div id="n8n-chat"></div>);
}


