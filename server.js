const express = require('express');
const cors = require('cors');
const { exec, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// ─── SERVE FRONTEND ───────────────────────────────────────────────────────────
// Auto-detects whether files are in a flat layout (server.js + index.html
// side by side) or a nested layout (backend/ + frontend/ sibling folders).
function findFrontend() {
  const candidates = [
    path.join(__dirname, 'index.html'),                    // flat: same folder
    path.join(__dirname, '..', 'frontend', 'index.html'), // nested: ../frontend/
    path.join(__dirname, 'frontend', 'index.html'),        // nested: ./frontend/
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return path.dirname(c);
  }
  return __dirname;
}
const FRONTEND = findFrontend();
app.use(express.static(FRONTEND));
app.get('/', (req, res) => res.sendFile(path.join(FRONTEND, 'index.html')));

// ─── PROBLEMS DATABASE ───────────────────────────────────────────────────────

const problems = [
  // 1. Introduction to Go
  {
    id: 1, category: 1, categoryName: "Introduction to Go",
    title: "Hello, Gopher!",
    difficulty: "easy",
    description: `Write a Go program that prints exactly: \`Hello, Gopher!\`\n\nThis is your first Go program. Every Go program starts with a \`package main\` declaration and a \`main()\` function.`,
    starterCode: `package main\n\nimport "fmt"\n\nfunc main() {\n\t// Your code here\n}`,
    solution: `package main\n\nimport "fmt"\n\nfunc main() {\n\tfmt.Println("Hello, Gopher!")\n}`,
    expectedOutput: "Hello, Gopher!\n",
    hints: ["Use fmt.Println() to print with a newline", "String literals use double quotes in Go"],
    tags: ["fmt", "println", "basics"]
  },
  {
    id: 2, category: 1, categoryName: "Introduction to Go",
    title: "Multiple Prints",
    difficulty: "easy",
    description: `Print the following three lines in order:\n\`\`\`\nGo is fast\nGo is simple\nGo is fun\n\`\`\``,
    starterCode: `package main\n\nimport "fmt"\n\nfunc main() {\n\t// Print three lines\n}`,
    solution: `package main\n\nimport "fmt"\n\nfunc main() {\n\tfmt.Println("Go is fast")\n\tfmt.Println("Go is simple")\n\tfmt.Println("Go is fun")\n}`,
    expectedOutput: "Go is fast\nGo is simple\nGo is fun\n",
    hints: ["Call fmt.Println three times", "Each Println adds a newline automatically"],
    tags: ["fmt", "println"]
  },
  {
    id: 3, category: 1, categoryName: "Introduction to Go",
    title: "Formatted Output",
    difficulty: "easy",
    description: `Use \`fmt.Printf\` to print: \`My name is Go and I am 14 years old\`\n\nUse format verbs: \`%s\` for strings and \`%d\` for integers.`,
    starterCode: `package main\n\nimport "fmt"\n\nfunc main() {\n\tname := "Go"\n\tage := 14\n\t// Use fmt.Printf with name and age\n}`,
    solution: `package main\n\nimport "fmt"\n\nfunc main() {\n\tname := "Go"\n\tage := 14\n\tfmt.Printf("My name is %s and I am %d years old\\n", name, age)\n}`,
    expectedOutput: "My name is Go and I am 14 years old\n",
    hints: ["fmt.Printf doesn't add newline automatically — use \\n", "%s for string, %d for int"],
    tags: ["fmt", "printf", "format-verbs"]
  },

  // 2. Language Basics
  {
    id: 4, category: 2, categoryName: "Language Basics",
    title: "Variable Declaration",
    difficulty: "easy",
    description: `Declare and print the following variables:\n- \`city\` as a string with value \`"Nairobi"\`\n- \`population\` as an int with value \`4922000\`\n- \`isCapital\` as a bool with value \`true\`\n\nPrint them one per line.`,
    starterCode: `package main\n\nimport "fmt"\n\nfunc main() {\n\t// Declare variables here\n\t// Print them\n}`,
    solution: `package main\n\nimport "fmt"\n\nfunc main() {\n\tcity := "Nairobi"\n\tpopulation := 4922000\n\tisCapital := true\n\tfmt.Println(city)\n\tfmt.Println(population)\n\tfmt.Println(isCapital)\n}`,
    expectedOutput: "Nairobi\n4922000\ntrue\n",
    hints: ["Use := for short variable declaration", "Go infers types automatically"],
    tags: ["variables", "types", "declaration"]
  },
  {
    id: 5, category: 2, categoryName: "Language Basics",
    title: "Constants",
    difficulty: "easy",
    description: `Define a constant \`Pi\` with value \`3.14159\` and a constant \`AppName\` with value \`"GoLearn"\`.\n\nPrint: \`AppName uses Pi = 3.14159\``,
    starterCode: `package main\n\nimport "fmt"\n\n// Define constants here\n\nfunc main() {\n\t// Print the line\n}`,
    solution: `package main\n\nimport "fmt"\n\nconst Pi = 3.14159\nconst AppName = "GoLearn"\n\nfunc main() {\n\tfmt.Printf("%s uses Pi = %g\\n", AppName, Pi)\n}`,
    expectedOutput: "GoLearn uses Pi = 3.14159\n",
    hints: ["Use const keyword outside or inside functions", "%g is a clean float format verb"],
    tags: ["constants", "const", "fmt"]
  },
  {
    id: 6, category: 2, categoryName: "Language Basics",
    title: "Type Conversion",
    difficulty: "medium",
    description: `Convert between types and print results:\n1. Convert \`int\` \`42\` to \`float64\` and print it\n2. Convert \`float64\` \`3.99\` to \`int\` (truncation) and print it\n3. Convert \`int\` \`65\` to \`string\` using \`string(rune(65))\` and print it\n\nExpected output:\n\`\`\`\n42\n3\nA\n\`\`\``,
    starterCode: `package main\n\nimport "fmt"\n\nfunc main() {\n\ti := 42\n\tf := 3.99\n\tn := 65\n\t// Convert and print each\n}`,
    solution: `package main\n\nimport "fmt"\n\nfunc main() {\n\ti := 42\n\tf := 3.99\n\tn := 65\n\tfmt.Println(float64(i))\n\tfmt.Println(int(f))\n\tfmt.Println(string(rune(n)))\n}`,
    expectedOutput: "42\n3\nA\n",
    hints: ["Use T(value) syntax for type conversion", "float64(42) prints as 42 not 42.0"],
    tags: ["type-conversion", "casting", "types"]
  },

  // 3. Composite Types
  {
    id: 7, category: 3, categoryName: "Composite Types",
    title: "Array Sum",
    difficulty: "easy",
    description: `Create an array of 5 integers \`[10, 20, 30, 40, 50]\`, compute the sum, and print: \`Sum: 150\``,
    starterCode: `package main\n\nimport "fmt"\n\nfunc main() {\n\t// Create array and compute sum\n}`,
    solution: `package main\n\nimport "fmt"\n\nfunc main() {\n\tnumbers := [5]int{10, 20, 30, 40, 50}\n\tsum := 0\n\tfor _, v := range numbers {\n\t\tsum += v\n\t}\n\tfmt.Printf("Sum: %d\\n", sum)\n}`,
    expectedOutput: "Sum: 150\n",
    hints: ["Arrays in Go have fixed size: [5]int{...}", "Use range to iterate"],
    tags: ["arrays", "range", "loops"]
  },
  {
    id: 8, category: 3, categoryName: "Composite Types",
    title: "Slice Operations",
    difficulty: "medium",
    description: `Start with slice \`[]int{1, 2, 3}\`.\n1. Append \`4\` and \`5\`\n2. Print the slice\n3. Print its length and capacity\n\nExpected output:\n\`\`\`\n[1 2 3 4 5]\nlen=5 cap=6\n\`\`\``,
    starterCode: `package main\n\nimport "fmt"\n\nfunc main() {\n\ts := []int{1, 2, 3}\n\t// Append and print\n}`,
    solution: `package main\n\nimport "fmt"\n\nfunc main() {\n\ts := []int{1, 2, 3}\n\ts = append(s, 4, 5)\n\tfmt.Println(s)\n\tfmt.Printf("len=%d cap=%d\\n", len(s), cap(s))\n}`,
    expectedOutput: "[1 2 3 4 5]\nlen=5 cap=6\n",
    hints: ["append() returns a new slice", "cap() shows underlying array capacity"],
    tags: ["slices", "append", "len", "cap"]
  },
  {
    id: 9, category: 3, categoryName: "Composite Types",
    title: "Map Word Count",
    difficulty: "medium",
    description: `Count word frequencies in \`[]string{"go", "is", "go", "fast", "go"}\` using a map.\n\nPrint each word and its count in alphabetical order:\n\`\`\`\nfast: 1\ngo: 3\nis: 1\n\`\`\``,
    starterCode: `package main\n\nimport (\n\t"fmt"\n\t"sort"\n)\n\nfunc main() {\n\twords := []string{"go", "is", "go", "fast", "go"}\n\t// Count and print sorted\n}`,
    solution: `package main\n\nimport (\n\t"fmt"\n\t"sort"\n)\n\nfunc main() {\n\twords := []string{"go", "is", "go", "fast", "go"}\n\tcounts := make(map[string]int)\n\tfor _, w := range words {\n\t\tcounts[w]++\n\t}\n\tkeys := make([]string, 0, len(counts))\n\tfor k := range counts {\n\t\tkeys = append(keys, k)\n\t}\n\tsort.Strings(keys)\n\tfor _, k := range keys {\n\t\tfmt.Printf("%s: %d\\n", k, counts[k])\n\t}\n}`,
    expectedOutput: "fast: 1\ngo: 3\nis: 1\n",
    hints: ["make(map[string]int) creates a map", "Sort keys before printing for deterministic output"],
    tags: ["maps", "sort", "range"]
  },
  {
    id: 10, category: 3, categoryName: "Composite Types",
    title: "Struct Person",
    difficulty: "medium",
    description: `Define a \`Person\` struct with fields \`Name\` (string) and \`Age\` (int).\n\nCreate two people: \`Alice\` age \`30\` and \`Bob\` age \`25\`.\n\nPrint:\n\`\`\`\nAlice is 30 years old\nBob is 25 years old\n\`\`\``,
    starterCode: `package main\n\nimport "fmt"\n\n// Define Person struct here\n\nfunc main() {\n\t// Create and print people\n}`,
    solution: `package main\n\nimport "fmt"\n\ntype Person struct {\n\tName string\n\tAge  int\n}\n\nfunc main() {\n\tp1 := Person{Name: "Alice", Age: 30}\n\tp2 := Person{Name: "Bob", Age: 25}\n\tfmt.Printf("%s is %d years old\\n", p1.Name, p1.Age)\n\tfmt.Printf("%s is %d years old\\n", p2.Name, p2.Age)\n}`,
    expectedOutput: "Alice is 30 years old\nBob is 25 years old\n",
    hints: ["type Person struct { ... }", "Access fields with dot notation: p.Name"],
    tags: ["structs", "types"]
  },

  // 4. Control Flow
  {
    id: 11, category: 4, categoryName: "Control Flow",
    title: "FizzBuzz",
    difficulty: "easy",
    description: `Print numbers 1-15. For multiples of 3 print \`Fizz\`, multiples of 5 print \`Buzz\`, multiples of both print \`FizzBuzz\`.`,
    starterCode: `package main\n\nimport "fmt"\n\nfunc main() {\n\t// FizzBuzz 1 to 15\n}`,
    solution: `package main\n\nimport "fmt"\n\nfunc main() {\n\tfor i := 1; i <= 15; i++ {\n\t\tif i%15 == 0 {\n\t\t\tfmt.Println("FizzBuzz")\n\t\t} else if i%3 == 0 {\n\t\t\tfmt.Println("Fizz")\n\t\t} else if i%5 == 0 {\n\t\t\tfmt.Println("Buzz")\n\t\t} else {\n\t\t\tfmt.Println(i)\n\t\t}\n\t}\n}`,
    expectedOutput: "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz\n",
    hints: ["Check divisibility with %", "Check FizzBuzz (15) before Fizz or Buzz"],
    tags: ["if-else", "loops", "modulo"]
  },
  {
    id: 12, category: 4, categoryName: "Control Flow",
    title: "Switch Day Name",
    difficulty: "easy",
    description: `Use a \`switch\` statement to convert a day number (1-7) to its name. For \`dayNum := 3\`, print \`Wednesday\`. For any other number print \`Unknown\`.`,
    starterCode: `package main\n\nimport "fmt"\n\nfunc main() {\n\tdayNum := 3\n\t// Use switch to print day name\n}`,
    solution: `package main\n\nimport "fmt"\n\nfunc main() {\n\tdayNum := 3\n\tswitch dayNum {\n\tcase 1:\n\t\tfmt.Println("Monday")\n\tcase 2:\n\t\tfmt.Println("Tuesday")\n\tcase 3:\n\t\tfmt.Println("Wednesday")\n\tcase 4:\n\t\tfmt.Println("Thursday")\n\tcase 5:\n\t\tfmt.Println("Friday")\n\tcase 6:\n\t\tfmt.Println("Saturday")\n\tcase 7:\n\t\tfmt.Println("Sunday")\n\tdefault:\n\t\tfmt.Println("Unknown")\n\t}\n}`,
    expectedOutput: "Wednesday\n",
    hints: ["Go switch doesn't need break statements", "Use default: for the fallback case"],
    tags: ["switch", "control-flow"]
  },
  {
    id: 13, category: 4, categoryName: "Control Flow",
    title: "Loop with Continue",
    difficulty: "medium",
    description: `Print all numbers from 1 to 10, skipping multiples of 3. Use \`continue\`.\n\nExpected output:\n\`\`\`\n1\n2\n4\n5\n7\n8\n10\n\`\`\``,
    starterCode: `package main\n\nimport "fmt"\n\nfunc main() {\n\t// Loop 1-10, skip multiples of 3\n}`,
    solution: `package main\n\nimport "fmt"\n\nfunc main() {\n\tfor i := 1; i <= 10; i++ {\n\t\tif i%3 == 0 {\n\t\t\tcontinue\n\t\t}\n\t\tfmt.Println(i)\n\t}\n}`,
    expectedOutput: "1\n2\n4\n5\n7\n8\n10\n",
    hints: ["continue skips the rest of the loop body", "i%3 == 0 checks divisibility by 3"],
    tags: ["loops", "continue", "control-flow"]
  },

  // 5. Functions
  {
    id: 14, category: 5, categoryName: "Functions",
    title: "Variadic Sum",
    difficulty: "medium",
    description: `Write a variadic function \`sum(nums ...int) int\` that returns the sum of all arguments.\n\nCall it with:\n- \`sum(1, 2, 3)\` → print result\n- \`sum(10, 20, 30, 40)\` → print result\n\nExpected output:\n\`\`\`\n6\n100\n\`\`\``,
    starterCode: `package main\n\nimport "fmt"\n\n// Write sum function here\n\nfunc main() {\n\tfmt.Println(sum(1, 2, 3))\n\tfmt.Println(sum(10, 20, 30, 40))\n}`,
    solution: `package main\n\nimport "fmt"\n\nfunc sum(nums ...int) int {\n\ttotal := 0\n\tfor _, n := range nums {\n\t\ttotal += n\n\t}\n\treturn total\n}\n\nfunc main() {\n\tfmt.Println(sum(1, 2, 3))\n\tfmt.Println(sum(10, 20, 30, 40))\n}`,
    expectedOutput: "6\n100\n",
    hints: ["Variadic params use ...type syntax", "Inside the function, nums is a []int slice"],
    tags: ["functions", "variadic", "range"]
  },
  {
    id: 15, category: 5, categoryName: "Functions",
    title: "Multiple Return Values",
    difficulty: "medium",
    description: `Write a function \`divide(a, b float64) (float64, error)\` that returns the quotient or an error if \`b == 0\`.\n\nTest with \`divide(10, 3)\` and \`divide(5, 0)\`.\n\nExpected output:\n\`\`\`\n3.3333333333333335 <nil>\n0 division by zero\n\`\`\``,
    starterCode: `package main\n\nimport (\n\t"errors"\n\t"fmt"\n)\n\n// Write divide function here\n\nfunc main() {\n\tfmt.Println(divide(10, 3))\n\tfmt.Println(divide(5, 0))\n}`,
    solution: `package main\n\nimport (\n\t"errors"\n\t"fmt"\n)\n\nfunc divide(a, b float64) (float64, error) {\n\tif b == 0 {\n\t\treturn 0, errors.New("division by zero")\n\t}\n\treturn a / b, nil\n}\n\nfunc main() {\n\tfmt.Println(divide(10, 3))\n\tfmt.Println(divide(5, 0))\n}`,
    expectedOutput: "3.3333333333333335 <nil>\n0 division by zero\n",
    hints: ["Multiple returns: (float64, error)", "Return nil for no error"],
    tags: ["functions", "multiple-returns", "errors"]
  },
  {
    id: 16, category: 5, categoryName: "Functions",
    title: "Fibonacci Closure",
    difficulty: "hard",
    description: `Write a \`fibonacci()\` function that returns a **closure**. Each call to the returned function yields the next Fibonacci number.\n\nCall the closure 8 times and print each value.\n\nExpected output:\n\`\`\`\n0\n1\n1\n2\n3\n5\n8\n13\n\`\`\``,
    starterCode: `package main\n\nimport "fmt"\n\n// Write fibonacci function returning a closure\n\nfunc main() {\n\tf := fibonacci()\n\tfor i := 0; i < 8; i++ {\n\t\tfmt.Println(f())\n\t}\n}`,
    solution: `package main\n\nimport "fmt"\n\nfunc fibonacci() func() int {\n\ta, b := 0, 1\n\treturn func() int {\n\t\tv := a\n\t\ta, b = b, a+b\n\t\treturn v\n\t}\n}\n\nfunc main() {\n\tf := fibonacci()\n\tfor i := 0; i < 8; i++ {\n\t\tfmt.Println(f())\n\t}\n}`,
    expectedOutput: "0\n1\n1\n2\n3\n5\n8\n13\n",
    hints: ["A closure captures variables from its outer scope", "Return func() int from fibonacci()"],
    tags: ["closures", "functions", "fibonacci"]
  },

  // 6. Pointers & Memory
  {
    id: 17, category: 6, categoryName: "Pointers & Memory",
    title: "Pointer Basics",
    difficulty: "medium",
    description: `Demonstrate pointers:\n1. Create \`x := 42\`\n2. Create pointer \`p := &x\`\n3. Print \`x\`, \`p\` (the address), and \`*p\` (dereferenced value)\n4. Change \`x\` to \`100\` via the pointer\n5. Print \`x\` again\n\nExpected output (address will differ):\n\`\`\`\n42\ntrue\n42\n100\n\`\`\`\n\n*(Print \`p != nil\` as true instead of the actual address)*`,
    starterCode: `package main\n\nimport "fmt"\n\nfunc main() {\n\tx := 42\n\tp := &x\n\tfmt.Println(x)\n\tfmt.Println(p != nil)\n\tfmt.Println(*p)\n\t// Modify x through the pointer\n\tfmt.Println(x)\n}`,
    solution: `package main\n\nimport "fmt"\n\nfunc main() {\n\tx := 42\n\tp := &x\n\tfmt.Println(x)\n\tfmt.Println(p != nil)\n\tfmt.Println(*p)\n\t*p = 100\n\tfmt.Println(x)\n}`,
    expectedOutput: "42\ntrue\n42\n100\n",
    hints: ["& gives address, * dereferences", "*p = 100 changes x through the pointer"],
    tags: ["pointers", "memory", "dereferencing"]
  },
  {
    id: 18, category: 6, categoryName: "Pointers & Memory",
    title: "Pointer to Struct",
    difficulty: "medium",
    description: `Create a \`Counter\` struct with an \`int\` field \`Value\`.\nWrite \`increment(c *Counter)\` that adds 1 to \`c.Value\`.\n\nCall increment 3 times and print the final value.\n\nExpected output:\n\`\`\`\n3\n\`\`\``,
    starterCode: `package main\n\nimport "fmt"\n\ntype Counter struct {\n\tValue int\n}\n\n// Write increment function\n\nfunc main() {\n\tc := Counter{}\n\t// Call increment 3 times\n\tfmt.Println(c.Value)\n}`,
    solution: `package main\n\nimport "fmt"\n\ntype Counter struct {\n\tValue int\n}\n\nfunc increment(c *Counter) {\n\tc.Value++\n}\n\nfunc main() {\n\tc := Counter{}\n\tincrement(&c)\n\tincrement(&c)\n\tincrement(&c)\n\tfmt.Println(c.Value)\n}`,
    expectedOutput: "3\n",
    hints: ["Pass &c to get a pointer to c", "Go auto-dereferences: c.Value works even on a pointer"],
    tags: ["pointers", "structs", "memory"]
  },

  // 7. Methods & Interfaces
  {
    id: 19, category: 7, categoryName: "Methods & Interfaces",
    title: "Method on Struct",
    difficulty: "medium",
    description: `Add an \`Area() float64\` method to a \`Rectangle\` struct (Width, Height float64).\n\nCreate a 5×3 rectangle and print: \`Area: 15\``,
    starterCode: `package main\n\nimport "fmt"\n\ntype Rectangle struct {\n\tWidth, Height float64\n}\n\n// Add Area method here\n\nfunc main() {\n\tr := Rectangle{Width: 5, Height: 3}\n\tfmt.Printf("Area: %g\\n", r.Area())\n}`,
    solution: `package main\n\nimport "fmt"\n\ntype Rectangle struct {\n\tWidth, Height float64\n}\n\nfunc (r Rectangle) Area() float64 {\n\treturn r.Width * r.Height\n}\n\nfunc main() {\n\tr := Rectangle{Width: 5, Height: 3}\n\tfmt.Printf("Area: %g\\n", r.Area())\n}`,
    expectedOutput: "Area: 15\n",
    hints: ["Method syntax: func (r Rectangle) Area() float64", "Value receiver doesn't modify the struct"],
    tags: ["methods", "structs", "receivers"]
  },
  {
    id: 20, category: 7, categoryName: "Methods & Interfaces",
    title: "Shape Interface",
    difficulty: "hard",
    description: `Define a \`Shape\` interface with \`Area() float64\` and \`Perimeter() float64\`.\n\nImplement it for \`Circle\` (radius) and \`Rectangle\` (w, h).\n\nPrint area and perimeter for Circle(r=5) and Rectangle(4×3):\n\`\`\`\nCircle area: 78.53981633974483\nCircle perimeter: 31.41592653589793\nRect area: 12\nRect perimeter: 14\n\`\`\``,
    starterCode: `package main\n\nimport (\n\t"fmt"\n\t"math"\n)\n\n// Define Shape interface\n// Implement Circle and Rectangle\n\nfunc printShape(s Shape) {\n\tfmt.Printf("area: %g\\n", s.Area())\n\tfmt.Printf("perimeter: %g\\n", s.Perimeter())\n}\n\nfunc main() {\n\t// Create and print shapes\n}`,
    solution: `package main\n\nimport (\n\t"fmt"\n\t"math"\n)\n\ntype Shape interface {\n\tArea() float64\n\tPerimeter() float64\n}\n\ntype Circle struct{ Radius float64 }\ntype Rectangle struct{ Width, Height float64 }\n\nfunc (c Circle) Area() float64      { return math.Pi * c.Radius * c.Radius }\nfunc (c Circle) Perimeter() float64 { return 2 * math.Pi * c.Radius }\n\nfunc (r Rectangle) Area() float64      { return r.Width * r.Height }\nfunc (r Rectangle) Perimeter() float64 { return 2 * (r.Width + r.Height) }\n\nfunc main() {\n\tc := Circle{Radius: 5}\n\tr := Rectangle{Width: 4, Height: 3}\n\tfmt.Printf("Circle area: %g\\n", c.Area())\n\tfmt.Printf("Circle perimeter: %g\\n", c.Perimeter())\n\tfmt.Printf("Rect area: %g\\n", r.Area())\n\tfmt.Printf("Rect perimeter: %g\\n", r.Perimeter())\n}`,
    expectedOutput: "Circle area: 78.53981633974483\nCircle perimeter: 31.41592653589793\nRect area: 12\nRect perimeter: 14\n",
    hints: ["A type implements an interface by having all its methods", "math.Pi is the Pi constant"],
    tags: ["interfaces", "methods", "polymorphism"]
  },

  // 8. Error Handling
  {
    id: 21, category: 8, categoryName: "Error Handling",
    title: "Custom Error Type",
    difficulty: "medium",
    description: `Create a custom \`ValidationError\` struct implementing the \`error\` interface.\n\nWrite \`validateAge(age int) error\` that returns \`ValidationError\` if age < 0 or > 150.\n\nTest with ages -1, 25, 200 and print results:\n\`\`\`\nInvalid age: -1 is out of range\nAge 25 is valid\nInvalid age: 200 is out of range\n\`\`\``,
    starterCode: `package main\n\nimport "fmt"\n\n// Define ValidationError struct\n// Implement Error() string method\n// Write validateAge function\n\nfunc main() {\n\tages := []int{-1, 25, 200}\n\tfor _, age := range ages {\n\t\tif err := validateAge(age); err != nil {\n\t\t\tfmt.Println(err)\n\t\t} else {\n\t\t\tfmt.Printf("Age %d is valid\\n", age)\n\t\t}\n\t}\n}`,
    solution: `package main\n\nimport "fmt"\n\ntype ValidationError struct {\n\tValue   int\n\tMessage string\n}\n\nfunc (e ValidationError) Error() string {\n\treturn fmt.Sprintf("Invalid age: %d %s", e.Value, e.Message)\n}\n\nfunc validateAge(age int) error {\n\tif age < 0 || age > 150 {\n\t\treturn ValidationError{Value: age, Message: "is out of range"}\n\t}\n\treturn nil\n}\n\nfunc main() {\n\tages := []int{-1, 25, 200}\n\tfor _, age := range ages {\n\t\tif err := validateAge(age); err != nil {\n\t\t\tfmt.Println(err)\n\t\t} else {\n\t\t\tfmt.Printf("Age %d is valid\\n", age)\n\t\t}\n\t}\n}`,
    expectedOutput: "Invalid age: -1 is out of range\nAge 25 is valid\nInvalid age: 200 is out of range\n",
    hints: ["Implement Error() string to satisfy the error interface", "Return nil for success"],
    tags: ["errors", "interfaces", "custom-types"]
  },
  {
    id: 22, category: 8, categoryName: "Error Handling",
    title: "Panic and Recover",
    difficulty: "hard",
    description: `Write a \`safeDivide(a, b int) (result int, err error)\` function that uses \`defer\` + \`recover()\` to catch a panic from integer division by zero.\n\nTest with \`safeDivide(10, 2)\` and \`safeDivide(10, 0)\`:\n\`\`\`\n5 <nil>\n0 recovered: runtime error: integer divide by zero\n\`\`\``,
    starterCode: `package main\n\nimport "fmt"\n\nfunc safeDivide(a, b int) (result int, err error) {\n\t// Use defer and recover here\n\treturn a / b, nil\n}\n\nfunc main() {\n\tfmt.Println(safeDivide(10, 2))\n\tfmt.Println(safeDivide(10, 0))\n}`,
    solution: `package main\n\nimport "fmt"\n\nfunc safeDivide(a, b int) (result int, err error) {\n\tdefer func() {\n\t\tif r := recover(); r != nil {\n\t\t\terr = fmt.Errorf("recovered: %v", r)\n\t\t}\n\t}()\n\treturn a / b, nil\n}\n\nfunc main() {\n\tfmt.Println(safeDivide(10, 2))\n\tfmt.Println(safeDivide(10, 0))\n}`,
    expectedOutput: "5 <nil>\n0 recovered: runtime error: integer divide by zero\n",
    hints: ["defer runs when the function returns", "recover() returns the panic value inside defer"],
    tags: ["panic", "recover", "defer", "error-handling"]
  },

  // 9. Concurrency
  {
    id: 23, category: 9, categoryName: "Concurrency",
    title: "Goroutine Hello",
    difficulty: "medium",
    description: `Launch 3 goroutines, each printing \`"Worker N done"\` (N = 1, 2, 3). Use a \`sync.WaitGroup\` to wait for all to finish before printing \`"All done"\`.\n\n*(Output order of workers may vary — only "All done" must be last)*\n\nExpected last line: \`All done\``,
    starterCode: `package main\n\nimport (\n\t"fmt"\n\t"sync"\n)\n\nfunc main() {\n\tvar wg sync.WaitGroup\n\tfor i := 1; i <= 3; i++ {\n\t\t// Launch goroutine\n\t}\n\twg.Wait()\n\tfmt.Println("All done")\n}`,
    solution: `package main\n\nimport (\n\t"fmt"\n\t"sync"\n)\n\nfunc main() {\n\tvar wg sync.WaitGroup\n\tfor i := 1; i <= 3; i++ {\n\t\twg.Add(1)\n\t\tgo func(n int) {\n\t\t\tdefer wg.Done()\n\t\t\tfmt.Printf("Worker %d done\\n", n)\n\t\t}(i)\n\t}\n\twg.Wait()\n\tfmt.Println("All done")\n}`,
    expectedOutput: "All done",
    hints: ["wg.Add(1) before goroutine, wg.Done() inside it", "Pass i as parameter to avoid closure capture issue"],
    tags: ["goroutines", "waitgroup", "concurrency"],
    partialMatch: true
  },
  {
    id: 24, category: 9, categoryName: "Concurrency",
    title: "Channel Pipeline",
    difficulty: "hard",
    description: `Create a simple pipeline:\n1. \`generate(nums ...int) <-chan int\`: sends nums into a channel\n2. \`square(in <-chan int) <-chan int\`: squares each value\n\nFeed \`1,2,3,4,5\` through the pipeline and print each squared value:\n\`\`\`\n1\n4\n9\n16\n25\n\`\`\``,
    starterCode: `package main\n\nimport "fmt"\n\nfunc generate(nums ...int) <-chan int {\n\t// Return channel with nums\n}\n\nfunc square(in <-chan int) <-chan int {\n\t// Return channel with squared values\n}\n\nfunc main() {\n\tfor v := range square(generate(1, 2, 3, 4, 5)) {\n\t\tfmt.Println(v)\n\t}\n}`,
    solution: `package main\n\nimport "fmt"\n\nfunc generate(nums ...int) <-chan int {\n\tout := make(chan int)\n\tgo func() {\n\t\tfor _, n := range nums {\n\t\t\tout <- n\n\t\t}\n\t\tclose(out)\n\t}()\n\treturn out\n}\n\nfunc square(in <-chan int) <-chan int {\n\tout := make(chan int)\n\tgo func() {\n\t\tfor n := range in {\n\t\t\tout <- n * n\n\t\t}\n\t\tclose(out)\n\t}()\n\treturn out\n}\n\nfunc main() {\n\tfor v := range square(generate(1, 2, 3, 4, 5)) {\n\t\tfmt.Println(v)\n\t}\n}`,
    expectedOutput: "1\n4\n9\n16\n25\n",
    hints: ["close(channel) signals range to stop", "Each stage runs in its own goroutine"],
    tags: ["channels", "goroutines", "pipelines", "concurrency"]
  },
  {
    id: 25, category: 9, categoryName: "Concurrency",
    title: "Mutex Counter",
    difficulty: "hard",
    description: `Use a \`sync.Mutex\` to safely increment a counter from 100 goroutines, each incrementing by 1.\n\nPrint the final count: \`Count: 100\``,
    starterCode: `package main\n\nimport (\n\t"fmt"\n\t"sync"\n)\n\ntype SafeCounter struct {\n\tmu sync.Mutex\n\tv  int\n}\n\nfunc (c *SafeCounter) Inc() {\n\t// Lock, increment, unlock\n}\n\nfunc main() {\n\tc := SafeCounter{}\n\tvar wg sync.WaitGroup\n\tfor i := 0; i < 100; i++ {\n\t\twg.Add(1)\n\t\tgo func() {\n\t\t\tdefer wg.Done()\n\t\t\tc.Inc()\n\t\t}()\n\t}\n\twg.Wait()\n\tfmt.Printf("Count: %d\\n", c.v)\n}`,
    solution: `package main\n\nimport (\n\t"fmt"\n\t"sync"\n)\n\ntype SafeCounter struct {\n\tmu sync.Mutex\n\tv  int\n}\n\nfunc (c *SafeCounter) Inc() {\n\tc.mu.Lock()\n\tc.v++\n\tc.mu.Unlock()\n}\n\nfunc main() {\n\tc := SafeCounter{}\n\tvar wg sync.WaitGroup\n\tfor i := 0; i < 100; i++ {\n\t\twg.Add(1)\n\t\tgo func() {\n\t\t\tdefer wg.Done()\n\t\t\tc.Inc()\n\t\t}()\n\t}\n\twg.Wait()\n\tfmt.Printf("Count: %d\\n", c.v)\n}`,
    expectedOutput: "Count: 100\n",
    hints: ["mu.Lock() before and mu.Unlock() after critical section", "defer mu.Unlock() is idiomatic"],
    tags: ["mutex", "concurrency", "sync", "goroutines"]
  },

  // 10. Standard Library
  {
    id: 26, category: 10, categoryName: "Standard Library",
    title: "JSON Marshal",
    difficulty: "medium",
    description: `Marshal a \`Person{Name: "Alice", Age: 30, Email: "alice@example.com"}\` struct to JSON.\n\nUse tags: \`json:"name"\`, \`json:"age"\`, \`json:"email"\`.\n\nPrint the JSON string:\n\`{"name":"Alice","age":30,"email":"alice@example.com"}\``,
    starterCode: `package main\n\nimport (\n\t"encoding/json"\n\t"fmt"\n)\n\ntype Person struct {\n\t// Add fields with JSON tags\n}\n\nfunc main() {\n\tp := Person{Name: "Alice", Age: 30, Email: "alice@example.com"}\n\t// Marshal and print\n}`,
    solution: `package main\n\nimport (\n\t"encoding/json"\n\t"fmt"\n)\n\ntype Person struct {\n\tName  string \`json:"name"\`\n\tAge   int    \`json:"age"\`\n\tEmail string \`json:"email"\`\n}\n\nfunc main() {\n\tp := Person{Name: "Alice", Age: 30, Email: "alice@example.com"}\n\tb, _ := json.Marshal(p)\n\tfmt.Println(string(b))\n}`,
    expectedOutput: `{"name":"Alice","age":30,"email":"alice@example.com"}` + "\n",
    hints: ['Struct tags: `json:"fieldname"`', "json.Marshal returns []byte — convert with string()"],
    tags: ["json", "encoding", "struct-tags", "stdlib"]
  },
  {
    id: 27, category: 10, categoryName: "Standard Library",
    title: "String Builder",
    difficulty: "medium",
    description: `Use \`strings.Builder\` to build the string \`"Go:is:awesome"\` by writing each part with \`WriteString\`, separated by \`:\`.\n\nPrint the final string.`,
    starterCode: `package main\n\nimport (\n\t"fmt"\n\t"strings"\n)\n\nfunc main() {\n\tvar sb strings.Builder\n\twords := []string{"Go", "is", "awesome"}\n\t// Build the string with : separator\n\tfmt.Println(sb.String())\n}`,
    solution: `package main\n\nimport (\n\t"fmt"\n\t"strings"\n)\n\nfunc main() {\n\tvar sb strings.Builder\n\twords := []string{"Go", "is", "awesome"}\n\tfor i, w := range words {\n\t\tif i > 0 {\n\t\t\tsb.WriteString(":")\n\t\t}\n\t\tsb.WriteString(w)\n\t}\n\tfmt.Println(sb.String())\n}`,
    expectedOutput: "Go:is:awesome\n",
    hints: ["sb.WriteString() appends to the builder", "sb.String() returns the final string"],
    tags: ["strings", "builder", "stdlib"]
  },

  // 11. Advanced Topics
  {
    id: 28, category: 11, categoryName: "Advanced Topics",
    title: "Reflection Type Inspector",
    difficulty: "hard",
    description: `Use the \`reflect\` package to inspect a struct at runtime.\n\nGiven \`type Dog struct { Name string; Breed string; Age int }\`, print each field's name and type:\n\`\`\`\nName: string\nBreed: string\nAge: int\n\`\`\``,
    starterCode: `package main\n\nimport (\n\t"fmt"\n\t"reflect"\n)\n\ntype Dog struct {\n\tName  string\n\tBreed string\n\tAge   int\n}\n\nfunc main() {\n\td := Dog{Name: "Rex", Breed: "Labrador", Age: 3}\n\t// Use reflect to print field names and types\n}`,
    solution: `package main\n\nimport (\n\t"fmt"\n\t"reflect"\n)\n\ntype Dog struct {\n\tName  string\n\tBreed string\n\tAge   int\n}\n\nfunc main() {\n\td := Dog{Name: "Rex", Breed: "Labrador", Age: 3}\n\tt := reflect.TypeOf(d)\n\tfor i := 0; i < t.NumField(); i++ {\n\t\tf := t.Field(i)\n\t\tfmt.Printf("%s: %s\\n", f.Name, f.Type)\n\t}\n}`,
    expectedOutput: "Name: string\nBreed: string\nAge: int\n",
    hints: ["reflect.TypeOf(x) gets the type", "t.NumField() and t.Field(i) iterate struct fields"],
    tags: ["reflection", "reflect", "advanced"]
  },
  {
    id: 29, category: 11, categoryName: "Advanced Topics",
    title: "Generic Min Function",
    difficulty: "hard",
    description: `Write a generic function \`Min[T constraints.Ordered](a, b T) T\` that returns the smaller value.\n\nTest with integers and strings:\n\`\`\`\n3\napple\n\`\`\``,
    starterCode: `package main\n\nimport (\n\t"fmt"\n\t"golang.org/x/exp/constraints"\n)\n\n// Write generic Min function\n\nfunc main() {\n\tfmt.Println(Min(3, 7))\n\tfmt.Println(Min("banana", "apple"))\n}`,
    solution: `package main\n\nimport "fmt"\n\nfunc Min[T interface{ ~int | ~float64 | ~string }](a, b T) T {\n\tif a < b {\n\t\treturn a\n\t}\n\treturn b\n}\n\nfunc main() {\n\tfmt.Println(Min(3, 7))\n\tfmt.Println(Min("banana", "apple"))\n}`,
    expectedOutput: "3\napple\n",
    hints: ["Generics use [T constraint] syntax", "Use inline interface constraint instead of external package"],
    tags: ["generics", "advanced", "constraints"]
  },
  {
    id: 30, category: 11, categoryName: "Advanced Topics",
    title: "Stringer Interface",
    difficulty: "medium",
    description: `Implement the \`fmt.Stringer\` interface for a \`Color\` type (int).\n\nDefine colors: Red=0, Green=1, Blue=2.\n\nWhen printed, each should show its name:\n\`\`\`\nRed\nGreen\nBlue\n\`\`\``,
    starterCode: `package main\n\nimport "fmt"\n\ntype Color int\n\nconst (\n\tRed Color = iota\n\tGreen\n\tBlue\n)\n\n// Implement String() method for Color\n\nfunc main() {\n\tfmt.Println(Red)\n\tfmt.Println(Green)\n\tfmt.Println(Blue)\n}`,
    solution: `package main\n\nimport "fmt"\n\ntype Color int\n\nconst (\n\tRed Color = iota\n\tGreen\n\tBlue\n)\n\nfunc (c Color) String() string {\n\tswitch c {\n\tcase Red:\n\t\treturn "Red"\n\tcase Green:\n\t\treturn "Green"\n\tcase Blue:\n\t\treturn "Blue"\n\t}\n\treturn "Unknown"\n}\n\nfunc main() {\n\tfmt.Println(Red)\n\tfmt.Println(Green)\n\tfmt.Println(Blue)\n}`,
    expectedOutput: "Red\nGreen\nBlue\n",
    hints: ["fmt.Stringer requires String() string method", "iota auto-increments in const blocks"],
    tags: ["interfaces", "stringer", "iota", "advanced"]
  }
];

// ─── ROUTES ───────────────────────────────────────────────────────────────────

app.get('/api/problems', (req, res) => {
  const safe = problems.map(({ solution, ...p }) => p);
  res.json(safe);
});

app.get('/api/problems/:id', (req, res) => {
  const p = problems.find(p => p.id === parseInt(req.params.id));
  if (!p) return res.status(404).json({ error: 'Problem not found' });
  const { solution, ...safe } = p;
  res.json(safe);
});

app.post('/api/run', async (req, res) => {
  const { code, problemId } = req.body;
  if (!code) return res.status(400).json({ error: 'No code provided' });

  const problem = problems.find(p => p.id === problemId);
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gorun-'));
  const filePath = path.join(tmpDir, 'main.go');

  try {
    fs.writeFileSync(filePath, code);

    const result = await runGo(filePath, tmpDir);
    const actual = result.stdout;
    const expected = problem ? problem.expectedOutput : null;

    let passed = false;
    if (expected !== null) {
      if (problem.partialMatch) {
        passed = actual.includes(expected.trim());
      } else {
        passed = actual === expected;
      }
    }

    res.json({
      stdout: actual,
      stderr: result.stderr,
      exitCode: result.exitCode,
      passed,
      expected,
      executionTime: result.executionTime
    });
  } catch (err) {
    res.json({
      stdout: '',
      stderr: err.message,
      exitCode: 1,
      passed: false,
      expected: problem?.expectedOutput || null
    });
  } finally {
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}
  }
});

