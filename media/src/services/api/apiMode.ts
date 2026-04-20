export function unsupportedApiFeature(feature: string): never {
  throw new Error(
    `[API mode] ${feature} is not implemented on the backend. Set NEXT_PUBLIC_USE_MOCK_API=true to use mocks instead.`
  );
}
