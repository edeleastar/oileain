<script lang="ts">
  import Icon from "@iconify/svelte";
  import { Portal, Tooltip } from "@skeletonlabs/skeleton-svelte";
  import { getIconColour, getIconType } from "../themes/icons";
  import { currentView } from "$lib/runes.svelte";

  interface Props {
    type?: string;
    icon?: string;
    color?: string;
    link?: string;
    target?: string;
    width?: string;
    height?: string;
    tip?: string;
    text?: string;
    view?: string;
  }

  let {
    type = "",
    icon = "",
    color = "",
    link = "",
    target = "",
    width = "",
    height = "20",
    tip = $bindable(""),
    text = "",
    view = ""
  }: Props = $props();

  // svelte-ignore state_referenced_locally
  if (target === "_blank") {
    tip = `${tip} (opens in a new Window)`;
  }

  // Check if the current view matches the view prop using Svelte 5 runes
  const isActive = $derived(view ? currentView.value === view : false);
</script>

{#snippet displayIcon()}
  {#if type}
    {#if link}
      <div class="flex items-center rounded-lg p-2 hover:preset-tonal-secondary dark:hover:preset-tonal-tertiary {isActive ? 'border-2 border-primary-500' : ''}">
        <a class="btn btn-sm" {target} href={link}>
          <Icon icon={getIconType(type)} color={getIconColour(type)} {width} {height} />
          {text}
        </a>
      </div>
    {:else}
      <Icon icon={getIconType(type)} color={getIconColour(type)} {width} {height} />
    {/if}
  {:else if link}
    <a {target} href={link} class={isActive ? 'border-2 border-primary-500 rounded-lg p-1' : ''}>
      {color}
      <Icon {icon} {color} {width} {height} />
    </a>
  {:else}
    <Icon {icon} {color} {width} {height} />
  {/if}
{/snippet}

{#if tip}
  <Tooltip>
    <Tooltip.Trigger>
      {@render displayIcon()}
    </Tooltip.Trigger>
    <Portal>
      <Tooltip.Positioner>
        <Tooltip.Content class="z-9999 max-w-md card bg-surface-100-900 p-2 shadow-xl">
          {tip}
        </Tooltip.Content>
      </Tooltip.Positioner>
    </Portal>
  </Tooltip>
{:else}
  {@render displayIcon()}
{/if}
