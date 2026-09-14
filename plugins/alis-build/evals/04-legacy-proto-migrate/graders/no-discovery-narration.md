---
type: regex
target: last_message
match: not_contains
flags: i
---
(running|run|probing|probe|checking|check(ed)?|used|using|invoked?)\s+(the\s+)?(skill\s+)?(discovery|discover\b|catalog|registry)|alis skills (suggest|search)|no (matching|relevant|suitable|tracing|migration|\w+) skill (in|found|covers|available)|(couldn't|could not|didn't|did not|unable to) (find|check|search|reach) (a|any|the) (skill|registry|catalog)|not logged in|alis login|UNAUTHENTICATED|registry search
