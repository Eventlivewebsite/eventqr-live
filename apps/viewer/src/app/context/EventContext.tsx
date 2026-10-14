"use client";

import React, { createContext, useContext, useEffect, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";

interface EventContextType {
  event: any | null;
  loading: boolean;
  error: string | null;
  refreshEvent: () => void;
}

const EventContext = createContext<EventContextType>({
  event: null,
  loading: true,
  error: null,
  refreshEvent: () => {}
});

export function EventProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const eventSlug = searchParams.get("event") || "";
  const [event, setEvent] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const fetchEventData = async () => {
    if (!eventSlug) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`/api/event-data?slug=${encodeURIComponent(eventSlug)}`);
      const data = await res.json();
      if (data.success && data.event) {
        startTransition(() => {
          setEvent(data.event);
        });
      } else {
        setError(data.error || "Event not found");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load event");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventData();
  }, [eventSlug]);

  return (
    <EventContext.Provider value={{ event, loading, error, refreshEvent: fetchEventData }}>
      {children}
    </EventContext.Provider>
  );
}

export const useCurrentEvent = () => useContext(EventContext);
