import { PythonShell } from "python-shell";
import * as Types from "stv-types";
import { Config, UNLIMITED } from "./Config";
import { FileModelValidator, MappingFileValidator } from "./validation";
import { ComputeError } from "./validation/ComputeError";
import { CustomError } from "./validation/CustomError";
import { FileFormatError } from "./validation/FileFormatError";
import { MaxExecutionTimeExceededError } from "./validation/MaxExecutionTimeExceededError";
import { ParameterRangeError } from "./validation/ParameterRangeError";

export class Compute {
    
    static async run(action: Types.actions.SomeAction): Promise<string> {
        const maxExecutionTimeSeconds = Config.maxExecutionTimeSeconds;
        let timeoutId: NodeJS.Timeout | null = null;
        let timedOut: boolean = false;
        return await new Promise((resolve, reject) => {
            const pythonShell = PythonShell.run(
                "../stv-compute/gui.py",
                {
                    args: this.getPythonArgs(action),
                },
                (err, res) => {
                    if (timeoutId !== null) {
                        clearTimeout(timeoutId);
                        timeoutId = null;
                    }
                    if (err) {
                        reject(new ComputeError(err.message));
                    }
                    else if (!res || res.length === 0) {
                        reject(timedOut ? new MaxExecutionTimeExceededError() : new ComputeError("No response from the compute module"));
                    }
                    else if (res.length === 1) {
                        resolve(res[0] as string);
                    }
                    else {
                        resolve(JSON.stringify(res));
                    }
                }
            );
            if (pythonShell && maxExecutionTimeSeconds > 0) {
                timeoutId = setTimeout(() => {
                    timedOut = true;
                    pythonShell.kill("SIGKILL");
                }, maxExecutionTimeSeconds * 1000);
            }
        });
    }
    
    private static getPythonArgs(action: Types.actions.SomeAction): string[] {
        let modelName: "bisimulation" | "bridge" | "castles" | "drone" | "global" | "tian_ji" | "voting" | null = null;
        let method: "check" | "domino" | "run" | "verify" | null = null;
        let extraArgs: (string|number)[] = [];
        
        switch (action.type) {
            case "bisimulationChecking": {
                modelName = "bisimulation";
                method = "check";
                this.validateFileModel(action.model1Parameters, "model1");
                this.validateFileModel(action.model2Parameters, "model2");
                this.validateMappingFile(action.specification);
                extraArgs = [
                    this.prepareModelString(action.model1Parameters.modelString),
                    this.prepareModelString(action.model2Parameters.modelString),
                    this.prepareModelString(action.specification.modelString),
                ];
            } break;
            case "bisimulationModelsGeneration": {
                modelName = "bisimulation";
                method = "run";
                this.validateFileModel(action.model1Parameters, "model1");
                this.validateFileModel(action.model2Parameters, "model2");
                extraArgs = [
                    this.prepareModelString(action.model1Parameters.modelString),
                    this.prepareModelString(action.model2Parameters.modelString),
                ];
            } break;
            case "dominoDfs":
            case "lowerApproximation":
            case "upperApproximation":
            case "modelGeneration": {
                this.validateParameterizedModel(action.modelParameters);
                switch (action.modelParameters.type) {
                    case "bridgeEndplay": {
                        modelName = "bridge";
                        extraArgs = [action.modelParameters.deckSize, action.modelParameters.cardsInHand];
                    } break;
                    case "castles": {
                        modelName = "castles";
                        extraArgs = [action.modelParameters.castle1Size, action.modelParameters.castle2Size, action.modelParameters.castle3Size, action.modelParameters.life];
                    } break;
                    case "drones": {
                        modelName = "drone";
                        extraArgs = [action.modelParameters.numberOfDrones, action.modelParameters.initialEnergy];
                    } break;
                    case "file": {
                        modelName = "global";
                        extraArgs = [
                            action.reduced ? "reduced" : "global",
                            this.prepareModelString(action.modelParameters.modelString),
                        ];
                    } break;
                    case "simpleVoting": {
                        modelName = "voting";
                        extraArgs = [action.modelParameters.voters, action.modelParameters.candidates];
                    } break;
                    case "tianJi": {
                        modelName = "tian_ji";
                        extraArgs = [action.modelParameters.horses];
                    } break;
                }
                if (action.type == "dominoDfs") {
                    method = "domino";
                    extraArgs.push(this.convertHeuristic(action.heuristic));
                }
                else if (action.type == "lowerApproximation") {
                    method = "verify";
                    extraArgs.push(1);
                }
                else if (action.type == "upperApproximation") {
                    method = "verify";
                    extraArgs.push(0);
                }
                else if (action.type == "modelGeneration") {
                    method = "run";
                }
            } break;
        }
        
        if (modelName === null || method === null) {
            throw new Error("Unable to create arguments for the compute module.");
        }
        
        return [modelName, method, ...extraArgs.map(arg => arg.toString())];
    }
    
    private static convertHeuristic(heuristic: Types.actions.DominoDfsHeuristic): 0 | 1 | 2 | 3 {
        switch (heuristic) {
            case "basic": return 0;
            case "control": return 1;
            case "epistemic": return 2;
            case "visitedStates": return 3;
        }
    }
    
    private static prepareModelString(modelString: string): string {
        const buffer = Buffer.from(modelString);
        return buffer.toString("base64");
    }
    
    private static validateParameterizedModel(parameters: Types.models.parameters.SomeParameters, fileId?: string): void {
        if (parameters.type === "file") {
            this.validateFileModel(parameters, fileId!);
        }
        else {
            const keys = Object.keys(parameters);
            const config = Config.parameterizedModels[parameters.type];
            for (const key of keys) {
                const value = (<any>parameters)[key];
                const minValue = (<any>config.min)[key];
                const maxValue = (<any>config.max)[key];
                if (minValue !== UNLIMITED && value < minValue) {
                    throw new ParameterRangeError(key, value, minValue, maxValue);
                }
                if (maxValue !== UNLIMITED && value > maxValue) {
                    throw new ParameterRangeError(key, value, minValue, maxValue);
                }
            }
        }
    }
    
    private static validateFileModel(parameters: Types.models.parameters.File, fileId: string): void {
        try {
            const validator = new FileModelValidator(fileId, parameters.modelString);
            validator.validate();
        }
        catch (e) {
            if (e instanceof CustomError) {
                throw e;
            }
            else {
                throw new FileFormatError(fileId ? fileId : "model");
            }
        }
    }
    
    private static validateMappingFile(parameters: Types.models.parameters.File): void {
        try {
            const validator = new MappingFileValidator(parameters.modelString);
            validator.validate();
        }
        catch (e) {
            if (e instanceof CustomError) {
                throw e;
            }
            else {
                throw new FileFormatError("mapping");
            }
        }
    }
    
}
