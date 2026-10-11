
import { useMemo, useState } from "react";
import { evaluate } from "mathjs";

type Unit = {
  name: string;
  symbol: string;
  factor?: number;
};

type Reference = {
  title: string;
  value: string;
  copyValue: string;
  keywords: string;
};

const unitGroups: Record<string, Unit[]> = {
  Length: [
    { name: "Meter", symbol: "m", factor: 1 },
    { name: "Centimeter", symbol: "cm", factor: 0.01 },
    { name: "Millimeter", symbol: "mm", factor: 0.001 },
    { name: "Kilometer", symbol: "km", factor: 1000 },
    { name: "Inch", symbol: "in", factor: 0.0254 },
    { name: "Foot", symbol: "ft", factor: 0.3048 },
  ],
  Mass: [
    { name: "Kilogram", symbol: "kg", factor: 1000 },
    { name: "Gram", symbol: "g", factor: 1 },
    { name: "Milligram", symbol: "mg", factor: 0.001 },
    { name: "Pound", symbol: "lb", factor: 453.59237 },
  ],
  Volume: [
    { name: "Liter", symbol: "L", factor: 1 },
    { name: "Milliliter", symbol: "mL", factor: 0.001 },
    { name: "Cubic meter", symbol: "m³", factor: 1000 },
  ],
  Temperature: [
    { name: "Celsius", symbol: "°C" },
    { name: "Fahrenheit", symbol: "°F" },
    { name: "Kelvin", symbol: "K" },
  ],
  Time: [
    { name: "Second", symbol: "s", factor: 1 },
    { name: "Minute", symbol: "min", factor: 60 },
    { name: "Hour", symbol: "h", factor: 3600 },
    { name: "Day", symbol: "day", factor: 86400 },
  ],
  Speed: [
    { name: "Meters/second", symbol: "m/s", factor: 1 },
    { name: "Kilometers/hour", symbol: "km/h", factor: 1 / 3.6 },
    { name: "Miles/hour", symbol: "mph", factor: 0.44704 },
  ],
  Area: [
    { name: "Square meter", symbol: "m²", factor: 1 },
    { name: "Square kilometer", symbol: "km²", factor: 1_000_000 },
    { name: "Square foot", symbol: "ft²", factor: 0.09290304 },
  ],
  Energy: [
    { name: "Joule", symbol: "J", factor: 1 },
    { name: "Kilojoule", symbol: "kJ", factor: 1000 },
    { name: "Calorie", symbol: "cal", factor: 4.184 },
    { name: "Kilowatt-hour", symbol: "kWh", factor: 3_600_000 },
  ],
};

const references: Reference[] = [
  {
    title: "Speed of light",
    value: "≈ 3 × 10⁸ m/s",
    copyValue: "3e8",
    keywords: "physics light c constant speed",
  },
  {
    title: "Gravitational acceleration",
    value: "≈ 9.80665 m/s²",
    copyValue: "9.80665",
    keywords: "physics gravity g earth acceleration",
  },
  {
    title: "Standard atmospheric pressure",
    value: "101,325 Pa",
    copyValue: "101325",
    keywords: "pressure atmosphere pascal",
  },
  {
    title: "Avogadro constant",
    value: "6.02214076 × 10²³ mol⁻¹",
    copyValue: "6.02214076e23",
    keywords: "chemistry mole avogadro",
  },
  {
    title: "Planck constant",
    value: "6.62607015 × 10⁻³⁴ J·s",
    copyValue: "6.62607015e-34",
    keywords: "physics quantum planck",
  },
  {
    title: "Pi (π)",
    value: "≈ 3.14159265",
    copyValue: "pi",
    keywords: "math circle pi",
  },
  {
    title: "Pythagorean theorem",
    value: "a² + b² = c²",
    copyValue: "a^2 + b^2 = c^2",
    keywords: "math triangle formula pythagoras",
  },
  {
    title: "Newton's second law",
    value: "F = ma",
    copyValue: "F = m * a",
    keywords: "physics force mass acceleration formula",
  },
];

const buttons = [
  ["C", "(", ")", "÷"],
  ["7", "8", "9", "×"],
  ["4", "5", "6", "−"],
  ["1", "2", "3", "+"],
  ["±", "0", ".", "="],
];

function normalizeExpression(input: string) {
  return input
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/−/g, "-")
    .replace(/π/g, "pi");
}

