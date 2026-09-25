export interface Feature {
  id: string;
  index: string;
  title: string;
  subtitle: string;
  body: string;
  code: string;
  language: string;
}

export const features: Feature[] = [
  {
    id: 'null-safety',
    index: '01',
    title: 'Null Safety',
    subtitle: 'Absence is part of the type',
    body: 'Nullable types are distinct from non-nullable ones. Safe calls, the Elvis operator and early returns make the null path explicit — the compiler refuses to let an unhandled nullable reach a non-null parameter.',
    code: `val email: String? = account.email

if (email.isNullOrBlank()) {
    showPrompt("Add an email address")
    return
}

// smart cast: email is String here
sendVerification(email)`,
    language: 'kotlin',
  },
  {
    id: 'coroutines',
    index: '02',
    title: 'Coroutines',
    subtitle: 'Structured async on a single thread pool',
    body: 'A coroutine is a lightweight thread of execution you can suspend and resume. `viewModelScope` cancels background work automatically when the screen is destroyed, so you never leak a callback.',
    code: `viewModelScope.launch {
    _state.update { Loading }
    runCatching { repository.sync() }
        .onSuccess { _state.update { Ready(it) } }
        .onFailure { _state.update { Error(it.message) } }
}`,
    language: 'kotlin',
  },
  {
    id: 'extensions',
    index: '03',
    title: 'Extension Functions',
    subtitle: 'Open up the Android SDK',
    body: 'Declare a receiver type and you can add behaviour to `Context`, `View`, `String` or your own models — no subclassing, no `Utils.java`, and IDE navigation still works.',
    code: `fun View.visible() { visibility = View.VISIBLE }
fun View.gone()    { visibility = View.GONE }

fun Context.dp(value: Int): Int =
    (value * resources.displayMetrics.density).toInt()

binding.toolbar.gone()
card.updatePadding(bottom = ctx.dp(24))`,
    language: 'kotlin',
  },
  {
    id: 'data-classes',
    index: '04',
    title: 'Data Classes',
    subtitle: 'equals, hashCode, copy — generated',
    body: 'One keyword generates a constructor, accessors, `toString`, structural equality and a `copy` function. This is the backbone of immutable state in Compose and in `StateFlow`.',
    code: `data class UiState(
    val isLoading: Boolean = false,
    val items: List<Item> = emptyList(),
)

val next = state.copy(isLoading = true)
// unchanged fields are shared, not duplicated`,
    language: 'kotlin',
  },
  {
    id: 'smart-casts',
    index: '05',
    title: 'Smart Casts',
    subtitle: 'The compiler narrows the type for you',
    body: 'After a type check, Kotlin narrows the static type automatically — and validates that your `when` branches cover every case of a sealed hierarchy.',
    code: `when (val result = parse(raw)) {
    is Success -> render(result.value)
    is Failure -> showError(result.message)
}`,
    language: 'kotlin',
  },
  {
    id: 'interop',
    index: '06',
    title: 'Java Interoperability',
    subtitle: 'Same module, same bytecode, both languages',
    body: 'Kotlin compiles to standard JVM bytecode. You can call Java from Kotlin and Kotlin from Java in the same Gradle module, which is why adoption inside Android teams is incremental rather than a rewrite.',
    code: `// build.gradle.kts
kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xjvm-default=all")
    }
}

// Java sees Kotlin classes as ordinary final classes
// with @JvmStatic / @JvmOverloads where you need them.`,
    language: 'kotlin',
  },
  {
    id: 'compose',
    index: '07',
    title: 'Jetpack Compose',
    subtitle: 'Kotlin functions are the UI toolkit',
    body: 'Instead of describing *how* to update a view tree, you describe *what* should be on screen. The compiler tracks the state your composable reads and redraws only that part.',
    code: `@Composable
fun Greeting(name: String) {
    var expanded by remember { mutableStateOf(false) }
    Card(onClick = { expanded = !expanded }) {
        Text(if (expanded) "Hello, $name!" else "Hi")
    }
}`,
    language: 'kotlin',
  },
];
