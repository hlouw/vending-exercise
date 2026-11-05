import { Cluster } from "@/components/layout/Cluster";
import { Grid } from "@/components/layout/Grid";
import { Stack } from "@/components/layout/Stack";
import { Button } from "@/components/ui/Button";
import { CATALOGUE, type Item } from "@/lib/catalogue";
import { formatPence } from "@/lib/format";

interface ItemGridProps {
  selectedId: string | null;
  onSelect: (item: Item) => void;
}

/** The glass front: one slot per Item, with its price on show. */
export function ItemGrid({ selectedId, onSelect }: ItemGridProps) {
  return (
    <Grid
      gap="sm"
      className="grid-cols-2 sm:grid-cols-3"
      role="group"
      aria-label="Items"
    >
      {CATALOGUE.map((item) => (
        <Button
          key={item.id}
          variant="item"
          selected={selectedId === item.id}
          onClick={() => onSelect(item)}
          aria-label={`${item.name}, ${formatPence(item.price)}`}
        >
          <Stack gap="xs" aria-hidden>
            <Cluster justify="between" gap="sm" className="flex-nowrap">
              <span className="truncate text-sm">{item.name}</span>
              <span className="font-mono text-xs text-muted">{item.slot}</span>
            </Cluster>
            <span className="font-mono text-sm font-semibold">
              {formatPence(item.price)}
            </span>
          </Stack>
        </Button>
      ))}
    </Grid>
  );
}
