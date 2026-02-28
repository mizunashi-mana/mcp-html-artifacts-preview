{ pkgs, lib, config, inputs, ... }:

{
  # https://devenv.sh/packages/
  packages = [];

  # https://devenv.sh/languages/
  languages.javascript.enable = true;
  languages.javascript.npm.enable = true;

  # https://devenv.sh/scripts/
  scripts.lint-all.exec = ''
    prek run --all-files
  '';
  scripts.cc-edit-lint-hook.exec = ''
    "$DEVENV_ROOT/scripts/cc-edit-lint-hook.mjs"
  '';

  # https://devenv.sh/git-hooks/
  git-hooks.hooks.actionlint = {
    enable = true;
    entry = "actionlint";
    files = "^.github/workflows/.*\.ya?ml$";
  };
  git-hooks.hooks.npx-eslint-pkg-eslint-config = {
    enable = true;
    entry = "./scripts/run-script.mjs --cwd packages/eslint-config -- npx eslint --cache --fix FILES";
    files = "^packages/eslint-config/.*\.[cm]?(js|ts)x?$";
  };
  git-hooks.hooks.npx-eslint-pkg-mcp-html-artifacts-preview = {
    enable = true;
    entry = "./scripts/run-script.mjs --cwd packages/mcp-html-artifacts-preview -- npx eslint --cache --fix FILES";
    files = "^packages/mcp-html-artifacts-preview/.*\.[cm]?(js|ts)x?$";
  };

  # See full reference at https://devenv.sh/reference/options/
}