import { CustomError } from "./CustomError";

export class ParameterRangeError<T> extends CustomError {
    
    constructor(parameterName: string, value: T, minValue: T, maxValue: T) {
        super(JSON.stringify({
            type: "ParameterRangeError",
            parameterName,
            value,
            minValue,
            maxValue,
        }));
    }
    
}
