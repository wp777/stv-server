import { CustomError } from "./CustomError";

export class MaxNumberExceededError<T> extends CustomError {
    
    constructor(parameterName: string, value: T, maxValue: T) {
        super(JSON.stringify({
            type: "MaxNumberExceededError",
            parameterName,
            value,
            maxValue,
        }));
    }
    
}
