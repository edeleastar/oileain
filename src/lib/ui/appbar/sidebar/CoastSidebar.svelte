<script lang="ts">
  import Sidebar from "$lib/ui/components/Sidebar.svelte";
  import Icon from "$lib/ui/components/Icon.svelte";
  import { oileainService } from "$lib/services/oileain-service";
  import type { IslandGroup, Island } from "$lib/services/oileain-types";
  import { onMount } from "svelte";
  import { TreeView, createTreeViewCollection } from "@skeletonlabs/skeleton-svelte";
  import { goto } from "$app/navigation";

  interface TreeNode {
    id: string;
    name: string;
    href?: string;
    children?: TreeNode[];
  }

  let coasts = $state<Array<IslandGroup>>([]);
  let collection = $state<ReturnType<typeof createTreeViewCollection<TreeNode>> | null>(null);

  onMount(async () => {
    coasts = await oileainService.getCoasts();

    collection = createTreeViewCollection<TreeNode>({
      nodeToValue: (node) => node.id,
      nodeToString: (node) => node.name,
      rootNode: {
        id: "root",
        name: "",
        children: coasts.map((coast) => ({
          id: coast.variable,
          name: coast.title,
          children: coast.pois.map((island) => ({
            id: island.safeName,
            name: island.name,
            href: `/poi/${island.safeName}`
          }))
        }))
      }
    });
  });
</script>

{#snippet menuSelector()}
  <div class="flex items-center rounded-lg p-2 hover:preset-tonal-secondary dark:hover:preset-tonal-tertiary">
    <Icon type="coasts" tip="Wander the coasts" height="40" />
  </div>
{/snippet}

{#snippet sidebarContent()}
  <header class="mb-4 text-center">
    <h3 class="text-lg text-surface-500">Oileain: islands of Ireland</h3>
  </header>
  <article>
    {#if collection}
      <TreeView {collection}>
        <TreeView.Label>Coastal Regions</TreeView.Label>
        <TreeView.Tree>
          {#each collection.rootNode.children || [] as node, index (node)}
            {@render treeNode(node, [index])}
          {/each}
        </TreeView.Tree>
      </TreeView>
    {/if}
  </article>
{/snippet}

{#snippet treeNode(node: TreeNode, indexPath: number[])}
  <TreeView.NodeProvider value={{ node, indexPath }}>
    {#if node.children}
      <TreeView.Branch>
        <TreeView.BranchControl>
          <TreeView.BranchIndicator />
          <TreeView.BranchText>
            <Icon type="coast" height="20" />
            {node.name}
          </TreeView.BranchText>
        </TreeView.BranchControl>
        <TreeView.BranchContent>
          <TreeView.BranchIndentGuide />
          {#each node.children as childNode, childIndex (childNode)}
            {@render treeNode(childNode, [...indexPath, childIndex])}
          {/each}
        </TreeView.BranchContent>
      </TreeView.Branch>
    {:else}
      <TreeView.Item>
        <button
          type="button"
          onclick={(e) => {
            e.stopPropagation();
            if (node.href) {
              goto(node.href);
            }
          }}
          class="flex w-full cursor-pointer items-center gap-2 text-left hover:text-primary-500"
        >
          <Icon type="island" height="20" />
          {@html node.name}
        </button>
      </TreeView.Item>
    {/if}
  </TreeView.NodeProvider>
{/snippet}

<Sidebar position="right" {menuSelector} {sidebarContent} />
