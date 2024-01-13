import { Config, UNLIMITED } from "../Config";
import { DuplicatePropertyError } from "./DuplicatePropertyError";
import { FileValidator } from "./FileValidator";
import { MaxNumberExceededError } from "./MaxNumberExceededError";

interface AgentInfo {
    name: string;
    count: number;
}

interface TransitionInfo {
    name: string;
    shared: boolean;
    leftStateName: string;
    rightStateName: string;
    leftStateExtra: string;
    rightStateExtra: string;
}

interface ArrayPropertyInfo {
    name: string;
    values: string[];
}

export class FileModelValidator extends FileValidator {
    
    constructor(fileId: string, fileContent: string) {
        super(fileId, fileContent, Config.fileModel.maxFileSizeBytes);
    }
    
    validate(): void {
        super.validate();
        const lines = this.getSignificantLines();
        // this.validateMaxNumberOfAgentTypes(lines);
        // this.validateMaxNumberOfAgentsPerType(lines);
        // this.validateMaxNumberOfAgentsTotal(lines);
        // this.validateMaxNumberOfStates(lines);
        // this.validateMaxNumberOfTransitions(lines);
        // this.validateMaxCoalitionSize(lines);
        // this.validateMaxNumberOfPersistentVariables(lines);
        // this.validateMaxNumberOfReductionVariables(lines);
        // this.validateMaxNumberOfGoalVariables(lines);
    }
    
    private validateMaxNumberOfAgentTypes(lines: string[]): void {
        const maxNumberOfAgentTypes = Config.fileModel.maxNumberOfAgentTypes;
        let numberOfAgentTypes: number = 0;
        for (const line of lines) {
            const agentInfo = this.getAgentInfo(line);
            if (agentInfo) {
                numberOfAgentTypes++;
            }
        }
        if (numberOfAgentTypes > maxNumberOfAgentTypes) {
            throw new MaxNumberExceededError("numberOfAgentTypes", numberOfAgentTypes, maxNumberOfAgentTypes);
        }
    }
    
    private validateMaxNumberOfAgentsPerType(lines: string[]): void {
        const maxNumberOfAgentsPerType = Config.fileModel.maxNumberOfAgentsPerType;
        for (const line of lines) {
            const agentInfo = this.getAgentInfo(line);
            if (agentInfo && agentInfo.count > maxNumberOfAgentsPerType) {
                throw new MaxNumberExceededError("numberOfAgentsPerType", agentInfo.count, maxNumberOfAgentsPerType);
            }
        }
    }
    
    private validateMaxNumberOfAgentsTotal(lines: string[]): void {
        const maxNumberOfAgentsTotal = Config.fileModel.maxNumberOfAgentsTotal;
        let numberOfAgentsTotal: number = 0;
        for (const line of lines) {
            const agentInfo = this.getAgentInfo(line);
            if (agentInfo) {
                numberOfAgentsTotal += agentInfo.count;
            }
        }
        if (numberOfAgentsTotal > maxNumberOfAgentsTotal) {
            throw new MaxNumberExceededError("numberOfAgentsTotal", numberOfAgentsTotal, maxNumberOfAgentsTotal);
        }
    }
    
    private validateMaxNumberOfStates(lines: string[]): void {
        const states: { [stateName: string]: boolean } = {};
        const maxNumberOfStates = Config.fileModel.maxNumberOfStates;
        for (const line of lines) {
            const transitionInfo = this.getTransitionInfo(line);
            if (transitionInfo) {
                states[transitionInfo.leftStateName] = true;
                states[transitionInfo.rightStateName] = true;
            }
        }
        const numberOfStates: number = Object.keys(states).length;
        if (numberOfStates > maxNumberOfStates) {
            throw new MaxNumberExceededError("numberOfStates", numberOfStates, maxNumberOfStates);
        }
    }
    
    private validateMaxNumberOfTransitions(lines: string[]): void {
        const maxNumberOfTransitions = Config.fileModel.maxNumberOfTransitions;
        let numberOfTransitions: number = 0;
        for (const line of lines) {
            const transitionInfo = this.getTransitionInfo(line);
            if (transitionInfo) {
                numberOfTransitions++;
            }
        }
        if (numberOfTransitions > maxNumberOfTransitions) {
            throw new MaxNumberExceededError("numberOfTransitions", numberOfTransitions, maxNumberOfTransitions);
        }
    }
    
    private validateMaxCoalitionSize(lines: string[]): void {
        const maxCoalitionSize = Config.fileModel.maxCoalitionSize;
        let foundProperty: boolean = false;
        for (const line of lines) {
            const propertyInfo = this.getArrayPropertyInfo(line);
            if (propertyInfo && propertyInfo.name === "COALITION") {
                if (foundProperty) {
                    throw new DuplicatePropertyError("COALITION");
                }
                foundProperty = true;
                const coalitionSize = propertyInfo.values.length;
                if (coalitionSize > maxCoalitionSize) {
                    throw new MaxNumberExceededError("coalitionSize", coalitionSize, maxCoalitionSize);
                }
            }
        }
    }
    
