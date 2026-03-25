'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

/**
 * Custom hook to manage real-time messages from Supabase.
 * Listens for new messages in the 'messages' table.
 */
export function useMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Initial fetch of messages
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
      } else {
        setMessages(data || []);
      }
      setIsLoading(false);
    };

    fetchMessages();

    // 2. Real-time subscription to the 'messages' table
    const channel = supabase
      .channel('realtime:messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) => [...prev, newMessage]);
        }
      )
      .subscribe();

    // 3. Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addMessage = async (role: 'user' | 'assistant', content: string) => {
    const { error } = await supabase.from('messages').insert([
      { role, content, created_at: new Date().toISOString() },
    ]);
    if (error) {
      console.error('Error adding message:', error);
    }
  };

  return { messages, isLoading, addMessage };
}
