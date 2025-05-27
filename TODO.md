# Improvements list

- Move from tailwind CDN to static minified files

## TODO: Environment Variables

Currently, the project does not use any environment variables. In the future, consider adding the following:

1. **PORT**: Define the port on which the server should run (default: 7070).
2. **NODE_ENV**: Specify the environment (e.g., development, production).
3. **LOG_LEVEL**: Set the logging verbosity (e.g., info, debug, error).
4. **TIMEOUT_MS**: Configure the request timeout in milliseconds.
5. **DATABASE_URL**: If a database is integrated, provide the connection string.

These variables can be managed using a `.env` file and loaded with a library like `dotenv`.
