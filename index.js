import { effect } from "./effect.js";
import { ref } from "./ref.js";
import { computed } from "./computed.js";

// 测试只读计算属性
console.log("Testing read-only computed property:");

const count = ref(0);

const double = computed(() => count.value * 2);

effect(() => {
  console.log("double:", double.value); // 输出: double: 0
});

count.value = 1; // 输出: double: 2
count.value = 2; // 输出: double: 4

// 测试可写的计算属性
console.log("\nTesting writable computed property:");

const firstName = ref("John");
const lastName = ref("Doe");

const fullName = computed({
  get: () => `${firstName.value} ${lastName.value}`,
  set: (newValue) => {
    [firstName.value, lastName.value] = newValue.split(" ");
  },
});

effect(() => {
  console.log("fullName:", fullName.value); // 输出: fullName: John Doe
});

fullName.value = "Jane Smith"; // 输出: fullName: Jane Smith
console.log("firstName:", firstName.value); // 输出: firstName: Jane
console.log("lastName:", lastName.value); // 输出: lastName: Smith

// 测试依赖收集和触发
console.log("\nTesting dependency collection and triggering:");

const a = ref(1);
const b = ref(2);

const sum = computed(() => a.value + b.value);

effect(() => {
  console.log("sum:", sum.value); // 输出: sum: 3
});

a.value = 3; // 输出: sum: 5
b.value = 4; // 输出: sum: 7

// 测试没有变化的情况
console.log("\nTesting no change:");

const noChange = ref(5);

const sameValue = computed(() => noChange.value);

effect(() => {
  console.log("sameValue:", sameValue.value); // 输出: sameValue: 5
});

noChange.value = 5; // 不应该输出任何内容
