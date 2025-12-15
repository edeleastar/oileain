<script lang="ts">
  import { type Snippet } from "svelte";
  import MainAppBar from "./MainAppBar.svelte";
  type Props = { children: Snippet };
  let { children }: Props = $props();
</script>

<div class="flex h-screen flex-col">
  <header class="sticky top-0 z-10 m-4 w-auto rounded-xl border-[1px] bg-surface-100 p-1 dark:bg-surface-950">
    <MainAppBar />
  </header>
  <main class="flex-1 overflow-y-auto">
    {@render children()}
  </main>
</div>
