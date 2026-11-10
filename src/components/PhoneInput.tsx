"use client";

import { useEffect, useRef, useState } from "react";

// [ISO country code, dial code without "+"] — one entry per dial code.
const COUNTRIES: [string, string][] = [
  ["NG", "234"], ["TN", "216"], ["GH", "233"], ["US", "1"], ["GB", "44"], ["FR", "33"],
  ["AE", "971"], ["ZA", "27"], ["KE", "254"], ["CA", "1"],
  ["AF", "93"], ["AL", "355"], ["DZ", "213"], ["AD", "376"], ["AO", "244"], ["AR", "54"],
  ["AM", "374"], ["AU", "61"], ["AT", "43"], ["AZ", "994"], ["BH", "973"], ["BD", "880"],
  ["BY", "375"], ["BE", "32"], ["BZ", "501"], ["BJ", "229"], ["BO", "591"], ["BA", "387"],
  ["BW", "267"], ["BR", "55"], ["BG", "359"], ["BF", "226"], ["BI", "257"], ["KH", "855"],
  ["CM", "237"], ["CV", "238"], ["CF", "236"], ["TD", "235"], ["CL", "56"], ["CN", "86"],
  ["CO", "57"], ["KM", "269"], ["CG", "242"], ["CD", "243"], ["CR", "506"], ["CI", "225"],
  ["HR", "385"], ["CU", "53"], ["CY", "357"], ["CZ", "420"], ["DK", "45"], ["DJ", "253"],
  ["EC", "593"], ["EG", "20"], ["SV", "503"], ["GQ", "240"], ["ER", "291"], ["EE", "372"],
  ["SZ", "268"], ["ET", "251"], ["FI", "358"], ["GA", "241"], ["GM", "220"], ["GE", "995"],
  ["DE", "49"], ["GR", "30"], ["GT", "502"], ["GN", "224"], ["GW", "245"], ["HT", "509"],
  ["HN", "504"], ["HK", "852"], ["HU", "36"], ["IS", "354"], ["IN", "91"], ["ID", "62"],
  ["IR", "98"], ["IQ", "964"], ["IE", "353"], ["IL", "972"], ["IT", "39"], ["JP", "81"],
  ["JO", "962"], ["KZ", "7"], ["KW", "965"], ["KG", "996"], ["LA", "856"], ["LV", "371"],
  ["LB", "961"], ["LS", "266"], ["LR", "231"], ["LY", "218"], ["LT", "370"], ["LU", "352"],
  ["MG", "261"], ["MW", "265"], ["MY", "60"], ["MV", "960"], ["ML", "223"], ["MT", "356"],
  ["MR", "222"], ["MU", "230"], ["MX", "52"], ["MD", "373"], ["MC", "377"], ["MN", "976"],
  ["ME", "382"], ["MA", "212"], ["MZ", "258"], ["MM", "95"], ["NA", "264"], ["NP", "977"],
  ["NL", "31"], ["NZ", "64"], ["NI", "505"], ["NE", "227"], ["MK", "389"], ["NO", "47"],
  ["OM", "968"], ["PK", "92"], ["PS", "970"], ["PA", "507"], ["PY", "595"], ["PE", "51"],
  ["PH", "63"], ["PL", "48"], ["PT", "351"], ["QA", "974"], ["RO", "40"], ["RU", "7"],
  ["RW", "250"], ["SA", "966"], ["SN", "221"], ["RS", "381"], ["SC", "248"], ["SL", "232"],
  ["SG", "65"], ["SK", "421"], ["SI", "386"], ["SO", "252"], ["KR", "82"], ["SS", "211"],
  ["ES", "34"], ["LK", "94"], ["SD", "249"], ["SE", "46"], ["CH", "41"], ["SY", "963"],
  ["TW", "886"], ["TJ", "992"], ["TZ", "255"], ["TH", "66"], ["TG", "228"], ["TR", "90"],
  ["TM", "993"], ["UG", "256"], ["UA", "380"], ["UY", "598"], ["UZ", "998"], ["VE", "58"],
  ["VN", "84"], ["YE", "967"], ["ZM", "260"], ["ZW", "263"],
];

// Unique dial codes, in list order (so +1 shows the US flag, +7 Russia).
const OPTIONS = COUNTRIES.filter(([, dial], i) => COUNTRIES.findIndex(([, d]) => d === dial) === i);
const DIALS = OPTIONS.map(([, dial]) => dial);

let regionNames: Intl.DisplayNames | null = null;
function countryName(iso: string) {
  try {
    regionNames ??= new Intl.DisplayNames(["en"], { type: "region" });
    return regionNames.of(iso) ?? iso;
  } catch {
    return iso;
  }
}