function formatNumber(value: number) {
  if (!Number.isFinite(value)) return "Error";
  if (value === 0) return "0";

  const absValue = Math.abs(value);

  if (absValue >= 1e12 || absValue < 1e-6) {
    return value.toExponential(8).replace(/\.?0+e/, "e");
  }

  return Number(value.toPrecision(12)).toLocaleString("en-US", {
    maximumFractionDigits: 10,
  });
}

function convertTemperature(value: number, from: string, to: string) {
  let celsius = value;

  if (from === "°F") celsius = ((value - 32) * 5) / 9;
  if (from === "K") celsius = value - 273.15;

  if (to === "°F") return (celsius * 9) / 5 + 32;
  if (to === "K") return celsius + 273.15;

  return celsius;
}

export default function App() {
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    const savedTheme = localStorage.getItem("quickcalc-theme");
    return savedTheme === "light" ? "light" : "dark";
  });

  const [tab, setTab] = useState("Calculator");
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState("");
  const [query, setQuery] = useState("");
  const [copiedTitle, setCopiedTitle] = useState("");

  const [category, setCategory] = useState("Length");
  const [amount, setAmount] = useState("1");
  const [fromUnit, setFromUnit] = useState("m");
  const [toUnit, setToUnit] = useState("cm");

  const dark = theme === "dark";
  const units = unitGroups[category];

  const panel = dark
    ? "bg-[#171923] text-white"
    : "bg-[#FFFDFC] text-slate-900";

  const muted = dark ? "text-slate-400" : "text-slate-500";

  const field = dark
    ? "border-[#343747] bg-[#222532] text-white"
    : "border-orange-100 bg-white text-slate-900";

  const keyClass = dark
    ? "bg-[#252938] hover:bg-[#34394B]"
    : "bg-white hover:bg-orange-50 border border-orange-100";

  const accent =
    "bg-orange-500 text-white hover:bg-orange-400";

  const converted = useMemo(() => {
    const value = Number(amount);

    if (amount.trim() === "" || !Number.isFinite(value)) {
      return "";
    }

    if (category === "Temperature") {
      return formatNumber(
        convertTemperature(value, fromUnit, toUnit),
      );
    }

    const from = units.find((unit) => unit.symbol === fromUnit);
    const to = units.find((unit) => unit.symbol === toUnit);

    if (from?.factor === undefined || to?.factor === undefined) {
      return "";
    }

    return formatNumber((value * from.factor) / to.factor);
  }, [amount, category, fromUnit, toUnit, units]);

  const searchResults = references.filter((item) =>
    `${item.title} ${item.value} ${item.keywords}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );

  const searchCalculation = useMemo(() => {
    const input = query.trim();

    if (!input || !/[0-9]/.test(input)) return "";

    try {
      const value = evaluate(normalizeExpression(input));

      if (typeof value !== "number" || !Number.isFinite(value)) {
        return "";
      }

      return formatNumber(value);
    } catch {
      return "";
    }
  }, [query]);

  function calculate(input = expression) {
    if (!input.trim()) {
      setResult("");
      return;
    }

    try {
      const value = evaluate(normalizeExpression(input));

      if (typeof value !== "number" || !Number.isFinite(value)) {
        throw new Error("Invalid result");
      }

      setResult(formatNumber(value));
    } catch {
      setResult("Invalid expression");
    }
  }

  function press(key: string) {
    if (key === "C") {
      setExpression("");
      setResult("");
      return;
    }

    if (key === "=") {
      calculate();
      return;
    }

    if (key === "±") {
      setExpression((current) =>
        current.startsWith("-")
          ? current.slice(1)
          : `-${current}`,
      );
      setResult("");
      return;
    }

    setExpression((current) => current + key);
    setResult("");
  }

  function changeCategory(next: string) {
    const nextUnits = unitGroups[next];

    setCategory(next);
    setAmount("1");
    setFromUnit(nextUnits[0].symbol);
    setToUnit(nextUnits[1]?.symbol ?? nextUnits[0].symbol);
  }

  function changeTheme() {
    const next = dark ? "light" : "dark";

    setTheme(next);
    localStorage.setItem("quickcalc-theme", next);
  }

  async function copyReference(item: Reference) {
    try {
      await navigator.clipboard.writeText(item.copyValue);
      setCopiedTitle(item.title);

      window.setTimeout(() => {
        setCopiedTitle((current) =>
          current === item.title ? "" : current,
        );
      }, 1500);
    } catch {
      setCopiedTitle("");
    }
  }

  function ReferenceCard({ item }: { item: Reference }) {
    return (
      <button
        key={item.title}
        type="button"
        onClick={() => void copyReference(item)}
        title={`Copy ${item.copyValue}`}
        className={`w-full rounded-xl border p-3 text-left transition ${
          field
        } ${
          dark
            ? "hover:border-orange-400/70"
            : "hover:border-orange-300 hover:bg-orange-50/50"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold">{item.title}</h2>
            <p className="mt-2 break-words text-sm font-medium text-orange-500">
              {item.value}
            </p>
          </div>

          <span className="shrink-0 rounded-lg bg-orange-500/10 px-2 py-1 text-xs font-medium text-orange-500">
            {copiedTitle === item.title ? "✓ Copied" : "Copy ↗"}
          </span>
        </div>
      </button>
    );
  }

  return (
    <main
      className={`min-h-[520px] w-[380px] p-4 transition-colors duration-200 ${panel}`}
    >
      {/* Header */}
      <header className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-2xl bg-orange-500 text-xl font-bold text-white shadow-lg shadow-orange-500/20">
            Q
          </div>

          <div>
            <h1 className="text-lg font-bold tracking-tight">
              QuickCalc
            </h1>
            <p className={`text-xs ${muted}`}>
              Your everyday toolkit
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={changeTheme}
          title="Toggle theme"
          aria-label="Toggle theme"
          className={`rounded-xl border p-2.5 transition hover:opacity-80 ${field}`}
        >
          {dark ? "☀️" : "🌙"}
        </button>
      </header>

      {/* Navigation */}
      <nav className="mb-4 grid grid-cols-4 gap-1 rounded-xl bg-black/5 p-1 dark:bg-white/5">
        {["Calculator", "Convert", "Physics", "Search"].map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={`rounded-lg px-1 py-2 text-xs font-semibold transition ${
              tab === item
                ? "bg-orange-500 text-white shadow-sm"
                : `${muted} hover:text-orange-500`
            }`}
          >
            {item}
          </button>
        ))}
      </nav>

      {/* Calculator */}
      {tab === "Calculator" && (
        <section>
          <div className={`mb-3 rounded-2xl border p-4 ${field}`}>
            <p className={`mb-2 text-xs ${muted}`}>Expression</p>

            <input
              aria-label="Calculator expression"
              value={expression}
              onChange={(event) => setExpression(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") calculate();
                if (event.key === "Escape") press("C");
              }}
              placeholder=""
              className="w-full bg-transparent text-right text-lg outline-none"
            />

            <div className="mt-3 min-h-9 break-words text-right text-2xl font-bold text-orange-500">
              {result}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {buttons.flat().map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => press(key)}
                className={`h-12 rounded-xl text-base font-semibold transition ${
                  key === "="
                    ? accent
                    : ["+", "−", "×", "÷"].includes(key)
                      ? "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20"
                      : key === "C"
                        ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                        : keyClass
                }`}
              >
                {key}
              </button>
            ))}
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            {[
              { label: "x²", value: "^2" },
              { label: "xʸ", value: "^" },
              { label: "√", value: "sqrt(" },
              { label: "mod", value: "%" },
              { label: "π", value: "pi" },
              { label: "e", value: "e" },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  setExpression((current) => current + item.value);
                  setResult("");
                }}
                className={`rounded-lg py-2 text-sm font-medium transition ${keyClass}`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <p className={`mt-3 text-center text-xs ${muted}`}>
            Tip: Paste copied values with Ctrl + V
          </p>
        </section>
      )}

      {/* Unit Converter */}
      {tab === "Convert" && (
        <section className="space-y-3">
          <div>
            <label className={`mb-1.5 block text-xs font-medium ${muted}`}>
              Category
            </label>

            <select
              value={category}
              onChange={(event) => changeCategory(event.target.value)}
              className={`w-full rounded-xl border p-3 outline-none focus:border-orange-400 ${field}`}
            >
              {Object.keys(unitGroups).map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={`mb-1.5 block text-xs font-medium ${muted}`}>
              Amount
            </label>

            <input
              type="number"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className={`w-full rounded-xl border p-3 outline-none focus:border-orange-400 ${field}`}
            />
          </div>

          <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
            <label className={`text-xs ${muted}`}>
              From
              <select
                value={fromUnit}
                onChange={(event) => setFromUnit(event.target.value)}
                className={`mt-1 w-full rounded-lg border p-2 text-sm outline-none ${field}`}
              >
                {units.map((unit) => (
                  <option key={unit.symbol} value={unit.symbol}>
                    {unit.symbol}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              onClick={() => {
                setFromUnit(toUnit);
                setToUnit(fromUnit);
              }}
              className={`mb-1 rounded-lg px-3 py-2 ${keyClass}`}
              title="Swap units"
              aria-label="Swap units"
            >
              ⇄
            </button>

            <label className={`text-xs ${muted}`}>
              To
              <select
                value={toUnit}
                onChange={(event) => setToUnit(event.target.value)}
                className={`mt-1 w-full rounded-lg border p-2 text-sm outline-none ${field}`}
              >
                {units.map((unit) => (
                  <option key={unit.symbol} value={unit.symbol}>
                    {unit.symbol}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="rounded-2xl border border-orange-500/20 bg-orange-500/10 p-4">
            <p className={`text-xs ${muted}`}>Converted result</p>

            <p className="mt-2 break-words text-2xl font-bold text-orange-500">
              {converted || "—"} {toUnit}
            </p>

            <button
              type="button"
              onClick={() => {
                if (converted) {
                  void navigator.clipboard.writeText(converted);
                }
              }}
              disabled={!converted}
              className="mt-3 rounded-lg bg-orange-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-orange-400 disabled:opacity-40"
            >
              Copy number only
            </button>
          </div>

          <p className={`text-xs ${muted}`}>
            Example: 1 m = 100 cm
          </p>
        </section>
      )}

      {/* Physics References */}
      {tab === "Physics" && (
        <section className="space-y-3">
          <div>
            <h2 className="font-semibold">Physics & Math References</h2>
            <p className={`mt-1 text-xs ${muted}`}>
              Tap any card to copy its value or formula.
            </p>
          </div>

          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search constants or formulas..."
            className={`w-full rounded-xl border p-3 outline-none focus:border-orange-400 ${field}`}
          />

          <div className="space-y-2">
            {searchResults.map((item) => (
              <ReferenceCard key={item.title} item={item} />
            ))}
          </div>

          {searchResults.length === 0 && (
            <p className={`py-6 text-center text-sm ${muted}`}>
              No matching references found.
            </p>
          )}
        </section>
      )}

      {/* Universal Search */}
      {tab === "Search" && (
        <section className="space-y-3">
          <div>
            <h2 className="font-semibold">Quick Search</h2>
            <p className={`mt-1 text-xs ${muted}`}>
              Search a formula, constant or calculation.
            </p>
          </div>

          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try 25 * 48 or speed of light"
            className={`w-full rounded-xl border p-3 outline-none focus:border-orange-400 ${field}`}
          />

          {searchCalculation && (
            <button
              type="button"
              onClick={() => {
                setExpression(query);
                setTab("Calculator");
                calculate(query);
              }}
              className="w-full rounded-xl border border-orange-500/30 bg-orange-500/10 p-3 text-left transition hover:bg-orange-500/15"
            >
              <p className={`text-xs ${muted}`}>Calculator result</p>
              <p className="mt-1 text-xl font-bold text-orange-500">
                {searchCalculation}
              </p>
              <p className={`mt-1 text-xs ${muted}`}>
                Click to open in calculator
              </p>
            </button>
          )}

          <div className="space-y-2">
            {searchResults.map((item) => (
              <ReferenceCard key={item.title} item={item} />
            ))}
          </div>

          {query.trim() &&
            !searchCalculation &&
            searchResults.length === 0 && (
              <p className={`py-6 text-center text-sm ${muted}`}>
                No matching results found.
              </p>
            )}

          <p className={`text-xs ${muted}`}>
            Works offline with built-in references and calculations.
          </p>
        </section>
      )}

      {/* Footer */}
      <footer className={`mt-5 border-t pt-3 text-center text-xs ${
        dark ? "border-white/10" : "border-orange-100"
      } ${muted}`}>
        QuickCalc · Fast, simple, useful.
      </footer>
    </main>
  );
}
