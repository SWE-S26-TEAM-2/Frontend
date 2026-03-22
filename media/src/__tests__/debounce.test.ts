/**
 * debounce.test.ts
 *
 * Full coverage of the typed debounce utility.
 * Tests: delayed execution, reset on rapid calls, cancel(),
 *        immediate execution after delay, cleanup safety.
 */

import { debounce } from "@/utils/debounce";

describe("debounce", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("does not call fn immediately", () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 500);
    debounced();
    expect(fn).not.toHaveBeenCalled();
  });

  it("calls fn after the specified delay", () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 500);
    debounced();
    jest.advanceTimersByTime(500);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("resets the timer on each call — only fires once after last call", () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 300);

    debounced("a");
    jest.advanceTimersByTime(200);
    debounced("b");
    jest.advanceTimersByTime(200);
    debounced("c");
    jest.advanceTimersByTime(300);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("c");
  });

  it("passes arguments correctly to fn", () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 100);
    debounced("hello", 42);
    jest.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledWith("hello", 42);
  });

  it("cancel() prevents pending invocation", () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 500);
    debounced();
    debounced.cancel();
    jest.advanceTimersByTime(500);
    expect(fn).not.toHaveBeenCalled();
  });

  it("cancel() is safe to call when no pending timer exists", () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 500);
    expect(() => debounced.cancel()).not.toThrow();
  });

  it("can be called again after cancel()", () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 200);
    debounced("first");
    debounced.cancel();
    debounced("second");
    jest.advanceTimersByTime(200);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("second");
  });

  it("fires exactly once per quiet period even with many rapid calls", () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 100);
    for (let i = 0; i < 50; i++) debounced(i);
    jest.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(49); // last argument wins
  });

  it("supports multiple independent instances", () => {
    const fnA = jest.fn();
    const fnB = jest.fn();
    const dA = debounce(fnA, 200);
    const dB = debounce(fnB, 400);

    dA();
    dB();

    jest.advanceTimersByTime(200);
    expect(fnA).toHaveBeenCalledTimes(1);
    expect(fnB).not.toHaveBeenCalled();

    jest.advanceTimersByTime(200);
    expect(fnB).toHaveBeenCalledTimes(1);
  });
});
