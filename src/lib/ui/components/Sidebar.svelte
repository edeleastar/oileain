<script lang="ts">
  import { Dialog, Portal } from "@skeletonlabs/skeleton-svelte";
  import Icon from "./Icon.svelte";

  let { position = "left", menuSelector, sidebarContent } = $props();

  // svelte-ignore state_referenced_locally
  let positionerJustify = $state(position === "right" ? "justify-end" : "justify-start");
  let contentTranslate = $state(
    // svelte-ignore state_referenced_locally
    position === "right"
      ? "translate-x-full data-[state=open]:translate-x-0 starting:data-[state=open]:translate-x-full"
      : "-translate-x-full data-[state=open]:translate-x-0 starting:data-[state=open]:-translate-x-full"
  );
</script>

<Dialog>
  <Dialog.Trigger>
    {@render menuSelector()}
  </Dialog.Trigger>
  <Portal>
    <Dialog.Backdrop class="h-screen w-[480px] bg-surface-100-900 shadow-xl" />
    <Dialog.Positioner class={`fixed inset-0 z-50 flex ${positionerJustify} z-9999`}>
      <Dialog.Content
        class={`h-screen w-sm space-y-4 overflow-y-scroll card bg-surface-100-900 p-4 opacity-0 shadow-xl transition transition-discrete ${contentTranslate} data-[state=open]:opacity-100 starting:data-[state=open]:opacity-0`}
      >
        <header class="flex items-center justify-end">
          <Dialog.CloseTrigger class="btn-icon preset-tonal"><Icon type="close" /></Dialog.CloseTrigger>
        </header>
        {@render sidebarContent()}
      </Dialog.Content>
    </Dialog.Positioner>
  </Portal>
</Dialog>
