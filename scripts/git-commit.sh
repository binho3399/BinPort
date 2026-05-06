#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/git-common.sh"

ensure_git_repo
ensure_commit_message "$@"
ensure_clean_staging_for_commit

MESSAGE="$1"

git commit -m "$MESSAGE"
echo "Committed on branch: $(current_branch)"
