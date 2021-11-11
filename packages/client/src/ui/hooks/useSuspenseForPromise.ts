import useTeardown from "./useTeardown";

const cache = new Map<unknown, SuspenseState<unknown>>();

type SuspenseState<T> = SuspenseNone | SuspenseError | SuspenseValue<T>;
type SuspenseNone = [];
type SuspenseError = { error: Error };
type SuspenseValue<T> = { value: T };

// https://reactjs.org/docs/concurrent-mode-suspense.html#what-is-suspense-exactly
export default function useSuspenseForPromise<T>(key: string, promiseFactory: () => Promise<T>): T {
  const makePromise = async () => {
    try {
      const value = await promiseFactory();
      cache.set(key, { value });
    } catch (error) {
      if (!(error instanceof Error)) {
        console.error("error not instance of error", error);
        throw new Error("grr");
      }

      cache.set(key, { error });
    }
  };

  const state = cache.get(key) as SuspenseState<T> | undefined;
  if (!state) {
    throw makePromise();
  }

  useTeardown(
    () => () => {
      cache.delete(key);
    },
    []
  );

  if ("error" in state) throw state.error;
  if ("value" in state) return state.value;

  throw new Error("impossible");
}
