# Contributing to MCP Pickaxe

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/aplaceforallmystuff/mcp-pickaxe.git`
3. Install dependencies: `npm install`
4. Create a branch: `git checkout -b feature/your-feature-name`

## Development

```bash
# Run in development mode (auto-reloads on changes)
npm run dev

# Build for production
npm run build

# Test the built version
npm start
```

## Adding New Tools

To add a new Pickaxe API tool:

1. **Add the tool definition** to the `tools` array in `src/index.ts`:

```typescript
{
  name: "your_tool_name",
  description: "What this tool does",
  inputSchema: {
    type: "object",
    properties: {
      studio: studioParam,
      // your parameters here
    },
    required: ["requiredParam"],
  },
}
```

2. **Add the handler** in the `executeTool()` switch statement:

```typescript
case "your_tool_name": {
  const result = await pickaxeRequest("/your/endpoint", "GET", undefined, studio);
  return JSON.stringify(result, null, 2);
}
```

## Code Style

- Use TypeScript
- Follow existing patterns in the codebase
- Keep functions focused and well-named
- Add JSDoc comments for complex functions

## Submitting Changes

1. Ensure your code builds: `npm run build`
2. Commit with clear messages describing the change
3. Push to your fork
4. Open a Pull Request with:
   - Clear description of what changed
   - Any relevant issue numbers
   - Screenshots/examples if applicable

## Reporting Issues

When reporting issues, please include:

- Node.js version
- Operating system
- Steps to reproduce
- Expected vs actual behavior
- Any error messages

## Questions?

Open an issue for any questions about contributing.
