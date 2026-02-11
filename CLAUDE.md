# CLAUDE.md - mcp-pickaxe

MCP server for managing Pickaxe AI agents, knowledge bases, users, and analytics.

## Tech Stack

- **Language:** TypeScript
- **Runtime:** Node.js (ES modules)
- **Protocol:** Model Context Protocol (MCP)
- **Build:** TypeScript compiler (tsc)

## Architecture

```
src/
  index.ts          # Server, multi-studio config, all tool definitions and handlers
```

## Development Commands

```bash
npm run build       # tsc
npm run dev         # tsx src/index.ts
npm start           # node dist/index.js
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PICKAXE_STUDIO_*` | Yes (at least one) | API key per studio (e.g., `PICKAXE_STUDIO_MAIN`) |
| `PICKAXE_DEFAULT_STUDIO` | No | Default studio name when none specified |

## Tools (16)

**Studios:** `studios_list`
**Chat:** `chat_history`
**Documents:** `doc_create`, `doc_list`, `doc_get`, `doc_delete`, `doc_connect`, `doc_disconnect`
**Users:** `user_list`, `user_get`, `user_create`, `user_update`, `user_delete`, `user_invite`
**Products:** `products_list`
**Memory:** `memory_list`, `memory_get_user`

## Key Patterns

- Uses `Server` class from MCP SDK (low-level API with `setRequestHandler`)
- Multi-studio support via `PICKAXE_STUDIO_*` env var pattern
- Every tool accepts optional `studio` param; `getApiKey()` resolves: explicit > default > single
- `executeTool()` central switch dispatches to `pickaxeRequest()` API calls
- Exits if no `PICKAXE_STUDIO_*` env vars found; studio names case-insensitive