function flag(iso: string) {
  return String.fromCodePoint(...[...iso].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}

/** Longest dial code that the digits start with, unless a longer code could still match. */
function detectDial(digits: string, final: boolean): string | null {
  const matches = DIALS.filter((d) => digits.startsWith(d)).sort((a, b) => b.length - a.length);
  if (!matches.length) return null;
  const stillTyping = DIALS.some((d) => d.length > digits.length && d.startsWith(digits));
  return stillTyping && !final ? null : matches[0];
}

/** Split a stored number like "+234 8012345678" or "+21629746027" into dial code + local part. */
function splitPhone(value: string): { dial: string; local: string } | null {
  const v = value.trim();
  const spaced = v.match(/^\+(\d{1,4})\s+(.*)$/);
  if (spaced && DIALS.includes(spaced[1])) return { dial: spaced[1], local: spaced[2] };
  if (!v.startsWith("+")) return null;
  const digits = v.slice(1).replace(/\D/g, "");
  const dial = detectDial(digits, true);
  return dial ? { dial, local: digits.slice(dial.length) } : null;
}

function compose(dial: string, local: string) {
  const l = local.trim();
  if (!l) return "";
  if (l.startsWith("+")) return l; // still typing a country code
  // Local formats often start with 0 (e.g. 0803…); drop it after the country code. Italy keeps it.
  const national = dial === "39" ? l : l.replace(/^0+/, "");
  return national ? `+${dial} ${national}` : "";
}

type Props = {
  id: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  readOnly?: boolean;
  required?: boolean;
  defaultDial?: string;
};

export default function PhoneInput({
  id,
  name,
  value,
  onChange,
  className = "input",
  placeholder,
  readOnly,
  required,
  defaultDial = "234",
}: Props) {
  const [dial, setDial] = useState(() => splitPhone(value)?.dial ?? defaultDial);
  const [local, setLocal] = useState(() => splitPhone(value)?.local ?? value);

  // Sync when the parent changes the value (prefill from account, "same as sender").
  const [lastValue, setLastValue] = useState(value);
  if (value !== lastValue) {
    setLastValue(value);
    if (value !== compose(dial, local)) {
      const parts = splitPhone(value);
      if (parts) {
        setDial(parts.dial);
        setLocal(parts.local);
      } else {
        setLocal(value);
      }
    }
  }

  function onLocalChange(text: string) {
    let nextDial = dial;
    let nextLocal = text;
    const t = text.trim();
    // Typed or pasted "+216…" / "00216…": move the country code into the dropdown.
    const intl = t.match(/^(?:\+|00)(.*)$/);
    if (intl) {
      const digits = intl[1].replace(/\D/g, "");
      const found = detectDial(digits, /\s/.test(intl[1]) || digits.length > 4);
      if (found) {
        nextDial = found;
        nextLocal = digits.slice(found.length);
      } else if (t.startsWith("00")) {
        nextLocal = `+${intl[1]}`;
      }
    }
    setDial(nextDial);
    setLocal(nextLocal);
    onChange(compose(nextDial, nextLocal));
  }

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = `${id}-codes`;
  const current = OPTIONS.find(([, d]) => d === dial) ?? OPTIONS[0];

  // Close when clicking outside.
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent | TouchEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
    };
  }, [open]);

  // Keep the highlighted country visible inside the scrollable list.
  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.children[active] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  function openList() {
    if (readOnly) return;
    setActive(Math.max(0, OPTIONS.findIndex(([, d]) => d === dial)));
    setOpen(true);
  }

  function onDialChange(next: string) {
    setDial(next);
    setOpen(false);
    onChange(compose(next, local));
  }

  function onCodeKeyDown(e: React.KeyboardEvent) {
    if (readOnly) return;
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        openList();
      }
      return;
    }
    if (e.key === "Escape" || e.key === "Tab") {
      setOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(OPTIONS.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onDialChange(OPTIONS[active][1]);
    }
  }

  return (
    <div className="phone-input">
      <div className="phone-input-code-wrap" ref={wrapRef}>
        <button
          type="button"
          className={`${className} phone-input-code`}
          aria-label={`Country code: ${countryName(current[0])} +${current[1]}`}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          disabled={readOnly}
          onClick={() => (open ? setOpen(false) : openList())}
          onKeyDown={onCodeKeyDown}
        >
          <span>
            {flag(current[0])} +{current[1]}
          </span>
          <span aria-hidden className="phone-input-caret">▾</span>
        </button>
        {open && (
          <ul id={listId} role="listbox" ref={listRef} className="phone-input-list">
            {OPTIONS.map(([iso, d], i) => (
              <li
                key={d}
                role="option"
                aria-selected={d === dial}
                className={`phone-input-option${i === active ? " is-active" : ""}${d === dial ? " is-selected" : ""}`}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onDialChange(d)}
              >
                <span>{flag(iso)}</span>
                <span className="phone-input-country">{countryName(iso)}</span>
                <span className="phone-input-dial">+{d}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <input
        id={id}
        type="tel"
        className={className}
        required={required}
        minLength={6}
        autoComplete="tel-national"
        placeholder={placeholder}
        readOnly={readOnly}
        value={local}
        onChange={(e) => onLocalChange(e.target.value)}
      />
      <input type="hidden" name={name} value={compose(dial, local)} />
    </div>
  );
}
