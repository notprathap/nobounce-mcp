#!/usr/bin/env node
/**
 * NoBounce Email Validation MCP Server (stdio JSON-RPC 2.0)
 * Docs & Free API Key: https://nobounceapi.com
 */

const readline = require('readline');

const BASE_URL = (process.env.NOBOUNCE_BASE_URL || 'https://nobounceapi.com').replace(/\/+$/, '');
const API_KEY = process.env.NOBOUNCE_API_KEY || '';

const TOOLS = [
  {
    name: 'validate_email',
    description:
      'Validate a single email address for RFC 5322 syntax, DNS MX records, 5,000+ disposable email providers, role-based accounts (admin@, support@), free email providers, domain typo suggestions, and optional SMTP mailbox handshake.',
    inputSchema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          description: 'Email address to validate (e.g. support@google.com)'
        },
        smtp_check: {
          type: 'boolean',
          description: 'Optional deep SMTP mailbox handshake check (default: false)',
          default: false
        },
        api_key: {
          type: 'string',
          description: 'Optional override for NOBOUNCE_API_KEY environment variable'
        }
      },
      required: ['email']
    }
  },
  {
    name: 'validate_emails_bulk',
    description:
      'Validate up to 1,000 email addresses in a single batch call. Checks syntax, MX records, disposable domains, role accounts, free providers, and typo suggestions with automatic partial-quota handling.',
    inputSchema: {
      type: 'object',
      properties: {
        emails: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of email addresses to validate (up to 1,000 per call)'
        },
        smtp_check: {
          type: 'boolean',
          description: 'Optional deep SMTP handshake check for each email (default: false)',
          default: false
        },
        api_key: {
          type: 'string',
          description: 'Optional override for NOBOUNCE_API_KEY environment variable'
        }
      },
      required: ['emails']
    }
  }
];

async function handleToolCall(name, args = {}) {
  const key = args.api_key || API_KEY;
  if (!key) {
    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: 'Missing NoBounce API key. Set NOBOUNCE_API_KEY in your MCP server config or get a free 100-credit/mo API key at https://nobounceapi.com/register'
        }
      ]
    };
  }

  try {
    if (name === 'validate_email') {
      const resp = await fetch(`${BASE_URL}/api/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': key
        },
        body: JSON.stringify({
          email: args.email,
          smtp_check: Boolean(args.smtp_check)
        })
      });
      const data = await resp.json();
      return {
        isError: !resp.ok,
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }]
      };
    }

    if (name === 'validate_emails_bulk') {
      const resp = await fetch(`${BASE_URL}/api/validate-bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': key
        },
        body: JSON.stringify({
          emails: Array.isArray(args.emails) ? args.emails : [],
          smtp_check: Boolean(args.smtp_check)
        })
      });
      const data = await resp.json();
      return {
        isError: !resp.ok,
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }]
      };
    }

    return {
      isError: true,
      content: [{ type: 'text', text: `Unknown tool: ${name}` }]
    };
  } catch (err) {
    return {
      isError: true,
      content: [{ type: 'text', text: `NoBounce API request failed: ${err.message}` }]
    };
  }
}

function sendResponse(id, result) {
  process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id, result }) + '\n');
}

function sendError(id, code, message) {
  process.stdout.write(
    JSON.stringify({ jsonrpc: '2.0', id, error: { code, message } }) + '\n'
  );
}

if (process.argv.includes('--self-test')) {
  console.log(JSON.stringify({ status: 'ok', tools: TOOLS.map((t) => t.name) }));
  process.exit(0);
}

const rl = readline.createInterface({
  input: process.stdin,
  terminal: false
});

rl.on('line', async (line) => {
  const trimmed = line.trim();
  if (!trimmed) return;

  let msg;
  try {
    msg = JSON.parse(trimmed);
  } catch (e) {
    return;
  }

  const { id, method, params } = msg;

  if (method === 'initialize') {
    return sendResponse(id, {
      protocolVersion: (params && params.protocolVersion) || '2024-11-05',
      capabilities: {
        tools: {}
      },
      serverInfo: {
        name: 'nobounce-mcp',
        version: '1.0.0'
      }
    });
  }

  if (method === 'notifications/initialized' || method === 'cancelled') {
    return;
  }

  if (method === 'ping') {
    return sendResponse(id, {});
  }

  if (method === 'tools/list') {
    return sendResponse(id, { tools: TOOLS });
  }

  if (method === 'tools/call') {
    const result = await handleToolCall(
      params && params.name,
      (params && params.arguments) || {}
    );
    return sendResponse(id, result);
  }

  if (id !== undefined) {
    sendError(id, -32601, `Method not found: ${method}`);
  }
});
