import { ProductContext } from "../types";

interface Props {
  value: ProductContext;
  onChange: (ctx: ProductContext) => void;
}

export function CategorySelector({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 text-sm">
      <label className="flex flex-col gap-1">
        <span className="font-medium text-slate-700">Category</span>
        <select
          className="rounded border border-slate-300 px-2 py-1.5"
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
        <span className="font-medium text-slate-700">Origin</span>
        <select
          className="rounded border border-slate-300 px-2 py-1.5"
          value={value.origin}
          onChange={(e) =>
            onChange({ ...value, origin: e.target.value as ProductContext["origin"] })
          }
        >
          <option value="domestic">Domestic</option>
          <option value="imported">Imported</option>
        </select>
      </label>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={value.perishable}
          onChange={(e) => onChange({ ...value, perishable: e.target.checked })}
        />
        <span>Perishable / time-sensitive (needs best-before date)</span>
      </label>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={value.hasUnitSalePrice}
          onChange={(e) => onChange({ ...value, hasUnitSalePrice: e.target.checked })}
        />
        <span>Sold with loose-equivalent pricing (needs unit sale price)</span>
      </label>
    </div>
  );
}
