# Empirical Observations Log — Devin test/execution environment

All items below were DIRECTLY OBSERVED by running the tools in this session on
Linux/Ubuntu, home=/home/ubuntu, repos=/home/ubuntu/repos. Node v20.18.1,
bun 1.3.14, npx present. python3 present but WITHOUT pytest module.

## Tools observed to exist (relevant to code exec / testing / repo / files)
- exec: run shell command (bash). Params seen used: command, shell_id, tty,
  timeout, workdir, env.
- get_output: read output of a backgrounded/persistent shell (shell_id, timeout,
  incremental).
- write_to_process: send stdin to a running interactive process (shell_id,
  text_input | bytes_input).
- kill_shell: terminate a background/persistent shell (shell_id).
- read: read a file (file_path, offset, limit).
- write: create/overwrite a file (file_path, content).
- edit: exact string replace (file_path, old_string, new_string, replace_all).
- MultiEdit: multiple sequential exact replacements atomically in one file.
- grep: ripgrep-backed search (pattern, path, glob_pattern, output_mode,
  case_insensitive, context_lines, max_results).
- (others present but not core to this task: git tools, browser/computer,
  sidekick, todo_write, message_user, notebook tools, scripted_tools, etc.)
- NOTE (Observed): there is NO first-class "run tests" or "test results" tool.
  Tests are executed via `exec` invoking the project's own runner; results are
  plain stdout/stderr text.

## EXEC — one-shot behavior
- OBS: Runs under bash (`bash: line N: ...` in errors).
- OBS: Reports a single "Exit code: N" = exit status of the LAST command in the
  command string. `false` -> Exit code 1. `(exit 7); echo` -> Exit code 0.
  `node --test` (real rc=1) followed by `echo` -> wrapper Exit code 0, while the
  runner's own rc was captured via `$?` = 1.
- OBS: stdout and stderr are both captured and merged into one stream. Ordering
  between them is NOT guaranteed (saw "hello-stderr" printed before
  "hello-stdout" due to buffering).
- OBS: Missing command -> rc 127 ("command not found"). Missing file to `ls` ->
  rc 2. Both still returned wrapper Exit code 0 because a trailing echo was last.
- OBS: One-shot calls do NOT share state. A second one-shot started in
  /home/ubuntu even though a prior one-shot `cd`-ed elsewhere.
- OBS: `workdir` param sets cwd for that call (confirmed pwd == workdir).
- OBS: `env` param injects env vars visible to the command (FIXTURE_VAR seen).

## EXEC — persistent session (shell_id + tty:true)
- OBS: State persists across calls in same shell_id: env var PERSIST_VAR, cwd,
  and the SAME shell PID (5271) were retained on a later call.
- OBS: Interactive REPL works: started `python3 -i`, later `write_to_process`
  sent code, `get_output` returned the evaluated results (`42`, `[0,1,4,9]`).
- OBS: get_output default returns an INCREMENTAL unified diff since last read
  ('+' new lines, ' ' context, '@@' indices). (incremental defaults true.)

## EXEC — backgrounding / timeouts
- OBS: A `sleep 30` with timeout=3000ms stopped waiting after ~3s and returned
  "Command running in background with ID: <shell_id>. Run get_output ...".
- OBS: get_output with a longer timeout later returned the completed output
  ("done sleeping", Exit code 0). So long commands are auto-backgrounded, not
  killed, when the call timeout elapses.
