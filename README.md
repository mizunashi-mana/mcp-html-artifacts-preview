# mcp-html-artifacts-preview

An MCP server that lets AI assistants instantly preview generated HTML in your browser.

## What is this?

When AI coding assistants generate HTML, CSS, or JavaScript, you usually need to manually save files and open them in a browser. This MCP server eliminates that friction — your AI assistant sends HTML directly through MCP tools, and it appears in your browser instantly with hot-reload support.

Built on the [Model Context Protocol (MCP)](https://modelcontextprotocol.io/), it works with any MCP-compatible AI assistant like Claude Code.

## Features

- **Instant Preview** — AI-generated HTML renders in your browser immediately
- **Hot Reload** — Pages update in real-time when content changes
- **Dynamic Port Allocation** — Multiple sessions can run simultaneously without port conflicts
- **CDN Script Support** — Load Mermaid.js, Chart.js, or any CDN library for rich visualizations
- **Zero Config** — Just add to your MCP settings and go

## Quick Start

Add to your MCP client configuration:

```json
{
  "mcpServers": {
    "html-artifacts-preview": {
      "command": "npx",
      "args": ["mcp-html-artifacts-preview"]
    }
  }
}
```

## MCP Tools

| Tool | Description |
|------|-------------|
| `create_page` | Create an HTML page and get a browser-accessible URL |
| `update_page` | Update page content (triggers hot reload) |
| `destroy_page` | Remove a page |
| `get_pages` | List all created pages |
| `get_page` | Get the HTML content of a specific page |
| `add_scripts` | Add CDN scripts (e.g., Mermaid.js, Chart.js) |
| `add_stylesheets` | Add external stylesheets |

## Use Cases

- Preview AI-generated HTML/CSS/JS instantly
- Visualize discussions with charts, comparison tables, and diagrams
- Render Mermaid diagrams, flowcharts, and architecture diagrams
- Create interactive data visualizations during technical surveys

## License

Licensed under Apache-2.0 OR MPL-2.0.
