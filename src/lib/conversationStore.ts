import { supabase } from "@/integrations/supabase/client";

export type ChatMessage = { role: "user" | "assistant"; content: string };

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export async function loadConversations(): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from("conversations")
    .select("id, title, created_at, updated_at")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createConversation(title: string, userId: string): Promise<string> {
  const { data, error } = await supabase
    .from("conversations")
    .insert({ title, user_id: userId })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function updateConversationTitle(id: string, title: string) {
  await supabase.from("conversations").update({ title, updated_at: new Date().toISOString() }).eq("id", id);
}

export async function deleteConversation(id: string) {
  const { error } = await supabase.from("conversations").delete().eq("id", id);
  if (error) throw error;
}

export async function loadMessages(conversationId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("role, content")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as ChatMessage[];
}

export async function saveMessage(conversationId: string, role: string, content: string) {
  const { error } = await supabase
    .from("messages")
    .insert({ conversation_id: conversationId, role, content });
  if (error) throw error;
  // Touch the conversation updated_at
  await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", conversationId);
}
