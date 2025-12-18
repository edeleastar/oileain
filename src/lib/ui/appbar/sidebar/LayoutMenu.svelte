<script lang="ts">
  import Menu from "$lib/ui/components/Menu.svelte";
  import Icon from "$lib/ui/components/Icon.svelte";
  import { Combobox, SegmentedControl, Portal, useListCollection } from "@skeletonlabs/skeleton-svelte";
  import { themeService } from "$lib/ui/themes/themes.svelte";
  import { currentTheme, lightMode } from "$lib/runes.svelte";

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

{#snippet menuSelector()}
  <div class="flex items-center rounded-lg p-4 hover:preset-tonal-secondary dark:hover:preset-tonal-tertiary">
    <Icon type="lightMode" height="40" tip="Open Theme Menu" />
  </div>
{/snippet}

{#snippet menuContent()}
  <div class="ml-2 font-bold">Layout Options</div>
  <div class="relative z-9999 mt-5 mb-5">
    <div class="mt-4 mb-1 ml-2">Appearance</div>
    <div class="mb-2 flex justify-center">
      <SegmentedControl defaultValue={lightMode.value} onValueChange={(e) => themeService.setDisplayMode(e.value!)}>
        <SegmentedControl.Control>
          <SegmentedControl.Indicator />
          <SegmentedControl.Item value="dark">
            <SegmentedControl.ItemText>
              <Icon type="dark" />
            </SegmentedControl.ItemText>
            <SegmentedControl.ItemHiddenInput />
          </SegmentedControl.Item>
          <SegmentedControl.Item value="light">
            <SegmentedControl.ItemText>
              <Icon type="light" />
            </SegmentedControl.ItemText>
            <SegmentedControl.ItemHiddenInput />
          </SegmentedControl.Item>
        </SegmentedControl.Control>
      </SegmentedControl>
    </div>
    <hr />

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
  </div>
{/snippet}

<Menu {menuSelector} {menuContent} />
