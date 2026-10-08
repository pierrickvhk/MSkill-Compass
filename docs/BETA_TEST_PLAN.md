# Beta acceptance plan — Slice 7

Date: 2026-10-09. Use synthetic data only. Test against the isolated production
origin http://localhost:3002 so existing development-origin learner records remain
untouched. Browser: Codex in-app browser on macOS. Automated checks use Vitest/jsdom
and pytest; those are distinguished from browser acceptance below.

## Executed first-journey checks

| Scenario | Observed result |
|---|---|
| Homepage → Explore | PASS: real 30-node/71-edge graph, desktop canvas, list and inspector loaded. |
| Search nonsense / clear | PASS: honest zero-results state; clear restores list. |
| Inspector → path s3 | PASS: Discover Copilot Studio deep link selected the correct milestone. |
| Complete stage / reload | PASS: 1 of 6 persisted after browser reload. |
| Path s6 → Builder Lab | PASS: linked workshop opened; all five phases available. |
| Mission notes / reload | PASS: synthetic café, Japanese and compass emoji text plus checked checkpoint persisted. |
| Evidence / unsafe URL | PASS: invalid repository URL displayed a useful error; valid workflow remained available. |
| Markdown preview | PASS: Unicode evidence and design-only/non-credential/untested labels visible as plain Markdown. |
| Mission reset cancel and confirm | PASS: Escape cancels and confirmation clears mission; path retained its 1 of 6 completion. |
| Path reset | PASS: separate confirmation returned path to 0 of 6. Only synthetic rehearsal records were cleared. |
| Radar navigation / cancellation filter | PASS: five upcoming records, zero cancelled, useful empty view and reset. |
| Radar → Access control | PASS: graph deep link opened correct inspector; reciprocal Radar topic link present. |
| Mobile list keyboard | PASS: search Power Automate, Enter selected correct inspector. |
| Launcher keyboard | PASS: Enter opened destinations; Escape restored focused trigger. |
| API unavailable | PASS: isolated API stopped; page displayed bounded unavailable error with Retry graph. PASS: after restart, Retry graph restored the same selected inspector. |
| Desktop/mobile layout | PASS for inspected 1440/390/375px states; screenshots and overflow checks recorded. Not exhaustive device coverage. |

Automated tests additionally cover corrupted/denied storage, version mismatches,
invalid/deep-link lookups, separate design/build records, completion rules, empty/API
failures, source validation and deterministic ordering. No tests were executed against
Microsoft tenant services and no actual learner competence was evaluated.

## Markdown download — MANUAL ACCEPTANCE PENDING

The browser button displayed “download prepared,” but the tooling's download event
wait timed out after 10 seconds and returned no filesystem path. **No successful
file download is claimed.** Unit tests verify Blob content/UTF-8 MIME, filename,
escaping, URL cleanup and no upload; browser preview verifies visible content only.

A tester must execute in supported Chrome/Edge and Safari:

1. Use Design-only mode and synthetic text `Fictional café — 日本語 🧭` in notes/evidence.
2. Add harmless HTML/Markdown-looking text (for example `<b>demo</b>` and `# demo`).
3. Download; confirm a real `mskill-first-agent-summary.md` exists in Downloads.
4. Open as UTF-8 and compare notes, mode, checkpoints, four manual scenario records,
   deliverables, references and self-report disclaimers with the preview.
5. Confirm text cannot become executable HTML or an injected active link when
   rendered in a safe Markdown viewer. The viewer has its own security obligations.
6. Confirm no application env/config secrets are inserted. Input deliberately remains
   in the export: users must remove any secrets they themselves typed before sharing.
7. Repeat download, refresh, and verify no unwanted blank tab/upload. Record browser
   version, OS, filename and result here. A prepared status alone is not acceptance.

Owner: release tester. Status: PENDING (no filesystem evidence).

## Remaining acceptance before broad beta

- Accessibility reviewer: VoiceOver/NVDA, all-keyboard completion, 320px/zoom, all
  contrast states, target sizes and actual reduced-motion preference.
- Content maintainer: accept the corrected CONTENT_AUDIT ledger; hands-on official exercise check
  in an authorized synthetic tenant, or keep all build instructions clearly untested.
- Release maintainer: hosted CI on a real commit, private security reporting,
  deployment/TLS/logging/container checks and license notices.
- Tester: fresh profile, blocked storage, tab reopening and exported file on each
  advertised browser. App-level automated fallback tests are not browser coverage.

Do not register for events, publish projects or share exports as part of these tests.
