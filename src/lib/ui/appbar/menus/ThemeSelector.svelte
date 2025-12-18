<script lang="ts">
  import { Combobox, Portal, useListCollection } from "@skeletonlabs/skeleton-svelte";
  import { themeService } from "$lib/ui/themes/themes.svelte";
  import { currentTheme } from "$lib/runes.svelte";

  interface ComboxData {
    label: string;
    value: string;
  }

  let theme = $state([currentTheme.value]);
  let themes = $state(themeService.themes.map((element) => ({ label: element.name, value: element.name })));

  let collection = $derived.by(() =>
    useListCollection({
      items: themes,
      itemToString: (item: ComboxData) => item.label,
      itemToValue: (item: ComboxData) => item.value
    })
  );

  const onOpenChange = () => {
    themes = themeService.themes.map((element) => ({ label: element.name, value: element.name }));
  };

  function changeTheme(theme: string[]) {
    themeService.setTheme(theme[0]);
  }
</script>

<div class="mt-1 mb-1 ml-2">Theme</div>
<div class="relative z-50 mx-4 mb-2">
  <Combobox
    class="w-full max-w-md"
    placeholder={theme[0]}
    {collection}
    value={theme}
    {onOpenChange}
    onValueChange={(e) => ((theme = e.value), changeTheme(e.value!))}
  >
    <Combobox.Control>
      <Combobox.Input />
      <Combobox.Trigger />
    </Combobox.Control>
    <Portal>
      <Combobox.Positioner class="z-[9999]">
        <Combobox.Content class="z-[9999]">
          {#each collection.items as item (item.value)}
            <Combobox.Item {item}>
              <Combobox.ItemText>{item.label}</Combobox.ItemText>
              <Combobox.ItemIndicator />
            </Combobox.Item>
          {/each}
        </Combobox.Content>
      </Combobox.Positioner>
    </Portal>
  </Combobox>
</div>
