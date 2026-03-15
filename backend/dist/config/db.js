"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const pg_1 = require("pg");
const adapter_pg_1 = require("@prisma/adapter-pg");
const connectionString = process.env.DATABASE_URL;
const pool = new pg_1.Pool({ connectionString });
const adapter = new adapter_pg_1.PrismaPg(pool);
exports.prisma = global.prisma || new client_1.PrismaClient({ adapter });
if (process.env.NODE_ENV !== 'production')
    global.prisma = exports.prisma;
//# sourceMappingURL=db.js.map