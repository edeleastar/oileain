<script lang="ts">
  import { AppBar } from "@skeletonlabs/skeleton-svelte";
  import { currentIsland, currentView } from "$lib/runes.svelte";
  import Icon from "../components/Icon.svelte";
  import Separator from "../components/Separator.svelte";
</script>

<AppBar>
  <AppBar.Toolbar class="grid-cols-[auto_1fr_auto]">
    <AppBar.Lead>
      <div class="flex items-center gap-6">
        <Separator />
        <Icon type="oileain" height="80"></Icon>
      </div>
    </AppBar.Lead>
    <AppBar.Headline>
      <h1>Oileain: islands of Ireland : {currentView.value}</h1>
      {#if currentIsland.value}
        {@html currentIsland.value.nameHtml}
      {:else}
        <b> Select a marker to explore island...</b>
      {/if}
    </AppBar.Headline>
    <AppBar.Trail>
      <Icon type="home" link="/" height="64" tip="Home"></Icon>
      <Separator />
    </AppBar.Trail>
  </AppBar.Toolbar>
</AppBar>
