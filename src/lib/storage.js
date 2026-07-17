// Supabase 기반 데이터 레이어.
// 트레이너별 데이터는 모두 Supabase Postgres에 저장되고, RLS 정책으로
// 각 트레이너는 자신의 행(trainer_id = auth.uid())만 읽고 쓸 수 있습니다.
import { supabase } from "./supabaseClient";

const THEME_KEY = "fitcrm.theme";

/* ------------------------------- Theme (기기별 UI 설정, localStorage 유지) ------------------------------- */

const isBrowser = () => typeof window !== "undefined";

export function getStoredTheme() {
  if (!isBrowser()) return null;
  return localStorage.getItem(THEME_KEY);
}

export function saveTheme(theme) {
  if (!isBrowser()) return;
  localStorage.setItem(THEME_KEY, theme);
}

/* ------------------------------- Auth ------------------------------- */

export async function signUp({ email, password, name, gym, phone }) {
  return supabase.auth.signUp({
    email,
    password,
    options: { data: { name, gym: gym || "", phone: phone || "" } },
  });
}

export async function signIn({ email, password }) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export function onAuthStateChange(callback) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session));
  return data.subscription;
}

/* ------------------------------- Profile ------------------------------- */

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data;
}

export async function updateProfile(userId, fields) {
  const { data, error } = await supabase
    .from("profiles")
    .update(fields)
    .eq("id", userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/* ------------------------------- Members ------------------------------- */

export async function listMembers(trainerId) {
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .eq("trainer_id", trainerId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function createMember(trainerId, member) {
  const { data, error } = await supabase
    .from("members")
    .insert({ ...member, trainer_id: trainerId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateMember(memberId, fields) {
  const { data, error } = await supabase
    .from("members")
    .update(fields)
    .eq("id", memberId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteMember(memberId) {
  const { error } = await supabase.from("members").delete().eq("id", memberId);
  if (error) throw error;
}

/* ------------------------------- Body records ------------------------------- */

export async function listBodyRecords(memberId) {
  const { data, error } = await supabase
    .from("body_records")
    .select("*")
    .eq("member_id", memberId)
    .order("date", { ascending: true });
  if (error) throw error;
  return data;
}

export async function addBodyRecord(trainerId, memberId, record) {
  const { data, error } = await supabase
    .from("body_records")
    .insert({ ...record, member_id: memberId, trainer_id: trainerId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteBodyRecord(id) {
  const { error } = await supabase.from("body_records").delete().eq("id", id);
  if (error) throw error;
}

/* ------------------------------- PT sessions ------------------------------- */

export async function listSessions(memberId) {
  const { data, error } = await supabase
    .from("pt_sessions")
    .select("*")
    .eq("member_id", memberId)
    .order("date", { ascending: true });
  if (error) throw error;
  return data;
}

export async function addSession(trainerId, memberId, session) {
  const { data, error } = await supabase
    .from("pt_sessions")
    .insert({ ...session, member_id: memberId, trainer_id: trainerId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteSession(id) {
  const { error } = await supabase.from("pt_sessions").delete().eq("id", id);
  if (error) throw error;
}

// 회원 목록 카드에 PT 잔여횟수를 표시하기 위해, 회원별 세션 수를 한 번의 쿼리로 집계합니다.
export async function getSessionCountsByTrainer(trainerId) {
  const { data, error } = await supabase
    .from("pt_sessions")
    .select("member_id")
    .eq("trainer_id", trainerId);
  if (error) throw error;
  const counts = {};
  for (const row of data) {
    counts[row.member_id] = (counts[row.member_id] || 0) + 1;
  }
  return counts;
}

/* ------------------------------- Schedules ------------------------------- */

export async function listSchedules(trainerId) {
  const { data, error } = await supabase
    .from("schedules")
    .select("*")
    .eq("trainer_id", trainerId)
    .order("date", { ascending: true });
  if (error) throw error;
  return data;
}

export async function createSchedule(trainerId, schedule) {
  const { data, error } = await supabase
    .from("schedules")
    .insert({ ...schedule, trainer_id: trainerId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateSchedule(id, fields) {
  const { data, error } = await supabase
    .from("schedules")
    .update(fields)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteSchedule(id) {
  const { error } = await supabase.from("schedules").delete().eq("id", id);
  if (error) throw error;
}

/* ------------------------------- Payments ------------------------------- */

export async function listPayments(trainerId) {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("trainer_id", trainerId)
    .order("date", { ascending: false });
  if (error) throw error;
  return data;
}

export async function createPayment(trainerId, payment) {
  const { data, error } = await supabase
    .from("payments")
    .insert({ ...payment, trainer_id: trainerId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deletePayment(id) {
  const { error } = await supabase.from("payments").delete().eq("id", id);
  if (error) throw error;
}
