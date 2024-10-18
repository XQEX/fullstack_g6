import "dotenv/config";

const pg_user = process.env.POSTGRES_USER;
const pg_password = process.env.POSTGRES_PASSWORD;
const pg_super_user = process.env.POSTGRES_SUPER_USER;
const pg_super_password = process.env.POSTGRES_SUPER_PASSWORD;
const pg_host = process.env.POSTGRES_HOST;
const pg_port = process.env.POSTGRES_PORT;
const pg_db = process.env.POSTGRES_DB;

// <Debug>
// console.log({
//   pg_user,
//   pg_password,
//   pg_super_user,
//   pg_super_password,
//   pg_host,
//   pg_port,
//   pg_db,
// });

if (
  !pg_user ||
  !pg_password ||
  !pg_super_user ||
  !pg_super_password ||
  !pg_host ||
  !pg_port ||
  !pg_db
) {
  throw new Error("Invalid env. Please debug");
}

export const super_url = `postgres://${pg_super_user}:${pg_super_password}@${pg_host}:${pg_port}/${pg_db}`;

export const url = `postgres://${pg_user}:${pg_password}@${pg_host}:${pg_port}/${pg_db}`;
