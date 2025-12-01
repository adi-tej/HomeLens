import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Scenario, ScenarioId } from "@state/useScenarioStore";
import { useScenarioStore } from "@state/useScenarioStore";

// Storage constants
const SCENARIO_STORAGE_KEY = "scenario_store_v1";
const SCENARIO_STORE_VERSION = 1;
const DEBOUNCE_MS = 500;

let persistTimer: ReturnType<typeof setTimeout> | null = null;
let persistenceSubscribed = false; // module-level guard

interface PersistedScenarioStore {
    version: number;
    scenarios: Scenario[];
    currentScenarioId: ScenarioId | null;
    comparisonMode: boolean;
    selectedScenarios: ScenarioId[];
}

function serializeScenarioState(): PersistedScenarioStore {
    const state = useScenarioStore.getState();
    return {
        version: SCENARIO_STORE_VERSION,
        scenarios: Array.from(state.scenarios.values()),
        currentScenarioId: state.currentScenarioId,
        comparisonMode: state.comparisonMode,
        selectedScenarios: Array.from(state.selectedScenarios.values()),
    };
}

function deserializeScenarioState(data: PersistedScenarioStore) {
    const scenariosMap = new Map<ScenarioId, Scenario>();
    data.scenarios.forEach((s) => scenariosMap.set(s.id, s));
    const scenariosArray = Array.from(scenariosMap.values()).sort(
        (a, b) => a.createdAt - b.createdAt,
    );
    const selectedSet = new Set<ScenarioId>(data.selectedScenarios);
    return { scenariosMap, scenariosArray, selectedSet };
}

export async function hydrateScenarios(): Promise<void> {
    try {
        const raw = await AsyncStorage.getItem(SCENARIO_STORAGE_KEY);
        if (!raw) {
            useScenarioStore.setState({ hydrated: true });
            return;
        }
        let parsed: PersistedScenarioStore | null = null;
        try {
            parsed = JSON.parse(raw);
        } catch (e) {
            console.warn("[ScenarioPersistence] Corrupted JSON, clearing", e);
            await AsyncStorage.removeItem(SCENARIO_STORAGE_KEY);
            useScenarioStore.setState({ hydrated: true });
            return;
        }
        if (!parsed || parsed.version !== SCENARIO_STORE_VERSION) {
            console.log(
                "[ScenarioPersistence] Version mismatch or invalid; ignoring stored data",
            );
            useScenarioStore.setState({ hydrated: true });
            return;
        }
        const { scenariosMap, scenariosArray, selectedSet } =
            deserializeScenarioState(parsed);
        if (scenariosArray.length === 0) {
            console.warn(
                "[ScenarioPersistence] Empty scenarios, leaving default in place",
            );
            useScenarioStore.setState({ hydrated: true });
            return;
        }
        console.log(
            `[ScenarioPersistence] Restoring ${scenariosArray.length} scenario(s):`,
            scenariosArray.map((s) => s.name),
        );
        console.log(
            `[ScenarioPersistence] First scenario deposit:`,
            scenariosArray[0]?.data?.deposit,
        );
        console.log(
            `[ScenarioPersistence] First scenario propertyValue:`,
            scenariosArray[0]?.data?.propertyValue,
        );
        useScenarioStore.setState({
            scenarios: scenariosMap,
            scenariosArray,
            currentScenarioId:
                parsed.currentScenarioId &&
                scenariosMap.has(parsed.currentScenarioId)
                    ? parsed.currentScenarioId
                    : scenariosArray[0].id,
            comparisonMode: parsed.comparisonMode,
            selectedScenarios: selectedSet,
            hydrated: true,
        });
        console.log(
            `[ScenarioPersistence] ✓ Hydrated ${scenariosArray.length} scenario(s) successfully`,
        );
    } catch (e) {
        console.warn("[ScenarioPersistence] Hydration failed", e);
        useScenarioStore.setState({ hydrated: true });
    }
}

async function persistScenarioState() {
    try {
        const payload = serializeScenarioState();
        await AsyncStorage.setItem(
            SCENARIO_STORAGE_KEY,
            JSON.stringify(payload),
        );
    } catch (e) {
        console.warn("[ScenarioPersistence] Persist failed", e);
    }
}

export function setupScenarioPersistence() {
    if (persistenceSubscribed) {
        console.log(
            "[ScenarioPersistence] Persistence already set up, skipping",
        );
        return;
    }
    persistenceSubscribed = true;
    console.log("[ScenarioPersistence] Setting up auto-persist subscription");
    useScenarioStore.subscribe((state) => {
        if (!state.hydrated) {
            console.log(
                "[ScenarioPersistence] Store not yet hydrated, skipping persist",
            );
            return;
        }
        if (persistTimer) clearTimeout(persistTimer);
        persistTimer = setTimeout(
            () => void persistScenarioState(),
            DEBOUNCE_MS,
        );
    });
}

export async function clearScenarioPersistence() {
    await AsyncStorage.removeItem(SCENARIO_STORAGE_KEY);
}

export const ScenarioPersistence = {
    hydrateScenarios,
    setupScenarioPersistence,
    clearScenarioPersistence,
};
