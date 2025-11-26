# MCP Pickaxe Server

MCP server for the Pickaxe API - manages Remote Resilience Hub AI agents, documents, users, and analytics.

## Tools Available

| Tool | Description |
|------|-------------|
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

Add to your Claude Code MCP settings (`~/.claude/claude_desktop_config.json` or via Claude Code settings):

```json
{
  "mcpServers": {
    "pickaxe": {
      "command": "node",
      "args": ["/Users/jameschristian/mcp-pickaxe/dist/index.js"],
      "env": {
        "PICKAXE_API_KEY": "studio-f1e9eca1-0315-4e60-9b67-e3c63422f04f"
      }
    }
  }
}
```

### 4. Restart Claude Code

The tools will appear as `mcp__pickaxe__<tool_name>`.

## Usage Examples

### Analyze agent conversations
```
Use mcp__pickaxe__chat_history with pickaxeId "B0AENXYFKO" to fetch the last 20 conversations
```

### Add content to an agent's KB
```
1. Use mcp__pickaxe__doc_create to create a document with the NIE guide content
2. Use mcp__pickaxe__doc_connect to link it to the Bureaucracy Navigator agent
```

### Manage users
```
Use mcp__pickaxe__user_list to see all users and their product access
Use mcp__pickaxe__user_update to add a user to the Digital Nomad bundle
```

## Agent IDs (from Bots folder)

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
