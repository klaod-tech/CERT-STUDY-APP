import { supabase } from "./supabase.js";

// ---------- categories ----------
export async function getCategories() {
  const { data, error } = await supabase.from("categories").select("*").order("created_at");
  if (error) throw error;
  return data;
}

export async function addCategory(name) {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("categories")
    .insert({ name, user_id: user.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ---------- notes ----------
export async function getNotes(categoryId) {
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("category_id", categoryId)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function saveNote(note) {
  const { data: { user } } = await supabase.auth.getUser();
  const payload = { ...note, user_id: user.id, updated_at: new Date().toISOString() };
  const { data, error } = await supabase.from("notes").upsert(payload).select().single();
  if (error) throw error;
  return data;
}

// ---------- concepts ----------
export async function getConcepts(categoryId) {
  const { data, error } = await supabase
    .from("concepts")
    .select("*")
    .eq("category_id", categoryId)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function saveConcept(concept) {
  const { data: { user } } = await supabase.auth.getUser();
  const payload = { ...concept, user_id: user.id, updated_at: new Date().toISOString() };
  const { data, error } = await supabase.from("concepts").upsert(payload).select().single();
  if (error) throw error;
  return data;
}

// ---------- quizzes ----------
export async function getQuizzes(categoryId) {
  const { data, error } = await supabase
    .from("quizzes")
    .select("*")
    .eq("category_id", categoryId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function saveQuiz(quiz) {
  const { data: { user } } = await supabase.auth.getUser();
  const payload = { ...quiz, user_id: user.id };
  const { data, error } = await supabase.from("quizzes").upsert(payload).select().single();
  if (error) throw error;
  return data;
}
