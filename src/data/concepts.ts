export interface Concept {
  id: string;
  label: string;
  title: string;
  body: string;
  code: string;
  note: string;
}

export const concepts: Concept[] = [
  {
    id: 'syntax',
    label: 'Concise syntax',
    title: 'Say more with fewer lines',
    body: 'Properties, immutability and lambda expressions are part of the core language, so ordinary Android code loses a lot of boilerplate.',
    code: `data class User(val name: String, val email: String)

val users = listOf(User("Ada", "ada@kt.dev"))
  .filter { it.email.endsWith("@kt.dev") }
  .map { it.name }

println(users) // [Ada]`,
    note: 'Kotlin evaluates the last expression of a block, so lambdas return values without the `return` keyword.',
  },
  {
    id: 'null',
    label: 'Null safety',
    title: 'The null reference, eliminated',
    body: 'Every type has a nullable and a non-nullable form. The compiler forces you to handle absence explicitly instead of crashing at runtime.',
    code: `val name: String? = loadName()

// Safe call — does nothing when name is null
name?.let { println(it) }

// Elvis operator — provide a fallback
val label: String = name ?: "Anonymous"

// Non-null assertion, only when you are sure
val length: Int = name!!.length`,
    note: 'Type `String?` is a different type from `String`. `NullPointerException` on an API-declared nullable stops being a surprise.',
  },
  {
    id: 'types',
    label: 'Type inference',
    title: 'Types where they matter, inference everywhere else',
    body: 'Kotlin infers types from the right-hand side, so you keep explicit contracts on public APIs and drop them everywhere else.',
    code: `val count: Int = 3              // explicit
val title = "Kotlin"            // inferred: String
val items = listOf(1, 2, 3)     // inferred: List<Int>

fun process(input: List<Int>): List<Int> =
    input.filter { it % 2 == 0 }.map { it * 2 }`,
    note: 'Inference never sacrifices type safety — it happens after the expression is fully typed.',
  },
  {
    id: 'ext',
    label: 'Extension functions',
    title: 'Add behaviour without inheritance',
    body: 'You can extend classes you do not own — including Android and Java types — without wrappers or utility classes.',
    code: `fun Context.toast(message: String) =
    Toast.makeText(this, message, Toast.LENGTH_SHORT).show()

fun String.isPhoneNumber(): Boolean =
    matches(Regex("^\\\\+?[0-9]{7,15}$"))

// usage
toast("Saved")
if (userInput.isPhoneNumber()) { /* ... */ }`,
    note: 'Extension functions compile to static methods, so they add zero runtime overhead to the call site.',
  },
  {
    id: 'coroutines',
    label: 'Coroutines',
    title: 'Asynchronous code that reads like a sequence',
    body: 'Suspending functions pause without blocking the thread. On Android this means main-thread-safe network and database calls.',
    code: `scope.launch {
    val user = api.fetchUser(id)      // suspends, no ANR
    val posts = repo.postsFor(user)   // resumes on main
    _uiState.update { it.copy(user = user, posts = posts) }
}`,
    note: 'Dispatchers decide which thread runs the body: Main for UI, IO for blocking work, Default for CPU work.',
  },
  {
    id: 'interop',
    label: 'Java interoperability',
    title: 'One codebase, two languages',
    body: 'Kotlin compiles to JVM bytecode, so Kotlin and Java live in the same module and call each other directly.',
    code: `// Kotlin calling existing Java
val queue = ArrayDeque<String>()
queue.addFirst("apk")

// Java calling Kotlin — @JvmStatic generates the static method
// List<String> names = util.names();`,
    note: 'Migration is incremental: convert one class at a time while the rest of the app keeps building.',
  },
];
