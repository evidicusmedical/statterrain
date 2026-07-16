# StatTerrain v0.3.9 — SOO Requirements Traceability

COMPLETE — SOO REQUIREMENTS TRACEABILITY ACTIVATED

This release adds a typed, static registry of 30 stable `ST-SOO-###` research requirements with controlled statuses, domains, capability mappings, source dependencies, limitations, roadmap metadata, validation, summary selectors, and current-analysis relevance mapping. Requirements are presented inside the Evidence Brief with accessible filtering and native disclosure details; there is no new persistent workspace panel.

Evidence JSON now includes `requirementsTraceability`; Markdown has a compact requirements section; and a dedicated requirements traceability JSON download exports the full registry. AHA facility attributes are explicitly a future inactive licensed-data dependency. Real-time operational availability is explicitly out of scope. No AHA data, crosswalk, scenario persistence, routing, or analytical-method changes were added.

Validation: `npm run test:soo-registry`. The production version and health endpoint are `v0.3.9 prototype`.
