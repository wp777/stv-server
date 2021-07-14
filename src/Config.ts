import * as Types from "stv-types";

export const UNLIMITED: number = -1;

export const Config: Types.config.Config = {
    maxExecutionTimeSeconds: 3,
    parameterizedModels: {
        bridgeEndplay: {
            min: {
                cardsInHand: 1,
                deckSize: 1,
            },
            max: {
                cardsInHand: 2,
                deckSize: 15,
            },
        },
        castles: {
            min: {
                castle1Size: 1,
                castle2Size: 1,
                castle3Size: 1,
                life: 1,
            },
            max: {
                castle1Size: 2,
                castle2Size: 2,
                castle3Size: 2,
                life: 2,
            },
        },
        drones: {
            min: {
                initialEnergy: 1,
                numberOfDrones: 1,
            },
            max: {
                initialEnergy: 3,
                numberOfDrones: 2,
            },
        },
        simpleVoting: {
            min: {
                candidates: 1,
                voters: 1,
            },
            max: {
                candidates: 3,
                voters: 2,
            },
        },
        tianJi: {
            min: {
                horses: 1,
            },
            max: {
                horses: 4,
            },
        },
    },
    fileModel: {
        maxFileSizeBytes: 256 * 1024,
        maxNumberOfAgentTypes: 100,
        maxNumberOfAgentsPerType: 100,
        maxNumberOfAgentsTotal: 100,
        maxNumberOfStates: 100,
        maxNumberOfTransitions: 100,
        maxCoalitionSize: 100,
        maxNumberOfPersistentVariables: 100,
        maxNumberOfReductionVariables: 100,
        maxNumberOfGoalVariables: 100,
    },
    mappingFile: {
        maxFileSizeBytes: 256 * 1024,
        maxNumberOfMappings: 100,
    },
};
