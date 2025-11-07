import React, {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useState,
} from "react";
import { type PropertyData } from "../utils/mortgageCalculator";
import { calculateMortgageData } from "../hooks/useMortgageCalculations";
import { getDefaultMortgageData } from "../utils/mortgageDefaults";

export type ScenarioId = string;

export interface Scenario {
    id: ScenarioId;
    name: string;
    createdAt: number;
    updatedAt: number;
    // Mortgage calculation data
    data: PropertyData;
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
    comparisonMode: boolean;
    selectedScenarios: Set<ScenarioId>;
    updateScenarioData: (id: ScenarioId, data: Partial<PropertyData>) => void;
    setComparisonMode: (mode: boolean) => void;
    toggleScenarioSelection: (id: ScenarioId) => void;
    clearSelectedScenarios: () => void;
}

const ScenarioContext = createContext<ScenarioContextType | undefined>(
    undefined,
);

function generateId(): ScenarioId {
    return `scenario_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function ScenarioProvider({ children }: { children: ReactNode }) {
    const [scenarios, setScenarios] = useState<Map<ScenarioId, Scenario>>(
        () => {
            // Initialize with default scenario
            const defaultId = generateId();
            const defaultScenario: Scenario = {
                id: defaultId,
                name: "My first property",
                createdAt: Date.now(),
                updatedAt: Date.now(),
                data: getDefaultMortgageData(),
            };
            return new Map([[defaultId, defaultScenario]]);
        },
    );

    const [currentScenarioId, setCurrentScenarioId] =
        useState<ScenarioId | null>(() => {
            // Set first scenario as current
            return Array.from(scenarios.keys())[0] || null;
        });

    const [comparisonMode, setComparisonMode] = useState(false);
    const [selectedScenarios, setSelectedScenarios] = useState<Set<ScenarioId>>(
        new Set(),
    );

    const toggleScenarioSelection = useCallback((id: ScenarioId) => {
        setSelectedScenarios((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    const clearSelectedScenarios = useCallback(() => {
        setSelectedScenarios(new Set());
    }, []);

    const createScenario = useCallback((name: string): ScenarioId => {
        const id = generateId();
        const newScenario: Scenario = {
            id,
            name,
            data: getDefaultMortgageData(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };

        setScenarios((prev) => {
            const updated = new Map(prev);
            updated.set(id, newScenario);
            return updated;
        });

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

    const updateScenarioData = useCallback(
        (id: ScenarioId, data: Partial<PropertyData>) => {
            setScenarios((prev) => {
                const scenario = prev.get(id);
                if (!scenario) return prev;

                // Merge new data with existing data
                const mergedData = {
                    ...scenario.data,
                    ...data,
                };

                // Recalculate all mortgage values
                const calculatedData = calculateMortgageData(mergedData);

                const next = new Map(prev);
                next.set(id, {
                    ...scenario,
                    data: calculatedData,
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
        updateScenarioData,
        setCurrentScenario,
        getAllScenarios,
        comparisonMode,
        selectedScenarios,
        setComparisonMode,
        toggleScenarioSelection,
        clearSelectedScenarios,
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
