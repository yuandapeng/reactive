import { ref } from "@/ref";
import { computed } from "@/computed";

describe("computed", () => {
  it("should return the correct computed value", () => {
    const count = ref(0);
    const double = computed(() => count.value * 2);

    expect(double.value).toBe(0);

    count.value++;
    expect(double.value).toBe(2);
  });

  it("should not recompute if dependencies have not changed", () => {
    const count = ref(0);
    const getter = jest.fn(() => count.value * 2);
    const double = computed(getter);

    expect(double.value).toBe(0);
    expect(getter).toHaveBeenCalledTimes(1);

    double.value;
    expect(getter).toHaveBeenCalledTimes(1);

    count.value++;
    expect(double.value).toBe(2);
    expect(getter).toHaveBeenCalledTimes(2);
  });

  it("should support writable computed properties", () => {
    const count = ref(0);
    const double = computed({
      get: () => count.value * 2,
      set: (val) => {
        count.value = val / 2;
      },
    });

    expect(double.value).toBe(0);

    double.value = 4;
    expect(count.value).toBe(2);
    expect(double.value).toBe(4);
  });
});
