# Knex raw-query surface audit

Checked against Knex 3.3.0 (npm latest, 2026-09-27),
https://knexjs.org/guide/raw.html and https://knexjs.org/guide/query-builder.html.

| Method | Default in 0.2.x | Binding example | Unsafe interpolation example |
| --- | --- | --- | --- |
| `raw` | yes | `knex.raw('select ?', [id])` | ``knex.raw(`select ${id}`)`` |
| `whereRaw` | yes | `knex('t').whereRaw('id = ?', [id])` | ``knex('t').whereRaw(`id = ${id}`)`` |
| `joinRaw` | yes | `knex('t').joinRaw('join u on u.id = ?', [id])` | ``knex('t').joinRaw(`join u on u.id = ${id}`)`` |
| `orWhereRaw` | no | `knex('t').orWhereRaw('id = ?', [id])` | ``knex('t').orWhereRaw(`id = ${id}`)`` |
| `havingRaw` | no | `knex('t').havingRaw('count(*) > ?', [n])` | ``knex('t').havingRaw(`count(*) > ${n}`)`` |
| `orHavingRaw` | no | `knex('t').orHavingRaw('count(*) > ?', [n])` | ``knex('t').orHavingRaw(`count(*) > ${n}`)`` |
| `groupByRaw` | no | `knex('t').groupByRaw('coalesce(??, ?)', ['name', 'n/a'])` | ``knex('t').groupByRaw(`${column}`)`` |
| `orderByRaw` | no | `knex('t').orderByRaw('?? asc', [column])` | ``knex('t').orderByRaw(`${column} asc`)`` |

The rule inspects only the first SQL argument. Knex `?` binds values and `??`
binds identifiers; a plain string used as a binding value is not SQL text.
`knex.schema.raw(...)` also accepts SQL and is handled by the configured builder
filter (#16). `knex.raw(...)` and builder `.raw(...)` share the same method
spelling. Dynamic/computed method names and user-defined raw wrappers need
different analysis; neither is included in this audit.

In 0.3.0, all listed methods are checked by default. This intentionally
changes findings for the five methods marked "no" above: unsafe interpolation
reports, while bound queries remain valid.