    private validateMaxNumberOfPersistentVariables(lines: string[]): void {
        const maxNumberOfPersistentVariables = Config.fileModel.maxNumberOfPersistentVariables;
        let foundProperty: boolean = false;
        for (const line of lines) {
            const propertyInfo = this.getArrayPropertyInfo(line);
            if (propertyInfo && propertyInfo.name === "PERSISTENT") {
                if (foundProperty) {
                    throw new DuplicatePropertyError("PERSISTENT");
                }
                foundProperty = true;
                const numberOfPersistentVariables = propertyInfo.values.length;
                if (numberOfPersistentVariables > maxNumberOfPersistentVariables) {
                    throw new MaxNumberExceededError("numberOfPersistentVariables", numberOfPersistentVariables, maxNumberOfPersistentVariables);
                }
            }
        }
    }
    
    private validateMaxNumberOfReductionVariables(lines: string[]): void {
        const maxNumberOfReductionVariables = Config.fileModel.maxNumberOfReductionVariables;
        let foundProperty: boolean = false;
        for (const line of lines) {
            const propertyInfo = this.getArrayPropertyInfo(line);
            if (propertyInfo && propertyInfo.name === "REDUCTION") {
                if (foundProperty) {
                    throw new DuplicatePropertyError("REDUCTION");
                }
                foundProperty = true;
                const numberOfReductionVariables = propertyInfo.values.length;
                if (numberOfReductionVariables > maxNumberOfReductionVariables) {
                    throw new MaxNumberExceededError("numberOfReductionVariables", numberOfReductionVariables, maxNumberOfReductionVariables);
                }
            }
        }
    }
    
    private validateMaxNumberOfGoalVariables(lines: string[]): void {
        const maxNumberOfGoalVariables = Config.fileModel.maxNumberOfGoalVariables;
        let foundProperty: boolean = false;
        for (const line of lines) {
            const propertyInfo = this.getArrayPropertyInfo(line);
            if (propertyInfo && propertyInfo.name === "GOAL") {
                if (foundProperty) {
                    throw new DuplicatePropertyError("GOAL");
                }
                foundProperty = true;
                const numberOfGoalVariables = propertyInfo.values.length;
                if (numberOfGoalVariables > maxNumberOfGoalVariables) {
                    throw new MaxNumberExceededError("numberOfGoalVariables", numberOfGoalVariables, maxNumberOfGoalVariables);
                }
            }
        }
    }
    
    private getAgentInfo(line: string): AgentInfo | null {
        if (!line.startsWith("Agent ") || !line.endsWith(":")) {
            return null;
        }
        const agentData = line
            .substr(6, line.length - 8)
            .split("[")
            .map(part => part.trim());
        return {
            name: agentData[0],
            count: parseInt(agentData[1]),
        };
    }
    
    private getTransitionInfo(line: string): TransitionInfo | null {
        if (!line.includes("->")) {
            return null;
        }
        const [definitionStr, statesStr] = line.split(":").map(part => part.trim());
        const transitionShared = definitionStr.startsWith("shared");
        const transitionName = transitionShared ? definitionStr.substr("shared".length).trim() : definitionStr.trim();
        const [leftState, rightState] = statesStr.split("->").map(stateStr => stateStr.trim());
        const [leftStateName, leftStateExtra] = this.splitOnce(leftState, " ");
        const [rightStateName, rightStateExtra] = this.splitOnce(rightState, " ");
        return {
            name: transitionName,
            shared: transitionShared,
            leftStateName: leftStateName,
            leftStateExtra: leftStateExtra,
            rightStateName: rightStateName,
            rightStateExtra: rightStateExtra,
        };
    }
    
    private getArrayPropertyInfo(line: string): ArrayPropertyInfo | null {
        const propertyNames = ["COALITION", "GOAL", "PERSISTENT", "REDUCTION"];
        let propertyName: string | null = null;
        for (const candidatePropertyName of propertyNames) {
            if (line.startsWith(`${candidatePropertyName}:`)) {
                propertyName = candidatePropertyName;
                break;
            }
        }
        if (propertyName === null || !line.endsWith("]")) {
            return null;
        }
        const values = line
            .substr(propertyName.length, line.length - propertyName.length - 1)
            .split("[")[1]
            .split(",")
            .map(part => part.trim());
        return {
            name: propertyName,
            values: values,
        };
    }
    
    private splitOnce(str: string, separator: string): [string, string] {
        const parts = str.split(separator);
        const left = parts[0];
        const right = parts.length >= 2 ? parts.slice(1).join(separator) : "";
        return [left, right];
    }
    
}
