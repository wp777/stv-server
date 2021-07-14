import { Config } from "../Config";
import { FileValidator } from "./FileValidator";
import { MaxNumberExceededError } from "./MaxNumberExceededError";

export class MappingFileValidator extends FileValidator {
    
    constructor(fileContent: string) {
        super("mapping", fileContent, Config.mappingFile.maxFileSizeBytes);
    }
    
    validate(): void {
        super.validate();
        const lines = this.getSignificantLines();
        this.validateMaxNumberOfMappings(lines);
    }
    
    private validateMaxNumberOfMappings(lines: string[]): void {
        const maxNumberOfMappings = Config.mappingFile.maxNumberOfMappings;
        let numberOfMappings: number = 0;
        for (const line of lines) {
            if (line.includes("->")) {
                numberOfMappings++;
            }
        }
        if (numberOfMappings > maxNumberOfMappings) {
            throw new MaxNumberExceededError("numberOfMappings", numberOfMappings, maxNumberOfMappings);
        }
    }
    
}
