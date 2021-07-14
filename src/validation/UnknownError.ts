import { CustomError } from "./CustomError";

export class UnknownError extends CustomError {
    
    constructor(extra?: string) {
        super(JSON.stringify({
            type: "UnknownError",
            extra,
        }));
    }
    
}