// ─── GO EXECUTION ─────────────────────────────────────────────────────────────

function runGo(filePath, tmpDir) {
  return new Promise((resolve) => {
    const start = Date.now();
    // Try to run with 'go run', fallback gracefully
    const cmd = `cd "${tmpDir}" && go run main.go`;
    
    exec(cmd, {
      timeout: 5000,
      maxBuffer: 1024 * 512,
      env: {
        ...process.env,
        GOPROXY: 'off',
        GONOSUMCHECK: '*',
        GOFLAGS: '-mod=mod'
      }
    }, (error, stdout, stderr) => {
      const executionTime = Date.now() - start;
      resolve({
        stdout: stdout || '',
        stderr: error?.killed ? 'Execution timed out (5s limit)' : (stderr || ''),
        exitCode: error ? (error.code || 1) : 0,
        executionTime
      });
    });
  });
}

// ─── HEALTH ───────────────────────────────────────────────────────────────────

app.get('/api/health', (req, res) => {
  let goAvailable = false;
  try {
    execSync('go version', { timeout: 2000 });
    goAvailable = true;
  } catch {}
  res.json({ status: 'ok', goAvailable, time: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log('');
  console.log('\U0001f9ab GoLearn is running!');
  console.log(`   Open in browser: http://localhost:${PORT}`);
  console.log('');
});
