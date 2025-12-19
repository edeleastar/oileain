<script lang="ts">
  import Menu from "$lib/ui/components/Menu.svelte";
  import Icon from "$lib/ui/components/Icon.svelte";
  import LightModeSelector from "./LightModeSelector.svelte";
  import ThemeSelector from "./ThemeSelector.svelte";
  import MapProviderSelector from "./MapProviderSelector.svelte";
</script>

{#snippet menuSelector()}
  <div class="flex items-center rounded-lg p-4 hover:preset-tonal-secondary dark:hover:preset-tonal-tertiary">
    <Icon type="lightMode" height="40" tip="Open Theme Menu" />
  </div>
{/snippet}

{#snippet menuContent()}
  <div class="ml-2 font-bold">Layout Options</div>
  <div class="relative z-9999 mt-5 mb-5">
    <LightModeSelector />
    <hr />
    <ThemeSelector />
    <hr />
    <MapProviderSelector />
  </div>
{/snippet}

<Menu {menuSelector} {menuContent} />
