<script lang="ts">
  import Icon from "$lib/ui/components/Icon.svelte";
  import { SegmentedControl } from "@skeletonlabs/skeleton-svelte";
  import { themeService } from "$lib/ui/themes/themes.svelte";
  import { lightMode } from "$lib/runes.svelte";
</script>

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
