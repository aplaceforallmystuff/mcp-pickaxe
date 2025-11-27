#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";

// Pickaxe API configuration
const PICKAXE_BASE_URL = "https://api.pickaxe.co/v1";
const DEFAULT_STUDIO = process.env.PICKAXE_DEFAULT_STUDIO;

// Get all configured studios from environment
function getConfiguredStudios(): string[] {
  const studios: string[] = [];
  for (const key of Object.keys(process.env)) {
    if (key.startsWith("PICKAXE_STUDIO_")) {
      const studioName = key.replace("PICKAXE_STUDIO_", "");
      studios.push(studioName);
    }
  }
  return studios;
}

// Get API key for a studio
function getApiKey(studio?: string): string {
  const studioName = studio ?? DEFAULT_STUDIO;

  if (!studioName) {
    const studios = getConfiguredStudios();
    if (studios.length === 1) {
      // Only one studio configured, use it
      return process.env[`PICKAXE_STUDIO_${studios[0]}`]!;
    }
    throw new Error(
      `No studio specified and no default set. Available studios: ${studios.join(", ")}. ` +
      `Set PICKAXE_DEFAULT_STUDIO or pass 'studio' parameter.`
    );
  }

  const apiKey = process.env[`PICKAXE_STUDIO_${studioName.toUpperCase()}`];
  if (!apiKey) {
    const studios = getConfiguredStudios();
    throw new Error(
      `Studio "${studioName}" not found. Available studios: ${studios.join(", ")}. ` +
      `Configure with PICKAXE_STUDIO_${studioName.toUpperCase()} environment variable.`
    );
  }

  return apiKey;
}

// Validate at least one studio is configured
const configuredStudios = getConfiguredStudios();
if (configuredStudios.length === 0) {
  console.error("Error: No Pickaxe studios configured.");
  console.error("Set environment variables like PICKAXE_STUDIO_RRHUB=your-api-key");
  process.exit(1);
}

console.error(`Pickaxe MCP server initialized with studios: ${configuredStudios.join(", ")}`);
if (DEFAULT_STUDIO) {
  console.error(`Default studio: ${DEFAULT_STUDIO}`);
}

