# NoBounce Email Validation MCP Server (`nobounce-mcp`)

[![notprathap/nobounce-mcp MCP server](https://glama.ai/mcp/servers/notprathap/nobounce-mcp/badges/score.svg)](https://glama.ai/mcp/servers/notprathap/nobounce-mcp)

Official [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server for **[NoBounce Email Validation & Bulk CSV Verification API](https://nobounceapi.com)**.

Allows AI assistants (Claude Desktop, Cursor, Windsurf, Cline, etc.) to verify single email addresses and bulk email lists in real time:
- **RFC 5322 Syntax & Domain Check**
- **DNS MX Record Lookup**
- **5,000+ Disposable / Temp-Mail Provider Detection**
- **Role Account Detection** (`support@`, `admin@`, `sales@`)
- **Typo Suggestion** (`gmial.com` -> `gmail.com`)
- **Optional Deep SMTP Mailbox Handshake**
- **Bulk Batch Validation** (up to 1,000 emails per call with graceful partial-quota processing)

## Get a Free API Key

Grab a free API key (100 free validations/month, no credit card required) at **[https://nobounceapi.com/register](https://nobounceapi.com/register)**.

## Tools Provided

1. `validate_email` — Validate a single email address (`email`, optional `smtp_check`).
2. `validate_emails_bulk` — Validate an array of up to 1,000 email addresses (`emails`, optional `smtp_check`).

## Quickstart (Claude Desktop / Cursor / Windsurf)

Add to your `claude_desktop_config.json` or `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "nobounce": {
      "command": "npx",
      "args": ["-y", "github:notprathap/nobounce-mcp"],
      "env": {
        "NOBOUNCE_API_KEY": "nb-your-api-key-here"
      }
    }
  }
}
```

## License

MIT — [https://nobounceapi.com](https://nobounceapi.com)
