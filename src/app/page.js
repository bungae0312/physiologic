"use client";

import { useEffect, useState } from "react";
import LandingPage from "@/components/LandingPage";
import LoginScreen from "@/components/LoginScreen";
import Dashboard from "@/components/Dashboard";
import { getSession, onAuthStateChange, getProfile, signOut } from "@/lib/storage";

export default function Home() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [ready, setReady] = useState(false);
  const [authView, setAuthView] = useState("landing"); // 'landing' | 'login' | 'signup'

  useEffect(() => {
    let mounted = true;

    async function loadProfile(sess) {
      if (!sess) {
        if (mounted) setProfile(null);
        return;
      }
      try {
        const p = await getProfile(sess.user.id);
        if (mounted) setProfile(p);
      } catch {
        // 프로필 row가 아직 생성되기 전(트리거 지연)일 수 있어 최소 정보로 대체
        if (mounted) setProfile({ id: sess.user.id, name: sess.user.email, gym: "", phone: "" });
      }
    }

    getSession().then((sess) => {
      if (!mounted) return;
      setSession(sess);
      loadProfile(sess).finally(() => mounted && setReady(true));
    });

    const subscription = onAuthStateChange((sess) => {
      setSession(sess);
      loadProfile(sess);
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await signOut();
    setSession(null);
    setProfile(null);
    setAuthView("landing");
  };

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500/30 border-t-brand-600" />
      </div>
    );
  }

  if (session) {
    return (
      <Dashboard
        userId={session.user.id}
        email={session.user.email}
        profile={profile}
        onProfileChange={setProfile}
        onLogout={handleLogout}
      />
    );
  }

  if (authView === "landing") {
    return (
      <LandingPage
        onGetStarted={() => setAuthView("signup")}
        onLogin={() => setAuthView("login")}
      />
    );
  }

  return (
    <LoginScreen initialTab={authView} onBack={() => setAuthView("landing")} />
  );
}
