import { CustomError } from "./CustomError";

export class MaxExecutionTimeExceededError extends CustomError {
    
    constructor() {
        super(JSON.stringify({
            type: "MaxExecutionTimeExceededError",
        }));
    }
    
}
