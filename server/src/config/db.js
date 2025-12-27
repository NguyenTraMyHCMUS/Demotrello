import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "warn", "error"]
      : ["error"],
  datasources: {
    db: {
      url: process.env.DATABASE_URL, // override connection
    },
  },
});

const connectToDatabase = async () => {
  try {
    await prisma.$connect();
    console.log("Connected to the database successfully.");
  } catch (error) {
    console.error("Error connecting to the database:", error);
    throw error;
  }
};

const disconnectFromDatabase = async () => {
  try {
    await prisma.$disconnect();
    console.log("Disconnected from the database successfully.");
  } catch (error) {
    console.error("Error disconnecting from the database:", error);
    throw error;
  }
};

export { connectToDatabase, disconnectFromDatabase, prisma };
