#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# --- Colors ---
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

info()  { echo -e "${GREEN}[INFO]${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# --- Step 1: Install dependencies ---
info "Installing dependencies..."
if command -v pnpm &>/dev/null; then
  pnpm install
elif command -v npm &>/dev/null; then
  npm install
else
  error "Neither pnpm nor npm found. Please install Node.js first."
fi

# --- Step 2: Build ---
info "Building TypeScript..."
npx tsc
info "Build complete: dist/"

# --- Step 3: Read config ---
SERVER_NAME=$(node -e "console.log(require('./config/mcporter.json').name)")
info "Server name: $SERVER_NAME"

# --- Step 4: Register MCP Server with mcporter (optional) ---
if command -v mcporter &>/dev/null; then
  info "Registering MCP server with mcporter..."
  mcporter add "$SERVER_NAME" --command "node" --args "$SCRIPT_DIR/dist/index.js"
  info "MCP server registered: $SERVER_NAME"
else
  warn "mcporter not found. Skipping MCP registration."
  warn "To use with Claude Code, add to your MCP config manually:"
  echo ""
  echo "  {\"mcpServers\":{\"$SERVER_NAME\":{\"command\":\"node\",\"args\":[\"$SCRIPT_DIR/dist/index.js\"]}}}"
  echo ""
fi

# --- Step 5: Install Skill (optional) ---
SKILL_DIR="$HOME/.openclaw/skills/$SERVER_NAME"
SKILL_FILE="$SCRIPT_DIR/skill/SKILL.md"

if [ -f "$SKILL_FILE" ]; then
  info "Installing OpenClaw skill to $SKILL_DIR..."
  mkdir -p "$SKILL_DIR"
  cp "$SKILL_FILE" "$SKILL_DIR/SKILL.md"
  info "Skill installed: $SKILL_DIR/SKILL.md"
else
  warn "No skill/SKILL.md found. Skipping skill installation."
fi

# --- Done ---
echo ""
info "Setup complete!"
echo ""
echo "  Test with:  echo '{\"method\":\"tools/list\"}' | node dist/index.js"
echo ""
if command -v mcporter &>/dev/null; then
  echo "  mcporter:   mcporter call '$SERVER_NAME.get_weather(city:\"Beijing\")'"
fi
echo ""
