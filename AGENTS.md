<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Team draw logic lives in src/lib/draw.ts as a pure function with tests; why: keeps the balancing rule testable apart from the UI.
- FIFO arrival is immutable and serialized on the match row; removals, presence, draws and modality changes reflow teams atomically through database functions, while queue_index is compacted independently; why: concurrent arrivals and substitutions cannot corrupt the queue.
- TacticalPitch is shared by lobby and live screens, with complete queued teams derived in src/lib/fifo.ts; why: both views show the same active lineup and waiting order.
- Data access is client-side via the browser backend client with row-level security and operation-scoped database functions (creator manages; mesários operate live matches); why: no server secrets needed.
- Internal screens use shared TanStack Query options with loader priming; why: keeps initial reads and post-action refreshes consistent.
- Live event counters are updated atomically by a database trigger on event insertion/deletion; why: scores and individual statistics cannot partially save.
- Shared page metadata and match presentation helpers live in focused modules; why: every content screen has consistent metadata and reusable score presentation.
- Automatic awards use a pure performance module matching database scoring, with shared cards and root-scoped round queries; why: deterministic results stay separate from overall and update for all viewers.
- Award messages are shared per player and pelada across their award cards; why: the existing root-scoped permission model protects one saved message without extra storage.

- Tournament scheduling uses tournament-pairings through pure helpers; why: established pairing logic stays independently testable.
- Match roles are pelada-scoped and clock state is persisted atomically; why: mesário permissions and elapsed time remain consistent across viewers.
- Tournament result writes include optional individual scorers atomically; why: team history and top scorers use recorded data rather than estimates.
- Social lookup pages are authenticated and follow lists are owner-scoped; why: search and comparisons respect the selected visibility boundaries.
- Profile achievements use pure history thresholds and existing automatic award selection, with a separate canvas Stories exporter; why: prevents invented awards and keeps export independent of profile storage.
- Competitive ranking is derived by an authenticated database read function and independently tested pure scoring helpers; why: rankings cannot accept browser-supplied scores or alter MVP and OVR.
- Organizer corrections use an audited operation and event writes reuse a stable operation ID; why: legitimate corrections remain available while direct counter edits and retry duplicates cannot silently affect competitive results.
- Ranking components and scoped query hook are separate from match screens, with authenticated read-only athlete profiles; why: future ranking scopes can reuse data and presentation without expanding editing permissions.
- Home presentation lives in focused home components and pure insight helpers reusing unchanged account and pelada queries; why: personal indicators and news remain testable without changing storage or Results.
- Creation uses a shared form and atomic create_pelada operation, with the lobby in MatchLobby and a scoped synchronization hook; why: modal and direct creation cannot diverge or partially save participation.
- Lobby chat uses dedicated participant-scoped storage, database moderation and matching pure client checks; why: award messages remain untouched and browser bypasses cannot expose or send unauthorized chat.
- Friendly duels use participant-only storage and revision-checked atomic operations, separate from competitive matches; why: corrections require fresh opponent approval and cannot affect ranking.
