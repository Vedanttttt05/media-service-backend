import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({ path: "./.env" });



connectDB().then(
    () => {
        app.listen(process.env.PORT|| 8000, () => {
            console.log(`\n Server is running on port ${process.env.PORT}`);
        });
        app.on("error", (err) => {
        console.error(" Server error:", err);
        process.exit(1);
    });
    }
).catch((err) => {
    console.error("Failed to connect to the database", err);
});