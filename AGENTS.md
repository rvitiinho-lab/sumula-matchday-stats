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
- Data access is client-side via the browser backend client with row-level security (creator-only updates); why: no server secrets needed.
- Internal screens use shared TanStack Query options with loader priming; why: keeps initial reads and post-action refreshes consistent.
- Live event counters are updated atomically by a database trigger on event insertion/deletion; why: scores and individual statistics cannot partially save.
- Shared page metadata and match presentation helpers live in focused modules; why: every content screen has consistent metadata and reusable score presentation.
