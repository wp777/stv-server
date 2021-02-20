import { PythonShell } from "python-shell";
import * as Types from "stv-types";

export class Compute {
    
    static async run(action: Types.actions.SomeAction): Promise<string> {
        return await new Promise((resolve, reject) => {
            PythonShell.run("../stv-compute/gui.py", { args: this.getPythonArgs(action) }, (err, res) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(res![0] as string);
                }
            });
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
                extraArgs = [
                    this.prepareModelString(action.model1Parameters.modelString),
                    this.prepareModelString(action.model2Parameters.modelString),
                    this.prepareModelString(action.specification.modelString),
                ];
            } break;
            case "bisimulationModelsGeneration": {
                modelName = "bisimulation";
                method = "run";
                extraArgs = [
                    this.prepareModelString(action.model1Parameters.modelString),
                    this.prepareModelString(action.model2Parameters.modelString),
                ];
            } break;
            case "dominoDfs":
            case "lowerApproximation":
            case "upperApproximation":
            case "modelGeneration": {
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
    
    private static convertHeuristic(heuristic: Types.actions.DominoDfsHeuristic): 0 | 1 | 2| 3 {
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
    
}
