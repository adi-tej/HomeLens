import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

export type ScenarioId = string;

export interface Scenario {
  id: ScenarioId;
  name: string;
  createdAt: number;
  updatedAt: number;
  // Mortgage calculation data
  data?: {
    propertyValue?: number;
    deposit?: number;
    firstHomeBuyer: boolean;
    occupancy: string;
    propertyType: string;
  };
}

interface ScenarioContextType {
  scenarios: Map<ScenarioId, Scenario>;
  currentScenarioId: ScenarioId | null;
  currentScenario: Scenario | null;
  createScenario: (name: string) => ScenarioId;
  deleteScenario: (id: ScenarioId) => void;
  updateScenario: (id: ScenarioId, updates: Partial<Scenario>) => void;
  setCurrentScenario: (id: ScenarioId) => void;
  getAllScenarios: () => Scenario[];
}

const ScenarioContext = createContext<ScenarioContextType | undefined>(
  undefined,
);

function generateId(): ScenarioId {
  return `scenario_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function ScenarioProvider({ children }: { children: ReactNode }) {
  const [scenarios, setScenarios] = useState<Map<ScenarioId, Scenario>>(() => {
    // Initialize with default scenario
    const defaultId = generateId();
    const defaultScenario: Scenario = {
      id: defaultId,
      name: "My first property",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    return new Map([[defaultId, defaultScenario]]);
  });

  const [currentScenarioId, setCurrentScenarioId] = useState<ScenarioId | null>(
    () => {
      // Set first scenario as current
      return Array.from(scenarios.keys())[0] || null;
    },
  );

  const createScenario = useCallback((name: string): ScenarioId => {
    const id = generateId();
    const newScenario: Scenario = {
      id,
      name,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setScenarios((prev) => {
      const next = new Map(prev);
      next.set(id, newScenario);
      return next;
    });

    // Automatically set as current scenario
    setCurrentScenarioId(id);

    return id;
  }, []);

  const deleteScenario = useCallback(
    (id: ScenarioId) => {
      // Prevent deletion if only one scenario left
      if (scenarios.size <= 1) {
        return;
      }

      // If deleting current scenario, switch selection
      if (currentScenarioId === id) {
        const allScenarios = Array.from(scenarios.values()).sort(
          (a, b) => a.createdAt - b.createdAt,
        );
        const currentIndex = allScenarios.findIndex((s) => s.id === id);

        if (currentIndex > 0) {
          // Select the one above (previous in list)
          setCurrentScenarioId(allScenarios[currentIndex - 1].id);
        } else {
          // If nothing above (first item), select the one below
          setCurrentScenarioId(allScenarios[1].id);
        }
      }

      setScenarios((prev) => {
        const next = new Map(prev);
        next.delete(id);
        return next;
      });
    },
    [scenarios, currentScenarioId],
  );

  const updateScenario = useCallback(
    (id: ScenarioId, updates: Partial<Scenario>) => {
      setScenarios((prev) => {
        const scenario = prev.get(id);
        if (!scenario) return prev;

        const next = new Map(prev);
        next.set(id, {
          ...scenario,
          ...updates,
          updatedAt: Date.now(),
        });
        return next;
      });
    },
    [],
  );

  const setCurrentScenario = useCallback(
    (id: ScenarioId) => {
      if (scenarios.has(id)) {
        setCurrentScenarioId(id);
      }
    },
    [scenarios],
  );

  const getAllScenarios = useCallback((): Scenario[] => {
    return Array.from(scenarios.values()).sort(
      (a, b) => a.createdAt - b.createdAt,
    );
  }, [scenarios]);

  const currentScenario = currentScenarioId
    ? scenarios.get(currentScenarioId) || null
    : null;

  const value: ScenarioContextType = {
    scenarios,
    currentScenarioId,
    currentScenario,
    createScenario,
    deleteScenario,
    updateScenario,
    setCurrentScenario,
    getAllScenarios,
  };

  return (
    <ScenarioContext.Provider value={value}>
      {children}
    </ScenarioContext.Provider>
  );
}

export function useScenarios() {
  const context = useContext(ScenarioContext);
  if (!context) {
    throw new Error("useScenarios must be used within ScenarioProvider");
  }
  return context;
}
