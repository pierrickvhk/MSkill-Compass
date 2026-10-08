# Security policy

MSkill Compass is pre-beta. Only the current candidate is being evaluated; there is
no supported public release yet. See [the security audit](docs/SECURITY_AUDIT.md).

Do not post exploit details, credentials or learner evidence in public issues.
A private reporting destination has not yet been configured. Establish a maintainer
contact or enable GitHub private vulnerability reporting before public beta; this is
a release blocker. Until then, report only a non-sensitive request for a private
channel to the project owner. No response-time guarantee is currently offered.

Progress and evidence stay in browser localStorage on the current origin. They are
not encrypted, synced, assessed or verified by Microsoft. Use synthetic data only.
A shared browser profile can expose notes to another user of that profile. Exported
Markdown includes what the learner wrote: it does not detect or remove secrets.

Maintainers: reproduce privately, assess exposure, add a focused regression test,
ship a compatible correction and document affected versions and mitigation. Review
npm and Python advisories before releases and weekly during beta. Do not merge
untrusted changes with deployment credentials available to their CI execution.
