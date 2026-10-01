/*
 * Trading Islands test infrastructure only.
 *
 * Production source intentionally uses bundler-style extensionless
 * TypeScript imports.
 *
 * Vite resolves those imports during normal development/builds,
 * while direct Node ESM execution with --experimental-strip-types
 * requires explicit .ts resolution.
 *
 * This loader bridges that difference for runtime tests without
 * modifying production imports.
 */

const RELATIVE_SPECIFIER =
  /^(?:\.{1,2}\/)/;

const HAS_EXTENSION =
  /(?:^|\/)[^/]+\.[A-Za-z0-9]+$/;

export async function resolve(
  specifier,
  context,
  nextResolve
) {
  try {
    return await nextResolve(
      specifier,
      context
    );
  } catch (
    error
  ) {
    if (
      !RELATIVE_SPECIFIER.test(
        specifier
      ) ||
      HAS_EXTENSION.test(
        specifier
      )
    ) {
      throw error;
    }

    const candidates = [
      `${specifier}.ts`,
      `${specifier}.tsx`,
      `${specifier}/index.ts`,
      `${specifier}/index.tsx`,
    ];

    for (
      const candidate of candidates
    ) {
      try {
        return await nextResolve(
          candidate,
          context
        );
      } catch {
        // Try the next TypeScript candidate.
      }
    }

    throw error;
  }
}
