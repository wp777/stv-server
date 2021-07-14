import { CustomError } from "./CustomError";

export class FileFormatError extends CustomError {
    
    constructor(fileId: string) {
        super(JSON.stringify({
            type: "FileFormatError",
            fileId,
        }));
    }
    
}
