---
title: Comparison
---

Récivi is very similar to [JSON Resume](https://jsonresume.org/), another
project that defines a standard schema for résumés. It can be considered a newer
alternative to that project.

Going up against such a mature project comes with its own pros and cons.

## Pros

Récivi's schema is much more detailed. If you only go by number of lines, JSON
Resume's schema has ~500 lines of code.
[Récivi's JSON schema](/schemas/recivi-resume.json), even without references,
languages, awards and publications (which haven't been standardised yet), has
~1100 lines of code.

JSON Resume wants to be a résumé for developers. While that makes sense because
JSON, as a format is unlikely to be used by non-tech savvy folks, Récivi
believes that résumés are relevant to everyone. So we want the schema to be
generic and extensible and we want the tooling to make the format accessible to
non-technical users.

## Cons

JSON Resume is already stable, at version 1.0.0. This has helped build an an
ecosystem around it. It's got a number of
[themes](https://jsonresume.org/themes) and
[projects](https://jsonresume.org/projects) that are using it. Récivi is new,
rapidly evolving and isn't stable _yet_. We want to build a community and
ecosystem around our schema too, once it is mature enough!
