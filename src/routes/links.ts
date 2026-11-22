import app from "../app.js";
import zod from "zod";

const linkSchema = zod.object({
    url: zod.string().url()
})

const linkStore = new Map();
app.post("/links", (req, res) => {
    const body = req.body;
    try {
        linkSchema.parse(body);
        const url = linkSchema.parse(body).url;
        return {
            shortUrl: "http://localhost:3000/abc123"
        }
    }
    catch (e) {
        return Error("Invalid URL");
    }
    
})