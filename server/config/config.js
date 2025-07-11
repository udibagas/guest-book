module.exports = {
  development: {
    username: "postgres",
    password: "postgres",
    database: "guest_book",
    host: "localhost",
    port: 5432,
    dialect: "postgres",
  },
  test: {
    username: "postgres",
    password: "postgres",
    database: "guest_book_test",
    host: "localhost",
    port: 5432,
    dialect: "postgres",
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "postgres",
  },
};
