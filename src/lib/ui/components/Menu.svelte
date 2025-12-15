<script lang="ts">
  import { Menu, Portal } from "@skeletonlabs/skeleton-svelte";
  let { menuSelector, menuContent } = $props();
</script>

<Menu>
  <Menu.Trigger>{@render menuSelector()}</Menu.Trigger>
  <Portal>
    <Menu.Positioner>
      <Menu.Content class="z-999  m-4 max-w-[500px] space-y-4 card bg-surface-50">
        <nav class="card-body list-nav w-56 w-full space-y-2 card bg-gray-100 p-2 shadow-lg dark:bg-gray-800">
          {@render menuContent()}
        </nav>
      </Menu.Content>
    </Menu.Positioner>
  </Portal>
</Menu>
