import { useMemo } from "react";
import { create } from "zustand";
import { type PropertyData } from "../types";
import { calculatePropertyData } from "../utils/calculations";
import { getDefaultMortgageData } from "../utils/defaults";

export type ScenarioId = string;

export interface Scenario {
    id: ScenarioId;
    name: string;
    createdAt: number;
    updatedAt: number;
    data: PropertyData;
}

interface ScenarioStore {
    // State
    scenarios: Map<ScenarioId, Scenario>;
    currentScenarioId: ScenarioId | null;
    comparisonMode: boolean;
    selectedScenarios: Set<ScenarioId>;

    // Computed/Derived (getters)
    getCurrentScenario: () => Scenario | null;
    getAllScenarios: () => Scenario[];

    // Actions
    createScenario: (name: string) => ScenarioId;
    deleteScenario: (id: ScenarioId) => void;
    updateScenario: (id: ScenarioId, updates: Partial<Scenario>) => void;
    updateScenarioData: (id: ScenarioId, data: Partial<PropertyData>) => void;
    setCurrentScenario: (id: ScenarioId) => void;
    setComparisonMode: (mode: boolean) => void;
    toggleScenarioSelection: (id: ScenarioId) => void;
    clearSelectedScenarios: () => void;
}

function generateId(): ScenarioId {
    return `scenario_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Initialize with default scenario
const createDefaultScenario = (): [ScenarioId, Scenario] => {
    const defaultId = generateId();
    const defaultScenario: Scenario = {
        id: defaultId,
        name: "My first property",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        data: getDefaultMortgageData(),
    };
    return [defaultId, defaultScenario];
};

export const useScenarioStore = create<ScenarioStore>((set, get) => {
    const [defaultId, defaultScenario] = createDefaultScenario();

    return {
        // Initial State
        scenarios: new Map([[defaultId, defaultScenario]]),
        currentScenarioId: defaultId,
        comparisonMode: false,
        selectedScenarios: new Set(),

        // Getters
        getCurrentScenario: () => {
            const { scenarios, currentScenarioId } = get();
            return currentScenarioId
                ? scenarios.get(currentScenarioId) || null
                : null;
        },

        getAllScenarios: () => {
            const { scenarios } = get();
            return Array.from(scenarios.values()).sort(
                (a, b) => a.createdAt - b.createdAt,
            );
        },

        // Actions
        createScenario: (name: string) => {
            const id = generateId();
            const newScenario: Scenario = {
                id,
                name,
                data: getDefaultMortgageData(),
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };

            set((state) => {
                const updated = new Map(state.scenarios);
                updated.set(id, newScenario);
                return { scenarios: updated };
            });

            return id;
        },

        deleteScenario: (id: ScenarioId) => {
            const { scenarios, currentScenarioId } = get();

            // Prevent deletion if only one scenario left
            if (scenarios.size <= 1) {
                return;
            }

            set((state) => {
                const next = new Map(state.scenarios);
                next.delete(id);

                // If deleting current scenario, switch selection
                let newCurrentId = state.currentScenarioId;
                if (currentScenarioId === id) {
                    const allScenarios = Array.from(
                        state.scenarios.values(),
                    ).sort((a, b) => a.createdAt - b.createdAt);
                    const currentIndex = allScenarios.findIndex(
                        (s) => s.id === id,
                    );

                    if (currentIndex > 0) {
                        newCurrentId = allScenarios[currentIndex - 1].id;
                    } else {
                        newCurrentId = allScenarios[1].id;
                    }
                }

                return { scenarios: next, currentScenarioId: newCurrentId };
            });
        },

        updateScenario: (id: ScenarioId, updates: Partial<Scenario>) => {
            set((state) => {
                const scenario = state.scenarios.get(id);
                if (!scenario) return state;

                const updated = new Map(state.scenarios);
                updated.set(id, {
                    ...scenario,
                    ...updates,
                    updatedAt: Date.now(),
                });

                return { scenarios: updated };
            });
        },

        updateScenarioData: (id: ScenarioId, data: Partial<PropertyData>) => {
            set((state) => {
                const scenario = state.scenarios.get(id);
                if (!scenario) return state;

                // Merge new data with existing data
                const mergedData = {
                    ...scenario.data,
                    ...data,
                };

                // Recalculate all mortgage values
                const calculatedData = calculatePropertyData(mergedData);

                const updated = new Map(state.scenarios);
                updated.set(id, {
                    ...scenario,
                    data: calculatedData,
                    updatedAt: Date.now(),
                });

                return { scenarios: updated };
            });
        },

        setCurrentScenario: (id: ScenarioId) => {
            const { scenarios } = get();
            if (scenarios.has(id)) {
                set({ currentScenarioId: id });
            }
        },

        setComparisonMode: (mode: boolean) => {
            set({ comparisonMode: mode });
        },

        toggleScenarioSelection: (id: ScenarioId) => {
            set((state) => {
                const next = new Set(state.selectedScenarios);
                if (next.has(id)) {
                    next.delete(id);
                } else {
                    next.add(id);
                }
                return { selectedScenarios: next };
            });
        },

        clearSelectedScenarios: () => {
            set({ selectedScenarios: new Set() });
        },
    };
});

// Convenience hook that mimics the old context API
export function useScenarios() {
    const store = useScenarioStore();

    return {
        scenarios: store.scenarios,
        currentScenarioId: store.currentScenarioId,
        currentScenario: store.getCurrentScenario(),
        comparisonMode: store.comparisonMode,
        selectedScenarios: store.selectedScenarios,
        createScenario: store.createScenario,
        deleteScenario: store.deleteScenario,
        updateScenario: store.updateScenario,
        updateScenarioData: store.updateScenarioData,
        setCurrentScenario: store.setCurrentScenario,
        getAllScenarios: store.getAllScenarios,
        setComparisonMode: store.setComparisonMode,
        toggleScenarioSelection: store.toggleScenarioSelection,
        clearSelectedScenarios: store.clearSelectedScenarios,
    };
}

// Optimized selector hooks for specific use cases
// Components can use these to only re-render when specific data changes

/**
 * Only subscribes to current scenario data - won't re-render when other scenarios change
 */
export function useCurrentScenario() {
    const scenario = useScenarioStore((state) => state.getCurrentScenario());
    const scenarioId = useScenarioStore((state) => state.currentScenarioId);
    return { scenario, scenarioId };
}

/**
 * Only subscribes to scenario actions - never re-renders
 */
export function useScenarioActions() {
    return {
        createScenario: useScenarioStore((state) => state.createScenario),
        deleteScenario: useScenarioStore((state) => state.deleteScenario),
        updateScenario: useScenarioStore((state) => state.updateScenario),
        updateScenarioData: useScenarioStore(
            (state) => state.updateScenarioData,
        ),
        setCurrentScenario: useScenarioStore(
            (state) => state.setCurrentScenario,
        ),
    };
}

/**
 * Only subscribes to comparison mode and selections
 */
export function useComparisonState() {
    const comparisonMode = useScenarioStore((state) => state.comparisonMode);
    const selectedScenarios = useScenarioStore(
        (state) => state.selectedScenarios,
    );
    return {
        comparisonMode,
        selectedScenarios,
        setComparisonMode: useScenarioStore((state) => state.setComparisonMode),
        toggleScenarioSelection: useScenarioStore(
            (state) => state.toggleScenarioSelection,
        ),
        clearSelectedScenarios: useScenarioStore(
            (state) => state.clearSelectedScenarios,
        ),
    };
}

/**
 * Only subscribes to all scenarios list - for scenario manager
 * Memoized to prevent infinite re-renders
 */
export function useAllScenarios() {
    const scenarios = useScenarioStore((state) => state.scenarios);
    return useMemo(
        () =>
            Array.from(scenarios.values()).sort(
                (a, b) => a.createdAt - b.createdAt,
            ),
        [scenarios],
    );
}