- OBS: kill_shell terminates a running shell ("Shell <id> terminated
  successfully").

## Output size / truncation
- OBS: ~1050 short numeric lines (~4 KB) were returned FULLY INLINE.
- OBS: A ~50,000-line (multi-MB) output was TRUNCATED inline (head ~105 lines +
  tail ~230 lines shown) and the FULL output written to an overflow file:
  /home/ubuntu/.devin-files/devin-remote-0.24.0-overflows-1000/shell-<id>-<hash>/content.txt
  (tool result included a <file-view> preview + "… N lines omitted …").
- INFERRED: inline cap is size/byte-based, not a fixed line count (1050 lines
  fit; 50k did not). Long individual lines are also truncated (saw
  "… N chars truncated" per line; read tool docs say >2000 chars/line truncated).

## FILE TOOLS
- read: OBS follows symlinks (read link.txt -> target content). Missing file ->
  "validation failed: ... not found". Binary/non-UTF8 file -> "validation
  failed: file is not valid UTF-8 text". Output shown as numbered <file-view>.
- write: OBS creates file ("File created successfully at: <path>"), overwrites.
- edit: OBS exact replace; errors:
    * old_string not present -> "String not found in file".
    * old_string appears >1x without replace_all -> "String not unique in file.
      Found N occurrences ... use replace_all=true".
    * old_string == new_string -> "old_string and new_string must be different".
  OBS: an edit succeeded on a file that had only been `write`-created (no
  intervening `read`) — the read-before-edit requirement was satisfied by the
  prior write / not strictly blocked here.
  OBS: editing a chmod 444 read-only file -> "permission denied".
- MultiEdit: sequential atomic edits (not separately re-tested this session;
  schema documents sequential application, each old_string must be unique after
  prior edits).

## grep tool
- OBS: ripgrep-backed. Case-SENSITIVE by default ("DUP" did not match "dup";
  "beta" matched). Returns per-file grouped matches with line numbers.

## Filesystem / OS / permissions / boundaries
- OBS: Runs as unprivileged user `ubuntu`. hostname = devin-box.
- OBS: Can read system files (/etc/hostname). Can write /tmp. CANNOT write to /
  (permission denied) — normal Linux DAC, not a special repo sandbox.
- OBS: No repo-boundary jail observed: freely created/read files under
  /home/ubuntu/harness-fixture (outside any repo). Boundaries are standard Unix
  file permissions, not a harness-enforced path allowlist.
- OBS: chmod/symlink/binary files behave as normal Linux (ln -s, chmod 750
  executable ran, chmod 444 blocks append).

## Test runners
- OBS: `node --test` produces TAP v13: per-subtest ok/not ok, `# SKIP`,
  duration_ms, location 'file:line:col', failureType, error, code, name,
  expected, actual, operator, and a full `stack`. Summary: `# tests/pass/fail/
  skipped/todo/duration_ms`. Exit code 1 on failure.
- OBS: system python3 lacks pytest (module not found) — pytest would need install.
- INFERRED: any framework works if invoked via exec; the harness itself does not
  parse results — the agent/reader interprets stdout.

## BROWSER / UI-TESTING / RECORDING capabilities (for web-app testing extension)
- OBS: A Chrome CDP endpoint is live at http://localhost:29229. `/json/version`
  returned Chrome/133.0.6943.126, Protocol-Version 1.3, and a
  webSocketDebuggerUrl (ws://localhost:29229/devtools/browser/<id>). `/json`
  lists targets (pages/extensions) each with a webSocketDebuggerUrl. => Playwright
  / any CDP client can ATTACH to the already-running browser (connectOverCDP).
- OBS: `computer` tool = GUI automation in a scaled 1024x768 coordinate space
  (mapped to real resolution automatically). Actions: key, type, mouse_move,
  left/right/middle/double/triple_click, left_click_drag, left_mouse_down/up,
  scroll, hold_key, wait, screenshot, cursor_position, zoom (region), read_dom.
  Multiple actions can be batched per call; only the last (or explicit
  screenshot) returns an image. When Chrome is foreground it AUTO-WAITS for page
  load via CDP before screenshotting and returns the page HTML/annotated DOM
  alongside the screenshot (omitted if too large -> use read_dom).
- OBS: `browser_console` tool = view recent console output and optionally run JS
  in the page. Only works when Chrome is foreground.
- OBS: Recording tools (screen video of GUI):
  * `recording_start` (optional recording_id; hide_cursor default true; only ONE
    active recording at a time).
  * `annotate_recording` types: `setup` (description), `test_start` (test, in
    "It should ..." style), `assertion` (test [must match a test_start],
    test_result in {passed,failed,untested}, assertion text). Video slows around
    annotations.
  * `recording_stop` (title <=5 words; summary <=4 sentences, lead with pass/fail)
    -> returns a processed video path.
  * OBS: recording tools CANNOT be invoked from scripted_tools (must be direct).
- OBS: `save_browser_profile` persists cookies/logins across sessions;
  `download_attachment` fetches Devin attachment URLs to the box;
  `generate_image` creates images; `web_search` for web lookups.
- OBS: Secrets flow — `request_secret` (UI prompt; ${NAME} auto-substituted in
  browser/computer fields, or bound via exec env as secret:session:NAME; TOTP
  via ${_2FA_NAME}); `list_secrets` lists references (never values).
- INFERRED: End-to-end web-app testing therefore combines: exec (start dev
  server / run headless suites) + computer/browser_console/CDP-Playwright (drive
  UI, read DOM, capture console) + recording_start/annotate/stop (visual proof)
  + message_user with attachments (deliver findings + video). There is NO single
  "test web app" tool — it is an orchestration of these primitives.
