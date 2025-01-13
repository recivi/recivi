---
title: Introduction
---

Récivi is a new kind of résumé for computers and humans, in that order.

## Concept

Récivi is built on the notion that data is what matters in a résumé. In a
typical résumé, we might see the following data about the applicant:

- their educational background
- their experience in various previous jobs
- the projects that they've worked on
- the skills that they bring to the table

This is the kind of data that one usually has to fill up manually on every ATS
site they apply through, even if they've attached their résumé. That's because
it's very hard to reliably extract this data from a human-readable résumé.

Récivi approaches this from the opposite side. Instead of extracting data for
computers from a résumé meant for humans, it renders a résumé for humans from
data meant for computers.

This data can be stored in any structured format. JSON and YAML would likely be
your best options, considering how deeply nested this type of data can get and
how the data file is most likely to be written by hand.

## Schema

When you have data, you need a structured way to represent it. Récivi tries to
define a schema for résumés with the goal of describing every possible kind of
résumé.

## Validators

Récivi provides validators to make sure that the data file complies with the
schema. By ensuring compliance, one can be sure that their data will be
understood by ATS software that complies with Récivi.

## Types

To encourage the next generation of apps built on top of Récivi, it provides
TypeScript types that can be used out of the box to build these applications. It
makes it very easy for software to utilise Récivi.

## Renderers

Finally, when a résumé is meant to be seen by people, Récivi provides renderers
that can convert it into a readable page. Renderers can be traditional whose
output is a static page meant to be printed, or modern, whose output is an
interactive web page.
