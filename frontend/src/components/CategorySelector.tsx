import { ProductContext } from "../types";

interface Props {
  value: ProductContext;
  onChange: (ctx: ProductContext) => void;
}

const fieldClass =
  "rounded-lg border border-ink-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100";

export function CategorySelector({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
      <label className="flex flex-col gap-1">
        <span className="font-medium text-ink-700">Category</span>
        <select
          className={fieldClass}
          value={value.category}
          onChange={(e) =>
            onChange({
              ...value,
              category: e.target.value as ProductContext["category"],
              perishable: e.target.value === "food" ? true : value.perishable,
            })
          }
        >
          <option value="non-food">Non-food</option>
          <option value="food">Food (FSS Act exceptions apply)</option>
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-medium text-ink-700">Origin</span>
        <select
          className={fieldClass}
          value={value.origin}
          onChange={(e) =>
            onChange({ ...value, origin: e.target.value as ProductContext["origin"] })
          }
        >
          <option value="domestic">Domestic</option>
          <option value="imported">Imported</option>
        </select>
      </label>

      <label className="flex items-center gap-2 text-ink-700">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-400"
          checked={value.perishable}
          onChange={(e) => onChange({ ...value, perishable: e.target.checked })}
        />
        <span>Perishable / time-sensitive (needs best-before date)</span>
      </label>

      <label className="flex items-center gap-2 text-ink-700">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-400"
          checked={value.hasUnitSalePrice}
          onChange={(e) => onChange({ ...value, hasUnitSalePrice: e.target.checked })}
        />
        <span>Sold with loose-equivalent pricing (needs unit sale price)</span>
      </label>
    </div>
  );
}
