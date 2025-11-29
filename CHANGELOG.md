# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [1.0.1] - 2025-11-27

### Added
- MCP registry support with `server.json`
- Published to npm as `mcp-pickaxe`

### Changed
- Updated README with npm installation instructions

## [1.0.0] - 2025-11-26

### Added
- Initial release with MCP tools for Pickaxe.com API
- **Multi-studio support** - Configure multiple Pickaxe studios via environment variables
- **Chat history tools:**
  - `chat_history` - Fetch conversation history for a Pickaxe agent
- **Document management tools:**
  - `doc_list` - List all documents in studio
  - `doc_get` - Retrieve specific document by ID
  - `doc_create` - Create new document (raw content or URL scrape)
  - `doc_delete` - Delete a document
  - `doc_connect` - Link document to a Pickaxe agent
  - `doc_disconnect` - Unlink document from agent
- **User management tools:**
  - `user_list` - List all users in studio
  - `user_get` - Get user details by email
  - `user_create` - Create new user with optional product access
  - `user_update` - Update user details or products
  - `user_delete` - Delete a user
  - `user_invite` - Send email invitations to new users
- **Other tools:**
  - `studios_list` - List all configured studios
  - `products_list` - List available products/bundles
  - `memory_list` - List memory schemas
  - `memory_get_user` - Get collected memories for a user

### Fixed
- Updated paths for correct home folder location
