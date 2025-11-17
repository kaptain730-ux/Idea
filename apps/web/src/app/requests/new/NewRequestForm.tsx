"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createRequest, type Location, type UserSummary } from "@/lib/requests";
import styles from "./new-request.module.css";

export type NewRequestFormProps = {
  locations: Location[];
  requesters: UserSummary[];
  currentUser?: UserSummary | null;
};

export function NewRequestForm({ locations, requesters, currentUser }: NewRequestFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    const preferredTime = form.get("preferredTime")?.toString();
    const estimatedCost = form.get("estimatedCost");

    startTransition(async () => {
      try {
        await createRequest({
          requesterId: (currentUser?.id ?? form.get("requesterId")?.toString()) ?? "",
          pickupLocationId: form.get("pickupLocationId")?.toString() ?? "",
          dropLocationId: form.get("dropLocationId")?.toString() ?? "",
          taskType: form.get("taskType")?.toString() ?? "",
          preferredTime: preferredTime || undefined,
          instructions: form.get("instructions")?.toString() || undefined,
          estimatedCost: estimatedCost ? Number(estimatedCost) : undefined
        });

        router.push("/requests");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {currentUser ? (
        <>
          <input type="hidden" name="requesterId" value={currentUser.id} />
          <div className={styles.fieldGroup}>
            <label>Requester</label>
            <div className={styles.pill}>{currentUser.name ?? currentUser.email}</div>
          </div>
        </>
      ) : (
        <div className={styles.fieldGroup}>
          <label htmlFor="requesterId">Requester</label>
          <select id="requesterId" name="requesterId" required defaultValue={requesters[0]?.id ?? ""}>
            {requesters.length === 0 && <option value="">No users available</option>}
            {requesters.map((requester) => (
              <option key={requester.id} value={requester.id}>
                {requester.name ?? requester.email ?? requester.id}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className={styles.fieldGroup}>
        <label htmlFor="taskType">Task type</label>
        <select id="taskType" name="taskType" required defaultValue="Parcel delivery">
          <option>Parcel delivery</option>
          <option>Document pickup</option>
          <option>Food pickup</option>
          <option>Stationery order</option>
          <option>Lost &amp; found</option>
        </select>
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="pickupLocationId">Pickup location</label>
        <select id="pickupLocationId" name="pickupLocationId" required>
          <option value="">Select</option>
          {locations.map((location) => (
            <option key={location.id} value={location.id}>
              {location.name}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="dropLocationId">Drop location</label>
        <select id="dropLocationId" name="dropLocationId" required>
          <option value="">Select</option>
          {locations.map((location) => (
            <option key={location.id} value={location.id}>
              {location.name}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.inlineFields}>
        <label>
          Preferred time
          <input type="datetime-local" name="preferredTime" />
        </label>
        <label>
          Est. cost (₹)
          <input type="number" name="estimatedCost" min="0" step="10" />
        </label>
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="instructions">Instructions</label>
        <textarea id="instructions" name="instructions" rows={4} placeholder="Anything the runner should know?" />
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.actions}>
        <button type="submit" disabled={isPending}>
          {isPending ? "Submitting…" : "Submit request"}
        </button>
      </div>

      <p className={styles.helper}>
        Need more demo users? Seed via <code>npm run db:seed</code> and refresh this page.
      </p>
    </form>
  );
}
