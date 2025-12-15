<script lang="ts">
  import "./layout.css";
  import favicon from "$lib/assets/favicon.svg";
  import AppShell from "$lib/ui/appbar/AppShell.svelte";
  let { children } = $props();
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<AppShell>
  <div
    class="bg-surface-100-800-token border-surface-200-700-token mx-2 mb-2 w-auto overflow-hidden rounded-xl border-[1px] p-4 sm:mx-4 dark:bg-surface-950"
  >
    {@render children()}
  </div>
</AppShell>
