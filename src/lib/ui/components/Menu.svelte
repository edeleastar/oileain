<script lang="ts">
  import { Menu, Portal } from "@skeletonlabs/skeleton-svelte";
  let { menuSelector, menuContent } = $props();
</script>

<Menu>
  <Menu.Trigger>{@render menuSelector()}</Menu.Trigger>
  <Portal>
    <Menu.Positioner>
      <Menu.Content class="z-50 m-4 max-w-[500px] space-y-4 card preset-filled-surface-100-900">
        <nav class="w-56 w-full space-y-2 p-2">
          {@render menuContent()}
        </nav>
      </Menu.Content>
    </Menu.Positioner>
  </Portal>
</Menu>
