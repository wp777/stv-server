import { CustomError } from "./CustomError";

export class ComputeError extends CustomError {
    
    constructor(errorString: string) {
        super(JSON.stringify({
            type: "ComputeError",
            errorString,
        }));
    }
    
}
