import sql from "mssql/msnodesqlv8.js";

const config = {
  server: "localhost",
  database: "EstateDB",

  options: {
    trustedConnection: true,
    trustServerCertificate: true,
  },

  driver: "msnodesqlv8",

  connectionString:
    "Driver={SQL Server};Server=localhost;Database=EstateDB;Trusted_Connection=Yes;",
};

try {
  await sql.connect(config);
  console.log("✅ Connected to SQL Server Successfully!");
} catch (err) {
  console.log("❌ SQL Connection Error:", err);
}

export { sql };
