# Calendar reference implementation

The supplied hierarchy remains: tracker header, heading/Rules, year-at-a-glance banner, month navigation, Sunday-first grid, legend, period tabs, statistics, floating Check In/restart, and four-tab navigation. Unified tokens replace inconsistent pale-purple surfaces and tiny text.

- Seven columns align actual adjacent-month dates. Today/selection are outlined; future entries are disabled. Past/current dates open a native check-in sheet.
- Alcohol categories are 0 green, 1-2 yellow, 3-5 orange, 6+ red, and memory gap/blackout dark. Blackout overrides count and may have an unknown count. Categories are tracking labels, not health recommendations.
- Other trackers support clean/urge/use plus optional saved count/minute units. Custom setup offers status/count/minutes. Renaming preserves metric/unit; unknown quantities stay unknown. Contradictory counts or impossible daily minutes are rejected.
- Private notes remain per tracker/local date. The latest saved entry per date is used. Missing/future days never count as clean. Historical edits preserve the timer; today's first use restarts it once, while editing does not repeatedly restart it.
- Week/Month are free. Year/All use central mock Premium access with locked previews. Expiry returns to Month without deleting records.
- Year overview has a year selector, zero-use days, check-ins, best recorded streak, rate, and twelve interactive months. It switches from two to one column on narrow/large-text layouts. Month selection returns to the grid; future years are disabled.
- Advanced statistics uses actual records, including known/unknown quantities; its locked preview shows no fabricated sample figures.
- Story/Post cards capture the native vector preview at 1080 x 1920 / 1080 x 1350. Tracker name is optional; notes/triggers are excluded. Save writes app files; Share opens the native chooser.

Calendar savings use zero-use **logged days**; Progress estimates use **live elapsed time**. Empty rates display a dash. Text/status labels accompany colors. Optional consumption/quantity fields remain compatible with the existing version-2 archive and validate during restore.

Inactive tabs cannot receive input/accessibility focus or show their dialogs. Large-text action clearance and scroll padding protect navigation.

Seven Calendar and two quantity tests passed within the 41-test suite. Actual sheet/keyboard behavior, image fidelity, file sharing, long labels, all periods, and twelve-month interaction need post-change device acceptance. October 14 screenshots informed the title/footer corrections; see [device flow audit](DEVICE-FLOW-AUDIT.md) and [validation](VALIDATION.md).

