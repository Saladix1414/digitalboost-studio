export type LogicPuzzleKind =
  | "number-pattern"
  | "symbol-rule"
  | "conditional-logic";

export interface LogicChoice {
  id: string;
  label: string;
  value: string;
}

export interface LogicPuzzle {
  kind: LogicPuzzleKind;
  level: number;
  title: string;
  subtitle: string;
  prompt: string;
  sequence?: string[];
  logicLines?: string[];
  choices: LogicChoice[];
  correctChoiceId: string;
  explanation: string;
  hints: [string, string];
}

type RandomSource = () => number;

function createRandom(seed: number): RandomSource {
  let state = (Math.trunc(seed) >>> 0) || 0x9e3779b9;

  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function shuffle<T>(items: T[], random: RandomSource): T[] {
  const result = [...items];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

function makeChoices(
  correctValue: string,
  distractors: string[],
  random: RandomSource,
): Pick<LogicPuzzle, "choices" | "correctChoiceId"> {
  const values: string[] = [];

  for (const value of [correctValue, ...distractors]) {
    if (!values.includes(value)) values.push(value);
    if (values.length === 4) break;
  }

  let suffix = 1;

  while (values.length < 4) {
    const fallback = `${correctValue} (${suffix++})`;
    if (!values.includes(fallback)) values.push(fallback);
  }

  const choices = shuffle(values, random).map((value, index) => ({
    id: `answer-${index + 1}`,
    label: value,
    value,
  }));

  const correct = choices.find((choice) => choice.value === correctValue);

  if (!correct) throw new Error("No se generó una respuesta válida.");

  return { choices, correctChoiceId: correct.id };
}

function createNumberPuzzle(
  level: number,
  random: RandomSource,
): LogicPuzzle {
  const tier = Math.floor((level - 1) / 3);
  const variant = tier % 4;

  let numbers: number[];
  let answer: number;
  let explanation: string;
  let firstHint: string;
  let secondHint: string;

  if (variant === 0) {
    const start = 7 + Math.floor(random() * 9) + Math.floor(tier / 2);
    const step = 2 + Math.floor(random() * 5) + Math.floor(tier / 2);

    numbers = Array.from({ length: 5 }, (_, i) => start + step * i);
    answer = start + step * 5;
    explanation =
      `La diferencia se mantiene en +${step}. ` +
      `El siguiente término es ${answer}.`;
    firstHint = "Calculá las diferencias entre términos consecutivos.";
    secondHint = `La diferencia constante es +${step}.`;
  } else if (variant === 1) {
    const start = 5 + Math.floor(random() * 8);
    const a = 2 + Math.floor(random() * 3) + Math.floor(tier / 3);
    const b = a + 2 + Math.floor(random() * 4);

    numbers = [start];

    for (let i = 0; i < 4; i++) {
      numbers.push(numbers[numbers.length - 1] + (i % 2 === 0 ? a : b));
    }

    answer = numbers[4] + a;
    explanation =
      `Los incrementos alternan entre +${a} y +${b}. ` +
      `Ahora corresponde sumar +${a}, obteniendo ${answer}.`;
    firstHint = "Compará las diferencias, no solamente los valores.";
    secondHint = `Los incrementos alternan: +${a}, +${b}, +${a}, +${b}.`;
  } else if (variant === 2) {
    const base = 2 + Math.floor(random() * 4) + Math.floor(tier / 2);
    const offset = Math.floor(random() * 5);

    numbers = Array.from(
      { length: 5 },
      (_, i) => (base + i) ** 2 + offset,
    );

    answer = (base + 5) ** 2 + offset;
    explanation =
      `La regla es n² + ${offset}. ` +
      `El siguiente valor es ${base + 5}² + ${offset} = ${answer}.`;
    firstHint = "Buscá una relación con cuadrados consecutivos.";
    secondHint = `Probá elevar números consecutivos al cuadrado y sumar ${offset}.`;
  } else {
    const first = 2 + Math.floor(random() * 4);
    const second = 4 + Math.floor(random() * 5);

    numbers = [first, second];

    while (numbers.length < 5) {
      const length = numbers.length;
      numbers.push(numbers[length - 1] + numbers[length - 2]);
    }

    answer = numbers[4] + numbers[3];
    explanation =
      `Cada término suma los dos anteriores. ` +
      `${numbers[4]} + ${numbers[3]} = ${answer}.`;
    firstHint = "Observá cómo se relacionan los términos vecinos.";
    secondHint = "Sumá los dos últimos términos para hallar el siguiente.";
  }

  return {
    kind: "number-pattern",
    level,
    title: "Pattern Synthesis",
    subtitle: "SECUENCIAS / ANÁLISIS DE REGLAS",
    prompt: "Descubrí la regla y determiná qué valor continúa la secuencia.",
    sequence: [...numbers.map(String), "?"],
    ...makeChoices(
      String(answer),
      [
        String(answer + 1),
        String(answer - 1),
        String(answer + 2),
        String(answer - 2),
        String(answer + 3),
      ],
      random,
    ),
    explanation,
    hints: [firstHint, secondHint],
  };
}

function rotate<T>(items: T[], offset: number): T[] {
  const n = ((offset % items.length) + items.length) % items.length;
  return [...items.slice(n), ...items.slice(0, n)];
}

function createSymbolPuzzle(
  level: number,
  random: RandomSource,
): LogicPuzzle {
  const symbols = level >= 10
    ? ["△", "○", "◇", "✦"]
    : ["△", "○", "◇"];

  const start = Math.floor(random() * symbols.length);
  const sequence = Array.from(
    { length: 5 },
    (_, i) => rotate(symbols, start + i).join(" · "),
  );

  const answer = rotate(symbols, start + 5).join(" · ");
  const alternatives = Array.from(
    { length: symbols.length - 1 },
    (_, i) => rotate(symbols, start + 6 + i).join(" · "),
  );

  if (symbols.length === 3) {
    alternatives.push([...rotate(symbols, start + 5)].reverse().join(" · "));
  }

  return {
    kind: "symbol-rule",
    level,
    title: "Symbol Shift",
    subtitle: "TRANSFORMACIÓN / RECONOCIMIENTO VISUAL",
    prompt: "Seguí la transformación de los símbolos y elegí la configuración siguiente.",
    sequence: [...sequence, "?"],
    ...makeChoices(answer, alternatives, random),
    explanation:
      "En cada transición todos los símbolos avanzan una posición " +
      "en el orden circular. La respuesta mantiene esa regla.",
    hints: [
      "Seguí la posición de un símbolo a lo largo de varias transiciones.",
      "Todos los símbolos se desplazan una posición hacia la izquierda.",
    ],
  };
}

function createConditionalPuzzle(
  level: number,
  random: RandomSource,
): LogicPuzzle {
  const names = ["A", "B", "C", "D", "E"];
  const count = Math.min(5, 3 + Math.floor((level - 1) / 4));
  const nodes = names.slice(0, count);

  const lines = nodes.slice(0, -1).map(
    (node, i) =>
      `Si el nodo ${node} está activo, entonces ${nodes[i + 1]} está activo.`,
  );

  const forward = random() >= 0.5;
  const answer = forward ? "Activo" : "Inactivo";

  lines.push(
    forward
      ? `Premisa: el nodo ${nodes[0]} está activo.`
      : `Premisa: el nodo ${nodes[nodes.length - 1]} está inactivo.`,
  );

  const prompt = forward
    ? `¿Qué estado debe tener el nodo ${nodes[nodes.length - 1]}?`
    : `¿Qué se deduce necesariamente del nodo ${nodes[0]}?`;

  const explanation = forward
    ? "Aplicando cada implicación en cadena, el estado activo se transmite hasta el último nodo."
    : "Si un nodo estuviera activo, el siguiente también tendría que estarlo. Como el último está inactivo, la deducción inversa mediante contraposición obliga a que los anteriores también estén inactivos.";

  return {
    kind: "conditional-logic",
    level,
    title: "Conditional Chain",
    subtitle: "DEDUCCIÓN / IMPLICACIONES LÓGICAS",
    prompt,
    logicLines: lines,
    ...makeChoices(
      answer,
      ["No se puede determinar", "Ambos estados", "Desconocido"],
      random,
    ),
    explanation,
    hints: [
      "Respetá la dirección de cada implicación.",
      forward
        ? "Partí del primer nodo activo y seguí cada regla."
        : "Si el siguiente nodo está inactivo, el nodo anterior no puede estar activo.",
    ],
  };
}

export function generateLogicPuzzle(
  level: number,
  seed: number,
): LogicPuzzle {
  const safeLevel = Number.isFinite(level)
    ? Math.max(1, Math.min(99, Math.floor(level)))
    : 1;

  const random = createRandom(seed);

  switch ((safeLevel - 1) % 3) {
    case 0:
      return createNumberPuzzle(safeLevel, random);
    case 1:
      return createSymbolPuzzle(safeLevel, random);
    default:
      return createConditionalPuzzle(safeLevel, random);
  }
}

/**
 * Genera exclusivamente secuencias numéricas para Number Patterns.
 * Utiliza el mismo motor determinista que Logic Reactor.
 */
export function generateNumberPatternPuzzle(
  level: number,
  seed: number,
): LogicPuzzle {
  const safeLevel = Number.isFinite(level)
    ? Math.max(1, Math.min(99, Math.floor(level)))
    : 1;

  return createNumberPuzzle(safeLevel, createRandom(seed));
}
