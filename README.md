# MCP Pickaxe Server

MCP server for the Pickaxe API - manages multiple Pickaxe studios, AI agents, documents, users, and analytics.

## Multi-Studio Support

This server supports multiple Pickaxe studios. Configure each studio with an environment variable:

```
PICKAXE_STUDIO_RRHUB=studio-xxx-xxx
PICKAXE_STUDIO_INFORMATIC=studio-yyy-yyy
PICKAXE_STUDIO_SON=studio-zzz-zzz
PICKAXE_DEFAULT_STUDIO=RRHUB
```

Then use the `studio` parameter in any tool call:
```
mcp__pickaxe__doc_list with studio="RRHUB"
mcp__pickaxe__user_list with studio="INFORMATIC"
```

If only one studio is configured, it's used automatically. If multiple studios exist, either set a default or pass `studio` explicitly.

## Tools Available

| Tool | Description |
|------|-------------|
| `studios_list` | List all configured studios and default |
| `chat_history` | Fetch conversation logs for any agent |
| `doc_create` | Create KB document from content or URL |
| `doc_connect` | Link document to an agent |
| `doc_disconnect` | Unlink document from an agent |
| `doc_list` | List all documents |
| `doc_get` | Get document details |
| `doc_delete` | Delete a document |
| `user_list` | List all users |
| `user_get` | Get user details |
| `user_create` | Create new user |
| `user_update` | Update user (products, usage, etc.) |
| `user_delete` | Delete user |
| `user_invite` | Send email invitations |
| `products_list` | List available products/bundles |
| `memory_list` | List memory schemas |
| `memory_get_user` | Get user's collected memories |

## Setup

### 1. Install dependencies

```bash
cd ~/mcp-pickaxe
npm install
```

### 2. Build

```bash
npm run build
```

### 3. Configure Claude Code

Add to your Claude Code MCP settings (`~/.claude.json` or settings UI):

```json
{
  "mcpServers": {
    "pickaxe": {
      "command": "node",
      "args": ["/Users/jameschristian/mcp-pickaxe/dist/index.js"],
      "env": {
        "PICKAXE_STUDIO_RRHUB": "studio-f1e9eca1-0315-4e60-9b67-e3c63422f04f",
        "PICKAXE_STUDIO_INFORMATIC": "studio-your-other-key",
        "PICKAXE_DEFAULT_STUDIO": "RRHUB"
      }
    }
  }
}
```

### 4. Restart Claude Code

The tools will appear as `mcp__pickaxe__<tool_name>`.

## Usage Examples

### List configured studios
```
Use mcp__pickaxe__studios_list to see available studios
```

### Analyze agent conversations (specific studio)
```
Use mcp__pickaxe__chat_history with studio="RRHUB", pickaxeId="B0AENXYFKO", limit=20
```

### Add content to an agent's KB
```
1. Use mcp__pickaxe__doc_create with studio="RRHUB", name="NIE Guide", rawContent="..."
2. Use mcp__pickaxe__doc_connect with studio="RRHUB", documentId="...", pickaxeId="K3TI2AAP8D"
```

### Manage users across studios
```
Use mcp__pickaxe__user_list with studio="RRHUB" to see RRHub users
Use mcp__pickaxe__user_list with studio="INFORMATIC" to see Informatic users
```

## Agent IDs (Remote Resilience Hub)

| Agent | Pickaxe ID |
|-------|------------|
| Hub Concierge | `B0AENXYFKO` |
| Bureaucracy Navigator | `K3TI2AAP8D` |

(Add other agent IDs from the `Agent - *.md` files as needed)

## Development

Run in dev mode (no build required):
```bash
npm run dev
```

## API Reference

Full Pickaxe API documentation: See Obsidian vault at `04 Resources/Pickaxe/Pickaxe API documentation.md`
