import { CustomError } from "./CustomError";

export class FileSizeError extends CustomError {
    
    constructor(fileName: string, fileSize: number, maxFileSize: number) {
        super(JSON.stringify({
            type: "FileSizeError",
            fileName,
            fileSize,
            maxFileSize,
        }));
    }
    
}
