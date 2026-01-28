---
name: tauri-mcp-codex
description: Configure and use the Tauri MCP server with Codex CLI to control a Tauri app (build/run MCP server, wire the Tauri plugin/socket, set MCP env, and use available tools like screenshots, DOM, JS exec, input, and window/localStorage management).
metadata:
  short-description: Tauri MCP server + Codex CLI usage
---

# Tauri MCP + Codex CLI

## Quick workflow

1) Ensure the Tauri app runs with the MCP plugin and socket server enabled.
2) Start the MCP server (stdio transport for Codex CLI).
3) Register the MCP server with Codex CLI (command + args + env).
4) Use the tools to inspect and control the app.

## 1) Enable the Tauri plugin and socket server

Add the plugin to your Tauri app and start the socket server. The example below mirrors the upstream docs and is typically gated to dev builds:

```rust
#[cfg(debug_assertions)]
{
    tauri::Builder::default()
        .plugin(tauri_mcp::init_with_config(
            tauri_mcp::PluginConfig::new("YOUR_APP_NAME".to_string())
                .start_socket_server(true)
                // IPC (default) or TCP
                .socket_path("/tmp/tauri-mcp.sock")
                // .tcp("127.0.0.1", 9999)
        ))
        // ... rest of your builder config
}
```

Notes:
- On Windows, the default IPC path resolves to a named pipe like `\\.\pipe\tmp\tauri-mcp.sock`.
- If you use TCP, match the host/port in the MCP server env (see below).

## 2) Build or install the MCP server

Choose one path:

- Build from source:
  - `pip install -r requirements.txt`
  - `python build.py mcp`
  - MCP server entrypoint: `mcp-server-ts/build/index.js`

- Use npm without building:
  - `npx -y @delorenj/tauri-mcp-server@latest`

## 3) Register with Codex CLI (stdio transport)

Codex CLI uses stdio transport for MCP servers. Configure it with either `codex mcp add` or your Codex CLI config file. Provide env vars if you are not using default IPC.

Example (IPC, default path):

```bash
codex mcp add tauri-mcp -- npx -y @delorenj/tauri-mcp-server@latest
```

Example (TCP):

```bash
codex mcp add tauri-mcp \
  --env TAURI_MCP_CONNECTION_TYPE=tcp \
  --env TAURI_MCP_TCP_HOST=127.0.0.1 \
  --env TAURI_MCP_TCP_PORT=9999 \
  -- npx -y @delorenj/tauri-mcp-server@latest
```

Example (IPC with custom path):

```bash
codex mcp add tauri-mcp \
  --env TAURI_MCP_CONNECTION_TYPE=ipc \
  --env TAURI_MCP_IPC_PATH=/tmp/tauri-mcp.sock \
  -- npx -y @delorenj/tauri-mcp-server@latest
```

## 4) Available tools

Use these tools in Codex once the MCP server is connected:

- `take_screenshot` (window_label)
- `get_dom` (window_label)
- `execute_js` (code, window_label, timeout_ms)
- `manage_window` (operation, window_label, x, y, width, height)
- `manage_local_storage` (action, key, value, window_label)
- `simulate_text_input` (text, delay_ms, initial_delay_ms)
- `simulate_mouse_movement` (x, y, relative, click, button)
- `get_element_position` (selector_type, selector_value, window_label, should_click)
- `send_text_to_element` (selector_type, selector_value, text, window_label, delay_ms)

## Notes and guardrails

- Use `get_dom` and `execute_js` to inspect and query state before driving UI actions.
- Prefer `get_element_position` + `simulate_mouse_movement` for precise clicks.
- `send_text_to_element` may not update React state; fall back to `execute_js` or `simulate_text_input` if needed.
- If screenshots fail, confirm the app name and window label match the Tauri window you want.
