"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { INITIAL_VERIFIED_ROUNDS } from "@/lib/data/sample-data";
import { type AviatorRoundRecord, type DataSourceType, type AviatorOperator } from "@/lib/data/ingestion";
import { AGENT_REGISTRY, type AgentDefinition } from "@/lib/agents/registry";
import { generateExperimentalForecast, evaluateForecast, type ExperimentalForecast } from "@/lib/analytics/forecasting";
import { runCouncilDeliberation, type CouncilConsensusReport, type OrchestrationRunResult } from "@/lib/agents/orchestrator";
import { type UserRole } from "@/lib/auth/rbac";

export interface TerminalContextType {
  rounds: AviatorRoundRecord[];
  activeOperatorRounds: AviatorRoundRecord[];
  selectedOperator: "ALL" | AviatorOperator;
  setSelectedOperator: (op: "ALL" | AviatorOperator) => void;
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
  addRound: (multiplier: number, sourceType?: DataSourceType, operator?: AviatorOperator) => void;
  importRounds: (newRounds: AviatorRoundRecord[]) => void;
  notifications: { id: string; title: string; message: string; type: "info" | "warn" | "error" | "success"; timestamp: string }[];
  dismissNotification: (id: string) => void;
}

const TerminalContext = createContext<TerminalContextType | null>(null);

export function TerminalProvider({ children }: { children: React.ReactNode }) {
  const [rounds, setRounds] = useState<AviatorRoundRecord[]>(INITIAL_VERIFIED_ROUNDS);
  const [selectedOperator, setSelectedOperator] = useState<"ALL" | AviatorOperator>("ALL");
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
      message: "100 Logical Agents registered. Multi-operator intelligence feeds active.",
      type: "success",
      timestamp: new Date().toLocaleTimeString(),
    },
    {
      id: "notif-safety",
      title: "Responsible Analytics Disclosure",
      message: "Hollywoodbets and Betway Aviator use certified Spribe Provably Fair random seeds. Memoryless mechanics enforced.",
      type: "info",
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);

  // Operator-filtered rounds
  const activeOperatorRounds = useMemo(() => {
    if (selectedOperator === "ALL") return rounds;
    return rounds.filter((r) => r.operator === selectedOperator);
  }, [rounds, selectedOperator]);

  // Initial baseline forecast generation
  useEffect(() => {
    const history = activeOperatorRounds.map((r) => r.multiplier);
    if (history.length >= 20) {
      const initialForecast = generateExperimentalForecast(history, activeOperatorRounds.length + 1);
      setForecasts([initialForecast]);
    }
  }, [selectedOperator, activeOperatorRounds.length]);

  const toggleAgent = (id: string) => {
    setAgents((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isEnabled: !a.isEnabled } : a))
    );
  };

  const addRound = (
    multiplier: number,
    sourceType: DataSourceType = "manual_entry",
    operator?: AviatorOperator
  ) => {
    const effectiveOp = operator || (selectedOperator !== "ALL" ? selectedOperator : "spribe_universal");
    const nextRoundNumber = (rounds[rounds.length - 1]?.roundNumber || 1000) + 1;
    const newRecord: AviatorRoundRecord = {
      id: `rnd-${nextRoundNumber}`,
      roundNumber: nextRoundNumber,
      multiplier,
      crashTime: new Date().toISOString(),
      sourceType,
      operator: effectiveOp,
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
    const updatedHistory = [...activeOperatorRounds.map((r) => r.multiplier), multiplier];
    const nextFore = generateExperimentalForecast(updatedHistory, nextRoundNumber + 1);
    setForecasts((prev) => [nextFore, ...prev.slice(0, 49)]);

    // Emit notification
    const opLabel = effectiveOp === "hollywoodbets" ? "Hollywoodbets" : effectiveOp === "betway" ? "Betway" : "Spribe";
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: `[${opLabel}] Round #${nextRoundNumber}: ${multiplier.toFixed(2)}x`,
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
      const opName = selectedOperator === "hollywoodbets" ? "Hollywoodbets" : selectedOperator === "betway" ? "Betway" : "Spribe Cross-Operator";
      const history = activeOperatorRounds.map((r) => r.multiplier);
      const defaultQ = `Evaluate whether the ${opName} Aviator multiplier sequence deviates from theoretical Spribe provably fair parameters (97% RTP), and calculate calibrated experimental forecast bounds for round #${activeOperatorRounds.length + 1}.`;

      const result = await runCouncilDeliberation({
        roundHistory: history,
        researchQuestion: question || defaultQ,
        targetRoundNumber: activeOperatorRounds.length + 1,
      });

      setLatestCouncilReport(result.councilReport);

      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          title: `Chief Council Verdict: ${opName}`,
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
        activeOperatorRounds,
        selectedOperator,
        setSelectedOperator,
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
