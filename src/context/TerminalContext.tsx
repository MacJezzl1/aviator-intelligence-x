"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { INITIAL_VERIFIED_ROUNDS } from "@/lib/data/sample-data";
import { type AviatorRoundRecord, type DataSourceType } from "@/lib/data/ingestion";
import { AGENT_REGISTRY, type AgentDefinition } from "@/lib/agents/registry";
import { generateExperimentalForecast, evaluateForecast, type ExperimentalForecast } from "@/lib/analytics/forecasting";
import { runCouncilDeliberation, type CouncilConsensusReport, type OrchestrationRunResult } from "@/lib/agents/orchestrator";
import { type UserRole } from "@/lib/auth/rbac";

export interface TerminalContextType {
  rounds: AviatorRoundRecord[];
  activeWindow: 20 | 50 | 100 | 250 | 500 | 1000 | "ALL";
  setActiveWindow: (w: 20 | 50 | 100 | 250 | 500 | 1000 | "ALL") => void;
  currentUserRole: UserRole;
  setCurrentUserRole: (r: UserRole) => void;
  agents: AgentDefinition[];
  toggleAgent: (id: string) => void;
  forecasts: ExperimentalForecast[];
  latestCouncilReport: CouncilConsensusReport | null;
  isOrchestrating: boolean;
  runCouncilTask: (question?: string) => Promise<OrchestrationRunResult>;
  addRound: (multiplier: number, sourceType?: DataSourceType) => void;
  importRounds: (newRounds: AviatorRoundRecord[]) => void;
  notifications: { id: string; title: string; message: string; type: "info" | "warn" | "error" | "success"; timestamp: string }[];
  dismissNotification: (id: string) => void;
}

const TerminalContext = createContext<TerminalContextType | null>(null);

export function TerminalProvider({ children }: { children: React.ReactNode }) {
  const [rounds, setRounds] = useState<AviatorRoundRecord[]>(INITIAL_VERIFIED_ROUNDS);
  const [activeWindow, setActiveWindow] = useState<20 | 50 | 100 | 250 | 500 | 1000 | "ALL">(50);
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>("OWNER");
  const [agents, setAgents] = useState<AgentDefinition[]>(AGENT_REGISTRY);
  const [forecasts, setForecasts] = useState<ExperimentalForecast[]>([]);
  const [latestCouncilReport, setLatestCouncilReport] = useState<CouncilConsensusReport | null>(null);
  const [isOrchestrating, setIsOrchestrating] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<TerminalContextType["notifications"]>([
    {
      id: "notif-init",
      title: "AIX Quantitative Terminal Initialized",
      message: "100 Logical Agents registered. Core mathematical & statistical engine ready.",
      type: "success",
      timestamp: new Date().toLocaleTimeString(),
    },
    {
      id: "notif-safety",
      title: "Responsible Analytics Disclosure",
      message: "Aviator operates via provably fair random mechanism. Mathematical memorylessness strictly enforced.",
      type: "info",
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);

  // Initial baseline forecast generation
  useEffect(() => {
    if (rounds.length >= 20 && forecasts.length === 0) {
      const history = rounds.map((r) => r.multiplier);
      const initialForecast = generateExperimentalForecast(history, rounds.length + 1);
      setForecasts([initialForecast]);
    }
  }, [rounds]);

  const toggleAgent = (id: string) => {
    setAgents((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isEnabled: !a.isEnabled } : a))
    );
  };

  const addRound = (multiplier: number, sourceType: DataSourceType = "manual_entry") => {
    const nextRoundNumber = (rounds[rounds.length - 1]?.roundNumber || 1000) + 1;
    const newRecord: AviatorRoundRecord = {
      id: `rnd-${nextRoundNumber}`,
      roundNumber: nextRoundNumber,
      multiplier,
      crashTime: new Date().toISOString(),
      sourceType,
      isProvablyFair: true,
    };

    // Update rounds
    setRounds((prev) => [...prev, newRecord]);

    // Evaluate pending forecasts
    setForecasts((prev) =>
      prev.map((f) => {
        if (f.evaluationStatus === "pending_outcome") {
          return evaluateForecast(f, multiplier);
        }
        return f;
      })
    );

    // Auto generate next experimental forecast
    const updatedHistory = [...rounds.map((r) => r.multiplier), multiplier];
    const nextFore = generateExperimentalForecast(updatedHistory, nextRoundNumber + 1);
    setForecasts((prev) => [nextFore, ...prev.slice(0, 49)]);

    // Emit notification
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: `Round #${nextRoundNumber} Ingested: ${multiplier.toFixed(2)}x`,
        message: `Attributed to ${sourceType.replace("_", " ").toUpperCase()}. Calibration updated.`,
        type: multiplier >= 10 ? "warn" : "info",
        timestamp: new Date().toLocaleTimeString(),
      },
      ...prev.slice(0, 19),
    ]);
  };

  const importRounds = (newRounds: AviatorRoundRecord[]) => {
    setRounds((prev) => {
      const existing = new Set(prev.map((r) => r.roundNumber));
      const filtered = newRounds.filter((r) => !existing.has(r.roundNumber));
      return [...prev, ...filtered].sort((a, b) => a.roundNumber - b.roundNumber);
    });

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: "Historical Dataset Ingested",
        message: `Successfully loaded ${newRounds.length} records. Recalibrating 100 agents.`,
        type: "success",
        timestamp: new Date().toLocaleTimeString(),
      },
      ...prev.slice(0, 19),
    ]);
  };

  const runCouncilTask = async (question?: string): Promise<OrchestrationRunResult> => {
    setIsOrchestrating(true);
    try {
      const history = rounds.map((r) => r.multiplier);
      const result = await runCouncilDeliberation({
        roundHistory: history,
        researchQuestion: question,
        targetRoundNumber: rounds.length + 1,
      });

      setLatestCouncilReport(result.councilReport);

      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          title: "Chief Council Report Published",
          message: result.councilReport.finalConclusion.slice(0, 80) + "...",
          type: "success",
          timestamp: new Date().toLocaleTimeString(),
        },
        ...prev.slice(0, 19),
      ]);

      return result;
    } finally {
      setIsOrchestrating(false);
    }
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <TerminalContext.Provider
      value={{
        rounds,
        activeWindow,
        setActiveWindow,
        currentUserRole,
        setCurrentUserRole,
        agents,
        toggleAgent,
        forecasts,
        latestCouncilReport,
        isOrchestrating,
        runCouncilTask,
        addRound,
        importRounds,
        notifications,
        dismissNotification,
      }}
    >
      {children}
    </TerminalContext.Provider>
  );
}

export function useTerminal() {
  const ctx = useContext(TerminalContext);
  if (!ctx) throw new Error("useTerminal must be used within a TerminalProvider");
  return ctx;
}
