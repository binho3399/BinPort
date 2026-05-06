#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/git-common.sh"

ensure_git_repo

BRANCH="${1:-$(current_branch)}"
REMOTE="${2:-origin}"

echo "Pulling ${REMOTE}/${BRANCH}..."
git pull --ff-only "${REMOTE}" "${BRANCH}"
