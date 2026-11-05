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
    <Grid min="8.5rem" gap="md" role="group" aria-label="Items">
      {CATALOGUE.map((item) => (
        <Button
          key={item.id}
          variant="item"
          size="lg"
          selected={selectedId === item.id}
          onClick={() => onSelect(item)}
          aria-label={`${item.name}, ${formatPence(item.price)}`}
        >
          <Stack gap="sm" aria-hidden>
            <span className="font-mono text-xs text-zinc-500">{item.slot}</span>
            <span className="text-4xl leading-none">{item.emoji}</span>
            <span className="font-medium">{item.name}</span>
            <span className="w-fit rounded bg-zinc-900 px-2 py-0.5 font-mono text-sm text-white">
              {formatPence(item.price)}
            </span>
          </Stack>
        </Button>
      ))}
    </Grid>
  );
}
