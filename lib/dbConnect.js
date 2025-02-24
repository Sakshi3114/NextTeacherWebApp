import mongoose from "mongoose";

const MONGODB_URI =  "mongodb+srv://sharmasakshi3114:sakshi3114@cluster0.luesx.mongodb.net/teacher";

if (!MONGODB_URI) {
    throw new Error("MongoDB URI is missing. Check your .env.local file.");
}

async function dbConnect() {
    if (mongoose.connection.readyState >= 1) {
        return; // Already connected
    }
    try {
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(" MongoDB Connected");
    } catch (error) {
        console.error(" MongoDB Connection Error:", error);
    }
}

export default dbConnect;
