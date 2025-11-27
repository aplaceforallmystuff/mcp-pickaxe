# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MCP server for the Pickaxe API - provides AI assistants with tools to manage Pickaxe studios, AI agents, documents, users, and analytics.

## Commands

```bash
npm install      # Install dependencies
npm run build    # Compile TypeScript to dist/
npm run dev      # Run in development mode (tsx, no build required)
npm start        # Run compiled version from dist/
```

## Architecture

Single-file MCP server (`src/index.ts`) using `@modelcontextprotocol/sdk`:

- **Multi-studio support**: Environment variables `PICKAXE_STUDIO_<NAME>` configure API keys for different studios. All tools accept an optional `studio` parameter.
- **API wrapper**: `pickaxeRequest()` handles all Pickaxe API calls with auth and error handling
- **Tool definitions**: Array of `Tool` objects with JSON Schema input definitions
- **Tool execution**: `executeTool()` switch statement routes tool calls to API endpoints

## Multi-Studio Configuration

Studios are configured via environment variables:
```
PICKAXE_STUDIO_PRODUCTION=studio-xxx
PICKAXE_STUDIO_STAGING=studio-yyy
PICKAXE_DEFAULT_STUDIO=PRODUCTION
```

The `getConfiguredStudios()` function scans env vars for `PICKAXE_STUDIO_*` prefixes. If no studio is specified in a tool call and no default is set, the server throws an error listing available options.

## Adding New Tools

1. Add tool definition to the `tools` array with name, description, and inputSchema
2. Add case handler in `executeTool()` switch statement
3. Use `pickaxeRequest(endpoint, method, body, studio)` to call the API

## Pickaxe API

Base URL: `https://api.pickaxe.co/v1`

Main endpoints used:
- `/studio/pickaxe/history` - Agent chat logs
- `/studio/document/*` - Knowledge base documents
- `/studio/user/*` - User management
- `/studio/product/list` - Products/bundles
- `/studio/memory/*` - Memory schemas and user memories
