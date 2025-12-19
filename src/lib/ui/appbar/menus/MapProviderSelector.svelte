<script lang="ts">
  import { Combobox, Portal, useListCollection } from "@skeletonlabs/skeleton-svelte";
  import { mapProvider } from "$lib/runes.svelte";
  import { themeService } from "$lib/ui/themes/themes.svelte";

  interface ComboxData {
    label: string;
    value: string;
  }

  let provider = $state([mapProvider.value]);
  let providers = $state(
    themeService.mapProviders.map((element) => ({
      label: element.provider,
      value: element.provider.toLowerCase()
    }))
  );

  // Sync provider state with mapProvider rune
  $effect(() => {
    provider = [mapProvider.value];
  });

  // Get the label for the current provider value
  const providerLabel = $derived(providers.find((p) => p.value === mapProvider.value)?.label || mapProvider.value);

  let collection = $derived.by(() =>
    useListCollection({
      items: providers,
      itemToString: (item: ComboxData) => item.label,
      itemToValue: (item: ComboxData) => item.value
    })
  );

  const onOpenChange = () => {
    providers = themeService.mapProviders.map((element) => ({
      label: element.provider,
      value: element.provider.toLowerCase()
    }));
  };

  function changeProvider(provider: string[]) {
    themeService.setMapProvider(provider[0]);
  }
</script>

<div class="mt-1 mb-1 ml-2">Map Provider</div>
<div class="relative z-50 mx-4 mb-2">
  <Combobox
    class="w-full max-w-md"
    placeholder={providerLabel}
    {collection}
    value={provider}
    {onOpenChange}
    onValueChange={(e) => ((provider = e.value), changeProvider(e.value!))}
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
