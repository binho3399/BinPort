#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/git-common.sh"

ensure_git_repo

BRANCH="$(current_branch)"
REMOTE="origin"
MESSAGE=""
AUTO_COMMIT="true"

print_usage() {
  cat <<'EOF'
Usage:
  scripts/git-push.sh [branch] [remote]
  scripts/git-push.sh --branch <branch> --remote <remote> [--message "<msg>"] [--no-auto-commit]

Defaults:
  branch = current branch
  remote = origin

Behavior:
  - Auto-stages and auto-commits local changes before push.
  - Use --message to provide your own commit message.
  - Use --no-auto-commit to skip automatic commit.
EOF
}

POSITIONAL_INDEX=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    --branch)
      BRANCH="$2"
      shift 2
      ;;
    --remote)
      REMOTE="$2"
      shift 2
      ;;
    --message|-m)
      MESSAGE="$2"
      shift 2
      ;;
    --no-auto-commit)
      AUTO_COMMIT="false"
      shift
      ;;
    --help|-h)
      print_usage
      exit 0
      ;;
    *)
      if [[ ${POSITIONAL_INDEX} -eq 0 ]]; then
        BRANCH="$1"
      elif [[ ${POSITIONAL_INDEX} -eq 1 ]]; then
        REMOTE="$1"
      else
        echo "Error: unexpected argument '$1'"
        print_usage
        exit 1
      fi
      POSITIONAL_INDEX=$((POSITIONAL_INDEX + 1))
      shift
      ;;
  esac
done

if has_working_changes; then
  if [[ "${AUTO_COMMIT}" == "true" ]]; then
    git add -A
    if ! git diff --cached --quiet; then
      if [[ -z "${MESSAGE}" ]]; then
        MESSAGE="$(generate_auto_commit_message)"
      fi
      echo "Auto committing changes with message: ${MESSAGE}"
      git commit -m "${MESSAGE}"
    fi
  else
    echo "Warning: local changes detected and --no-auto-commit is set."
    echo "Only committed changes will be pushed."
  fi
fi

echo "Pushing ${BRANCH} to ${REMOTE}..."
git push -u "${REMOTE}" "${BRANCH}"
