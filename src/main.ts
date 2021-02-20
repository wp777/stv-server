import express from "express";
import bodyParser from "body-parser";
import http from "http";
import { Compute } from "./Compute";

const port = 3000;

const app = express();
app.use(bodyParser.json());
const server = http.createServer(app);

app.use("/", express.static("../stv-web/dist/stv-web/"));

app.post("/compute", async (request, response) => {
    try {
        const result = await Compute.run(request.body);
        return response.json({
            status: "success",
            data: result,
        });
    }
    catch (error) {
        return response.json({
            status: "error",
            error: error,
        });
    }
});

server.listen(port);
