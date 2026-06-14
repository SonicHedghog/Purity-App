import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { createId, normalizeOrder, movePartner as movePartnerPure } from '../lib/partners';
import { syncReminders } from '../lib/notifications';
import { defaultState, loadState, saveState } from '../storage/storage';
import type { AccountabilityPartner, AppSettings, PersistedState, Reminder } from '../types';

type PartnerInput = Pick<AccountabilityPartner, 'name' | 'phoneNumber'>;
type ReminderInput = Pick<Reminder, 'hour' | 'minute' | 'label'>;

type AppStateContextValue = {
  hydrated: boolean;
  partners: AccountabilityPartner[];
  reminders: Reminder[];
  settings: AppSettings;
  addPartner: (input: PartnerInput) => void;
  updatePartner: (id: string, input: PartnerInput) => void;
  removePartner: (id: string) => void;
  reorderPartner: (id: string, direction: 'up' | 'down') => void;
  addReminder: (input: ReminderInput) => void;
  updateReminder: (id: string, input: Partial<ReminderInput>) => void;
  toggleReminder: (id: string) => void;
  removeReminder: (id: string) => void;
  setPracticeMessage: (message: string) => void;
  setLearnUrl: (url: string) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
};

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PersistedState>(defaultState);
  const [hydrated, setHydrated] = useState(false);
  const lastReminders = useRef<Reminder[]>([]);

  useEffect(() => {
    let active = true;
    loadState().then((loaded) => {
      if (!active) return;
      setState(loaded);
      setHydrated(true);
      lastReminders.current = loaded.reminders;
      void syncReminders(loaded.reminders);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    void saveState(state);
  }, [state, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (lastReminders.current === state.reminders) return;
    lastReminders.current = state.reminders;
    void syncReminders(state.reminders);
  }, [state.reminders, hydrated]);

  const value = useMemo<AppStateContextValue>(() => {
    const updatePartners = (
      updater: (partners: AccountabilityPartner[]) => AccountabilityPartner[]
    ) => setState((prev) => ({ ...prev, partners: updater(prev.partners) }));

    const updateReminders = (updater: (reminders: Reminder[]) => Reminder[]) =>
      setState((prev) => ({ ...prev, reminders: updater(prev.reminders) }));

    return {
      hydrated,
      partners: state.partners,
      reminders: state.reminders,
      settings: state.settings,

      addPartner: ({ name, phoneNumber }) =>
        updatePartners((partners) =>
          normalizeOrder([
            ...partners,
            {
              id: createId(),
              name: name.trim(),
              phoneNumber: phoneNumber.trim(),
              order: partners.length,
              createdAt: Date.now(),
            },
          ])
        ),

      updatePartner: (id, { name, phoneNumber }) =>
        updatePartners((partners) =>
          partners.map((p) =>
            p.id === id ? { ...p, name: name.trim(), phoneNumber: phoneNumber.trim() } : p
          )
        ),

      removePartner: (id) =>
        updatePartners((partners) => normalizeOrder(partners.filter((p) => p.id !== id))),

      reorderPartner: (id, direction) =>
        updatePartners((partners) => movePartnerPure(partners, id, direction)),

      addReminder: ({ hour, minute, label }) =>
        updateReminders((reminders) => [
          ...reminders,
          { id: createId(), hour, minute, label: label.trim(), enabled: true },
        ]),

      updateReminder: (id, input) =>
        updateReminders((reminders) =>
          reminders.map((r) => (r.id === id ? { ...r, ...input } : r))
        ),

      toggleReminder: (id) =>
        updateReminders((reminders) =>
          reminders.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
        ),

      removeReminder: (id) =>
        updateReminders((reminders) => reminders.filter((r) => r.id !== id)),

      setPracticeMessage: (message) =>
        setState((prev) => ({
          ...prev,
          settings: { ...prev.settings, practiceMessage: message },
        })),

      setLearnUrl: (url) =>
        setState((prev) => ({
          ...prev,
          settings: { ...prev.settings, learnUrl: url.trim() },
        })),

      completeOnboarding: () =>
        setState((prev) => ({
          ...prev,
          settings: { ...prev.settings, onboarded: true },
        })),

      resetOnboarding: () =>
        setState((prev) => ({
          ...prev,
          settings: { ...prev.settings, onboarded: false },
        })),
    };
  }, [state, hydrated]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppStateContextValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return ctx;
}
