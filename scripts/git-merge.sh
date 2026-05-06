#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/git-common.sh"

ensure_git_repo

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <source-branch> [target-branch]"
  exit 1
fi

SOURCE_BRANCH="$1"
TARGET_BRANCH="${2:-$(current_branch)}"

if [[ "${SOURCE_BRANCH}" == "${TARGET_BRANCH}" ]]; then
  echo "Error: source and target branch cannot be the same."
  exit 1
fi

echo "Checking out target branch: ${TARGET_BRANCH}"
git checkout "${TARGET_BRANCH}"

echo "Merging ${SOURCE_BRANCH} into ${TARGET_BRANCH}..."
git merge --no-ff "${SOURCE_BRANCH}"
