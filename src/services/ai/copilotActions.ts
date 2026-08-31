import type { ToolMode } from '../../components/ToolWorkspace';

export type CopilotActionType =
  | 'set_title'
  | 'set_subtitle'
  | 'toggle_pricing'
  | 'toggle_faq'
  | 'set_mode'
  | 'modernize'
  | 'seo_audit';

export interface CopilotAction {
  type: CopilotActionType;
  value?: string;
  mode?: ToolMode;
}

export interface CopilotActionResult {
  actions: CopilotAction[];
  reply: string;
}

export function parseCopilotInstruction(
  input: string
): CopilotActionResult {
  const text = input.trim().toLowerCase();
  const actions: CopilotAction[] = [];
  const replies: string[] = [];

  if (
    text.includes('moderno') ||
    text.includes('moderna') ||
    text.includes('elegante') ||
    text.includes('premium') ||
    text.includes('neón') ||
    text.includes('neon')
  ) {
    actions.push({ type: 'modernize' });
    replies.push(
      'Apliqué un estilo más moderno, premium y tecnológico.'
    );
  }

  if (
    text.includes('precio') ||
    text.includes('precios') ||
    text.includes('planes') ||
    text.includes('pricing')
  ) {
    actions.push({ type: 'toggle_pricing', value: 'on' });
    replies.push('Activé la sección de precios.');
  }

  if (
    text.includes('quitar precios') ||
    text.includes('ocultar precios') ||
    text.includes('sin precios')
  ) {
    actions.push({ type: 'toggle_pricing', value: 'off' });
    replies.push('Oculté la sección de precios.');
  }

  if (
    text.includes('faq') ||
    text.includes('preguntas frecuentes')
  ) {
    actions.push({ type: 'toggle_faq', value: 'toggle' });
    replies.push('Actualicé la sección FAQ.');
  }

  if (
    text.includes('seo') ||
    text.includes('optimizar seo') ||
    text.includes('audita seo') ||
    text.includes('auditoría seo')
  ) {
    actions.push({ type: 'seo_audit' });
    replies.push(
      'Ejecuté la auditoría SEO local del proyecto.'
    );
  }

  if (
    text.includes('tienda') ||
    text.includes('ecommerce') ||
    text.includes('e-commerce')
  ) {
    actions.push({
      type: 'set_mode',
      mode: 'store',
    });
    replies.push('Cambié el entorno a Tienda Virtual.');
  }

  if (
    text.includes('landing') ||
    text.includes('landing page')
  ) {
    actions.push({
      type: 'set_mode',
      mode: 'landing',
    });
    replies.push('Cambié el entorno a Landing Page.');
  }

  if (
    text.includes('nft') ||
    text.includes('web3')
  ) {
    actions.push({
      type: 'set_mode',
      mode: 'nft',
    });
    replies.push('Cambié el entorno a NFTs & Web3.');
  }

  if (
    text.includes('herramientas dev') ||
    text.includes('pro tools') ||
    text.includes('terminal')
  ) {
    actions.push({
      type: 'set_mode',
      mode: 'pro',
    });
    replies.push('Cambié el entorno a Pro Tools.');
  }

  if (
    text.includes('sitio web') ||
    text.includes('web con ia') ||
    text.includes('desarrollo web')
  ) {
    actions.push({
      type: 'set_mode',
      mode: 'web',
    });
    replies.push('Cambié el entorno a Desarrollo Web con IA.');
  }

  const titleMatch =
    input.match(/(?:título|titulo|titular)\s*[:=-]\s*(.+)$/i);

  if (titleMatch?.[1]) {
    actions.push({
      type: 'set_title',
      value: titleMatch[1].trim(),
    });
    replies.push('Actualicé el título principal.');
  }

  const subtitleMatch =
    input.match(/(?:subtítulo|subtitulo)\s*[:=-]\s*(.+)$/i);

  if (subtitleMatch?.[1]) {
    actions.push({
      type: 'set_subtitle',
      value: subtitleMatch[1].trim(),
    });
    replies.push('Actualicé el subtítulo.');
  }

  if (actions.length === 0) {
    actions.push({
      type: 'set_title',
      value: input.trim().slice(0, 90),
    });

    replies.push(
      'Convertí tu instrucción en un cambio de contenido para el proyecto.'
    );
  }

  return {
    actions,
    reply: replies.join(' '),
  };
}