// API helper function
async function pickaxeRequest(
  endpoint: string,
  method: "GET" | "POST" | "PATCH" | "DELETE" = "GET",
  body?: Record<string, unknown>,
  studio?: string
): Promise<unknown> {
  const apiKey = getApiKey(studio);
  const url = endpoint.startsWith("http") ? endpoint : `${PICKAXE_BASE_URL}${endpoint}`;

  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
  };

  if (body && method !== "GET") {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Pickaxe API error (${response.status}): ${errorText}`);
  }

  return response.json();
}

// Studio parameter schema (added to all tools)
const studioParam = {
  type: "string",
  description: `Studio name to use. Available: ${configuredStudios.join(", ")}. Default: ${DEFAULT_STUDIO || configuredStudios[0]}`,
};

// Define all tools
const tools: Tool[] = [
  // Studio management
  {
    name: "studios_list",
    description: "List all configured Pickaxe studios and the current default.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },

  // Chat History
  {
    name: "chat_history",
    description: "Fetch conversation history for a Pickaxe agent. Use to analyze user questions, identify KB gaps, and review agent performance.",
    inputSchema: {
      type: "object",
      properties: {
        studio: studioParam,
        pickaxeId: {
          type: "string",
          description: "The Pickaxe agent ID (from the agent URL or config)",
        },
        skip: {
          type: "number",
          description: "Number of conversations to skip (for pagination). Default: 0",
        },
        limit: {
          type: "number",
          description: "Maximum conversations to return. Default: 10, Max: 100",
        },
        format: {
          type: "string",
          enum: ["messages", "raw"],
          description: "Output format. 'messages' is human-readable, 'raw' includes metadata. Default: messages",
        },
      },
      required: ["pickaxeId"],
    },
  },

  // Document tools
  {
    name: "doc_create",
    description: "Create a new document in Pickaxe knowledge base. Can create from raw content or scrape a website URL.",
    inputSchema: {
      type: "object",
      properties: {
        studio: studioParam,
        name: {
          type: "string",
          description: "Name/title of the document",
        },
        rawContent: {
          type: "string",
          description: "Raw text content for the document. Use this OR website, not both.",
        },
        website: {
          type: "string",
          description: "URL to scrape as document content. Use this OR rawContent, not both.",
        },
      },
      required: ["name"],
    },
  },
  {
    name: "doc_connect",
    description: "Connect/link a document to a Pickaxe agent, adding it to the agent's knowledge base.",
    inputSchema: {
      type: "object",
      properties: {
        studio: studioParam,
        documentId: {
          type: "string",
          description: "The document ID to connect",
        },
        pickaxeId: {
          type: "string",
          description: "The Pickaxe agent ID to connect the document to",
        },
      },
      required: ["documentId", "pickaxeId"],
    },
  },
  {
    name: "doc_disconnect",
    description: "Disconnect/unlink a document from a Pickaxe agent, removing it from the agent's knowledge base.",
    inputSchema: {
      type: "object",
      properties: {
        studio: studioParam,
        documentId: {
          type: "string",
          description: "The document ID to disconnect",
        },
        pickaxeId: {
          type: "string",
          description: "The Pickaxe agent ID to disconnect the document from",
        },
      },
      required: ["documentId", "pickaxeId"],
    },
  },
  {
    name: "doc_list",
    description: "List all documents in the Pickaxe studio with pagination.",
    inputSchema: {
      type: "object",
      properties: {
        studio: studioParam,
        skip: {
          type: "number",
          description: "Number of documents to skip. Default: 0",
        },
        take: {
          type: "number",
          description: "Number of documents to return. Default: 10",
        },
      },
    },
  },
  {
    name: "doc_get",
    description: "Retrieve a specific document by ID.",
    inputSchema: {
      type: "object",
      properties: {
        studio: studioParam,
        documentId: {
          type: "string",
          description: "The document ID to retrieve",
        },
      },
      required: ["documentId"],
    },
  },
  {
    name: "doc_delete",
    description: "Delete a document from Pickaxe. This removes it from all connected agents.",
    inputSchema: {
      type: "object",
      properties: {
        studio: studioParam,
        documentId: {
          type: "string",
          description: "The document ID to delete",
        },
      },
      required: ["documentId"],
    },
  },

  // User tools
  {
    name: "user_list",
    description: "List all users in the Pickaxe studio with their product access and usage stats.",
    inputSchema: {
      type: "object",
      properties: {
        studio: studioParam,
        skip: {
          type: "number",
          description: "Number of users to skip. Default: 0",
        },
        take: {
          type: "number",
          description: "Number of users to return. Default: 10",
        },
      },
    },
  },
  {
    name: "user_get",
    description: "Get details for a specific user by email.",
    inputSchema: {
      type: "object",
      properties: {
        studio: studioParam,
        email: {
          type: "string",
          description: "The user's email address",
        },
      },
      required: ["email"],
    },
  },
  {
    name: "user_create",
    description: "Create a new user with optional product access.",
    inputSchema: {
      type: "object",
      properties: {
        studio: studioParam,
        email: {
          type: "string",
          description: "User's email address (required)",
        },
        name: {
          type: "string",
          description: "User's display name",
        },
        password: {
          type: "string",
          description: "User's password (optional - they can reset)",
        },
        products: {
          type: "array",
          items: { type: "string" },
          description: "Array of product IDs to grant access to",
        },
        isEmailVerified: {
          type: "boolean",
          description: "Mark email as verified. Default: false",
        },
      },
      required: ["email"],
    },
  },
  {
    name: "user_update",
    description: "Update an existing user's details, products, or usage.",
    inputSchema: {
      type: "object",
      properties: {
        studio: studioParam,
        email: {
          type: "string",
          description: "The user's email address",
        },
        name: {
          type: "string",
          description: "Updated display name",
        },
        products: {
          type: "array",
          items: { type: "string" },
          description: "Updated array of product IDs",
        },
        currentUses: {
          type: "number",
          description: "Set current usage count",
        },
        extraUses: {
          type: "number",
          description: "Add extra usage allowance",
        },
        isEmailVerified: {
          type: "boolean",
          description: "Update email verification status",
        },
      },
      required: ["email"],
    },
  },
  {
    name: "user_delete",
    description: "Delete a user by email.",
    inputSchema: {
      type: "object",
      properties: {
        studio: studioParam,
        email: {
          type: "string",
          description: "The user's email address to delete",
        },
      },
      required: ["email"],
    },
  },
  {
    name: "user_invite",
    description: "Send email invitations to new users with optional product access.",
    inputSchema: {
      type: "object",
      properties: {
        studio: studioParam,
        emails: {
          type: "array",
          items: { type: "string" },
          description: "Array of email addresses to invite",
        },
        productIds: {
          type: "array",
          items: { type: "string" },
          description: "Array of product IDs to grant access to",
        },
      },
      required: ["emails"],
    },
  },

  // Product tools
  {
    name: "products_list",
    description: "List all available products/bundles in the Pickaxe studio.",
    inputSchema: {
      type: "object",
      properties: {
        studio: studioParam,
      },
    },
  },

  // Memory tools
  {
    name: "memory_list",
    description: "List all memory schemas defined in the studio.",
    inputSchema: {
      type: "object",
      properties: {
        studio: studioParam,
        skip: {
          type: "number",
          description: "Number of memories to skip. Default: 0",
        },
        take: {
          type: "number",
          description: "Number of memories to return. Default: 10",
        },
      },
    },
  },
  {
    name: "memory_get_user",
    description: "Get all collected memories for a specific user.",
    inputSchema: {
      type: "object",
      properties: {
        studio: studioParam,
        email: {
          type: "string",
          description: "The user's email address",
        },
        memoryId: {
          type: "string",
          description: "Optional: specific memory schema ID to filter by",
        },
        skip: {
          type: "number",
          description: "Number of memories to skip. Default: 0",
        },
        take: {
          type: "number",
          description: "Number of memories to return. Default: 10",
        },
      },
      required: ["email"],
    },
  },
];

// Tool execution handlers
async function executeTool(name: string, args: Record<string, unknown>): Promise<string> {
  const studio = args.studio as string | undefined;

  switch (name) {
    // Studio management
    case "studios_list": {
      const studios = getConfiguredStudios();
      const result = {
        studios,
        default: DEFAULT_STUDIO || (studios.length === 1 ? studios[0] : null),
        count: studios.length,
      };
      return JSON.stringify(result, null, 2);
    }

    // Chat History
    case "chat_history": {
      const result = await pickaxeRequest("/studio/pickaxe/history", "POST", {
        pickaxeId: args.pickaxeId,
        skip: args.skip ?? 0,
        limit: args.limit ?? 10,
        format: args.format ?? "messages",
      }, studio);
      return JSON.stringify(result, null, 2);
    }

    // Document tools
    case "doc_create": {
      const body: Record<string, unknown> = { name: args.name };
      if (args.rawContent) body.rawContent = args.rawContent;
      if (args.website) body.website = args.website;
      const result = await pickaxeRequest("/studio/document/create", "POST", body, studio);
      return JSON.stringify(result, null, 2);
    }
    case "doc_connect": {
      const result = await pickaxeRequest("/studio/document/connect", "POST", {
        documentId: args.documentId,
        pickaxeId: args.pickaxeId,
      }, studio);
      return JSON.stringify(result, null, 2);
    }
    case "doc_disconnect": {
      const result = await pickaxeRequest("/studio/document/disconnect", "POST", {
        documentId: args.documentId,
        pickaxeId: args.pickaxeId,
      }, studio);
      return JSON.stringify(result, null, 2);
    }
    case "doc_list": {
      const skip = args.skip ?? 0;
      const take = args.take ?? 10;
      const result = await pickaxeRequest(`/studio/document/list?skip=${skip}&take=${take}`, "GET", undefined, studio);
      return JSON.stringify(result, null, 2);
    }
    case "doc_get": {
      const result = await pickaxeRequest(`/studio/document/${args.documentId}`, "GET", undefined, studio);
      return JSON.stringify(result, null, 2);
    }
    case "doc_delete": {
      const result = await pickaxeRequest(`/studio/document/${args.documentId}`, "DELETE", undefined, studio);
      return JSON.stringify(result, null, 2);
    }

    // User tools
    case "user_list": {
      const skip = args.skip ?? 0;
      const take = args.take ?? 10;
      const result = await pickaxeRequest(`/studio/user/list?skip=${skip}&take=${take}`, "GET", undefined, studio);
      return JSON.stringify(result, null, 2);
    }
    case "user_get": {
      const result = await pickaxeRequest(`/studio/user/${encodeURIComponent(args.email as string)}`, "GET", undefined, studio);
      return JSON.stringify(result, null, 2);
    }
    case "user_create": {
      const result = await pickaxeRequest("/studio/user/create", "POST", {
        email: args.email,
        name: args.name,
        password: args.password,
        products: args.products,
        isEmailVerified: args.isEmailVerified ?? false,
      }, studio);
      return JSON.stringify(result, null, 2);
    }
    case "user_update": {
      const data: Record<string, unknown> = {};
      if (args.name !== undefined) data.name = args.name;
      if (args.products !== undefined) data.products = args.products;
      if (args.currentUses !== undefined) data.currentUses = args.currentUses;
      if (args.extraUses !== undefined) data.extraUses = args.extraUses;
      if (args.isEmailVerified !== undefined) data.isEmailVerified = args.isEmailVerified;

      const result = await pickaxeRequest(
        `/studio/user/${encodeURIComponent(args.email as string)}`,
        "PATCH",
        { data },
        studio
      );
      return JSON.stringify(result, null, 2);
    }
    case "user_delete": {
      const result = await pickaxeRequest(
        `/studio/user/${encodeURIComponent(args.email as string)}`,
        "DELETE",
        undefined,
        studio
      );
      return JSON.stringify(result, null, 2);
    }
    case "user_invite": {
      const result = await pickaxeRequest("/studio/user/invite", "POST", {
        emails: args.emails,
        productIds: args.productIds,
      }, studio);
      return JSON.stringify(result, null, 2);
    }

    // Product tools
    case "products_list": {
      const result = await pickaxeRequest("/studio/product/list", "GET", undefined, studio);
      return JSON.stringify(result, null, 2);
    }

    // Memory tools
    case "memory_list": {
      const skip = args.skip ?? 0;
      const take = args.take ?? 10;
      const result = await pickaxeRequest(`/studio/memory/list?skip=${skip}&take=${take}`, "GET", undefined, studio);
      return JSON.stringify(result, null, 2);
    }
    case "memory_get_user": {
      let url = `/studio/memory/user/${encodeURIComponent(args.email as string)}?`;
      if (args.memoryId) url += `memoryId=${args.memoryId}&`;
      url += `skip=${args.skip ?? 0}&take=${args.take ?? 10}`;
      const result = await pickaxeRequest(url, "GET", undefined, studio);
      return JSON.stringify(result, null, 2);
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// Create and run the server
const server = new Server(
  {
    name: "mcp-pickaxe",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register tool list handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Register tool execution handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    const result = await executeTool(name, (args as Record<string, unknown>) ?? {});
    return {
      content: [{ type: "text", text: result }],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [{ type: "text", text: `Error: ${errorMessage}` }],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Pickaxe MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
