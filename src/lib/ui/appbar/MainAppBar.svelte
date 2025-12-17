<script lang="ts">
  import { AppBar } from "@skeletonlabs/skeleton-svelte";
  import { currentIsland, currentView } from "$lib/runes.svelte";
  import Icon from "../components/Icon.svelte";
  import Separator from "../components/Separator.svelte";
  import InfoSidebar from "./sidebar/InfoSidebar.svelte";
  import CoastSidebar from "./sidebar/CoastSidebar.svelte";
  import LayoutMenu from "./sidebar/LayoutMenu.svelte";
</script>

<AppBar>
  <AppBar.Toolbar class="grid-cols-[auto_1fr_auto]">
    <AppBar.Lead>
      <div class="flex items-center gap-6">
        <InfoSidebar />
        <Separator />
        <Icon type="oileain" height="80"></Icon>
      </div>
    </AppBar.Lead>
    <AppBar.Headline>
      <h1 class="text-2xl">Oileain: Islands of Ireland : {currentView.value}</h1>
      {#if currentIsland.value}
        {@html currentIsland.value.nameHtml}
      {:else}
        <b> Select a marker to explore island...</b>
      {/if}
    </AppBar.Headline>
    <AppBar.Trail>
      <Icon type="home" link="/" height="64" tip="Home" view="Home"></Icon>
      <Icon type="explorer" link="/explorer" height="64" tip="Navigator" view="Explorer"></Icon>
      <Icon type="navigator" link="/navigator/Great-Saltee-Island" height="64" tip="Explorer" view="Navigator"></Icon>
      <Separator />
      <LayoutMenu />
      <CoastSidebar />
    </AppBar.Trail>
  </AppBar.Toolbar>
</AppBar>
