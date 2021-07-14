import { CustomError } from "./CustomError";

export class DuplicatePropertyError extends CustomError {
    
    constructor(propertyName: string) {
        super(JSON.stringify({
            type: "DuplicatePropertyError",
            propertyName,
        }));
    }
    
}
