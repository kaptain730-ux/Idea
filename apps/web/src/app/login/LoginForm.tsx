"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";
import { useSession } from "@/components/SessionProvider";

export function LoginForm() {
  const router = useRouter();
  const { setUser } = useSession();
  const [contact, setContact] = useState("demo@campusdash.test");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"request" | "verify">("request");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewCode, setPreviewCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const requestOtp = async () => {
    setIsLoading(true);
    setError(null);
    setMessage(null);
    setPreviewCode(null);

    const response = await fetch("/api/auth/otp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contact })
    });

    const data = await response.json();

    if (response.ok) {
      setStep("verify");
      setMessage("OTP sent! Check your inbox or use the preview code in dev.");
      if (data.previewCode) {
        setPreviewCode(data.previewCode);
        setCode(data.previewCode);
      }
    } else {
      setError(data.message ?? "Failed to send OTP.");
    }

    setIsLoading(false);
  };

  const verifyOtp = async () => {
    setIsLoading(true);
    setError(null);

    const response = await fetch("/api/auth/otp/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contact, code })
    });

    const data = await response.json();

    if (response.ok) {
      if (data.user) {
        setUser(data.user);
      }
      setMessage("Logged in! Redirecting...");
      router.push("/");
    } else {
      setError(data.message ?? "Invalid code");
    }

    setIsLoading(false);
  };

  return (
    <div className={styles.formShell}>
      <div className={styles.formCard}>
        <div className={styles.stepper}>
          <span className={step === "request" ? styles.active : ""}>1. Request OTP</span>
          <span className={step === "verify" ? styles.active : ""}>2. Verify</span>
        </div>

        <label>
          Campus email
          <input
            type="email"
            value={contact}
            onChange={(event) => setContact(event.target.value)}
            disabled={step === "verify"}
            required
          />
        </label>

        {step === "verify" && (
          <label>
            Enter OTP
            <input
              type="text"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              maxLength={6}
              required
            />
          </label>
        )}

        {previewCode && <p className={styles.preview}>Preview code: {previewCode}</p>}
        {message && <p className={styles.message}>{message}</p>}
        {error && <p className={styles.error}>{error}</p>}

        {step === "request" ? (
          <button onClick={requestOtp} disabled={isLoading}>
            {isLoading ? "Sending..." : "Send OTP"}
          </button>
        ) : (
          <button onClick={verifyOtp} disabled={isLoading}>
            {isLoading ? "Verifying..." : "Verify & Continue"}
          </button>
        )}
      </div>
    </div>
  );
}
