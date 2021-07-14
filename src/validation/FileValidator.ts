import { UNLIMITED } from "../Config";
import { FileSizeError } from "./FileSizeError";

export class FileValidator {
    
    private fileId: string;
    private fileContent: string;
    private maxFileSizeBytes: number;
    
    constructor(fileId: string, fileContent: string, maxFileSizeBytes: number) {
        this.fileId = fileId;
        this.fileContent = fileContent;
        this.maxFileSizeBytes = maxFileSizeBytes;
    }
    
    validate(): void {
        if (this.maxFileSizeBytes !== UNLIMITED && this.fileContent.length > this.maxFileSizeBytes) {
            throw new FileSizeError(this.fileId, this.fileContent.length, this.maxFileSizeBytes)
        }
    }
    
    protected getSignificantLines(): string[] {
        return this.fileContent
            .split("\n")
            .map(line => line.trim())
            .filter(line => !this.isLineEmptyOrComment(line));
    }
    
    private isLineEmptyOrComment(line: string): boolean {
        return line.length === 0 || line.startsWith("%");
    }
    
}
