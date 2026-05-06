#!/usr/bin/env bash
set -euo pipefail

ensure_git_repo() {
  if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    echo "Error: current directory is not a git repository."
    exit 1
  fi
}

current_branch() {
  git rev-parse --abbrev-ref HEAD
}

ensure_clean_staging_for_commit() {
  if git diff --cached --quiet; then
    echo "Error: nothing staged. Run 'git add <files>' first."
    exit 1
  fi
}

ensure_commit_message() {
  if [[ $# -lt 1 ]]; then
    echo "Usage: $0 \"your commit message\""
    exit 1
  fi
}

has_working_changes() {
  if ! git diff --quiet; then
    return 0
  fi
  if ! git diff --cached --quiet; then
    return 0
  fi
  if [[ -n "$(git ls-files --others --exclude-standard)" ]]; then
    return 0
  fi
  return 1
}

generate_auto_commit_message() {
  local staged_files
  staged_files="$(git diff --cached --name-only)"

  if [[ -z "${staged_files}" ]]; then
    echo "chore: update codebase"
    return
  fi

  local top_levels
  top_levels="$(printf "%s\n" "${staged_files}" | awk -F/ '{print $1}' | sort -u | paste -sd, -)"

  local only_docs
  only_docs="$(printf "%s\n" "${staged_files}" | awk 'BEGIN{ok=1} !/^docs\// {ok=0} END{print ok}')"

  if [[ "${only_docs}" == "1" ]]; then
    echo "docs: update project documentation"
  elif printf "%s\n" "${staged_files}" | rg -q '^src/'; then
    echo "feat: update codebase in ${top_levels}"
  elif printf "%s\n" "${staged_files}" | rg -q '^scripts/'; then
    echo "chore: update automation scripts"
  else
    echo "chore: update project files in ${top_levels}"
  fi
}
