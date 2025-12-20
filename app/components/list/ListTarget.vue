<script setup lang="ts">
import { useCurrentProjectStore } from "~/stores/currentProjectStore";
import type { TableColumn } from "@nuxt/ui";
import type { ADTarget } from "~/types/ad/ADTarget";
const toast = useToast()

const currentProjectStore = useCurrentProjectStore();

const tableData = computed(() =>
  currentProjectStore.targets.map((target) => ({
    ip: target.ip,
    cidr: target.cidr,
    note: target.note,
    isVerified: false,
  })),
);

const columns: TableColumn[] = [
  { accessorKey: "ip", header: "IP" },
  { accessorKey: "cidr", header: "CIDR" },
  { accessorKey: "note", header: "Note" },
  { accessorKey: "isVerified", header: "Verified" },
  {
    id: 'action'
  }
];

const columnFilters = ref([{ ip: "", value: "" }]);
const table = useTemplateRef("table");

onMounted(async () => {
  await currentProjectStore.fetchTargets();
  console.log(currentProjectStore.targets);
});


function getDropdownActions(target: ADTarget): DropdownMenuItem[][] {
  return [
    [
      {
        label: 'Copy target ip',
        icon: 'i-lucide-copy',
        onSelect: () => {
          copy(target.ip.toString())

          toast.add({
            title: 'IP copied to clipboard!',
            color: 'success',
            icon: 'i-lucide-circle-check'
          })
        }
      }
    ],
    [
      {
        label: 'Edit',
        icon: 'i-lucide-edit'
      },
      {
        label: 'Delete',
        icon: 'i-lucide-trash',
        color: 'error'
      }
    ]
  ]
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center gap-4">
      <div>
        <UInput
          :model-value="
            table?.tableApi?.getColumn('ip')?.getFilterValue() as string
          "
          class="max-w-sm"
          placeholder="Filter IPs..."
          @update:model-value="
            table?.tableApi?.getColumn('ip')?.setFilterValue($event)
          "
        />
      </div>
      <div>
        <USwitch label="Show only verified targets" />
      </div>
      <div>
        <UTooltip text="Verified targets are those that have been successfully pinged or contacted.">
          <UIcon name="i-lucide-lightbulb" class="size-5" />
        </UTooltip>
      </div>
    </div>

    <div class="min-h-[300px] relative">
      <UTable
        ref="table"
        v-model:column-filters="columnFilters"
        :data="tableData"
        :columns="columns"
        :loading="currentProjectStore.loading"
      >
        <template #isVerified-cell="{ row }">
            <UIcon
              :name="row.getValue('isVerified') ? 'i-lucide-check-circle' : 'i-lucide-x-circle'"
              :class="row.getValue('isVerified') ? 'text-green-500' : 'text-red-500'"
            />
        </template>
        <template #action-cell="{ row }">
      <UDropdownMenu :items="getDropdownActions(row.original)">
        <UButton
          icon="i-lucide-ellipsis-vertical"
          color="neutral"
          variant="ghost"
          aria-label="Actions"
        />
      </UDropdownMenu>
    </template>
      </UTable>


      <div v-if="currentProjectStore.error" class="mt-4 text-red-500">
        Error: {{ currentProjectStore.error.message }}
      </div>
    </div>
  </div>
</template>
