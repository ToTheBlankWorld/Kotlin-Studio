export interface PipelineStage {
  id: string;
  index: string;
  title: string;
  tool: string;
  description: string;
  metric: string;
  code?: string;
}

export const pipeline: PipelineStage[] = [
  {
    id: 'source',
    index: '01',
    title: 'Kotlin Source',
    tool: '.kt files',
    description:
      'Human-readable Kotlin: activities, composables, view models and resources live in app/src/main.',
    metric: '214 files',
    code: `setContent { Greeting("Android") }`,
  },
  {
    id: 'compiler',
    index: '02',
    title: 'Kotlin Compiler',
    tool: 'kotlinc · K2',
    description:
      'The K2 frontend resolves symbols, type-checks null safety, then the backend emits JVM bytecode for every class.',
    metric: '→ .class',
    code: `// MainActivity.class`,
  },
  {
    id: 'agp',
    index: '03',
    title: 'Gradle + AGP',
    tool: 'Android Gradle Plugin',
    description:
      'Tasks run in a directed acyclic graph: compile resources, process the manifest, shrink, then package.',
    metric: '31 tasks',
  },
  {
    id: 'dex',
    index: '04',
    title: 'DEX & Resources',
    tool: 'd8 · aapt2',
    description:
      'JVM bytecode is converted to Dalvik Executable format, and resources are compiled into a binary table.',
    metric: 'classes.dex',
  },
  {
    id: 'apk',
    index: '05',
    title: 'APK',
    tool: 'apksigner',
    description:
      'DEX, resources, native libraries and the manifest are zipped, then signed with your debug or release key.',
    metric: 'app-debug.apk',
  },
  {
    id: 'device',
    index: '06',
    title: 'Android Device',
    tool: 'ActivityManager',
    description:
      'Package manager installs the APK, the manifest entry point is resolved, and your Kotlin `onCreate` runs.',
    metric: 'app launched',
  },
];

export interface LearningStep {
  n: string;
  title: string;
  blurb: string;
  tag: string;
}

export const learningPath: LearningStep[] = [
  { n: '01', title: 'Kotlin Fundamentals', blurb: 'Types, null safety, functions, collections and immutability.', tag: 'language' },
  { n: '02', title: 'Object-Oriented Kotlin', blurb: 'Classes, interfaces, sealed hierarchies and delegation.', tag: 'language' },
  { n: '03', title: 'Coroutines & Flows', blurb: 'Suspending functions, dispatchers, structured concurrency.', tag: 'async' },
  { n: '04', title: 'Android Fundamentals', blurb: 'Activities, fragments, lifecycle, intents and the manifest.', tag: 'platform' },
  { n: '05', title: 'Jetpack Compose', blurb: 'Composables, state hoisting, side effects and theming.', tag: 'ui' },
  { n: '06', title: 'Architecture', blurb: 'MVVM / MVI, repository layer, dependency injection.', tag: 'design' },
  { n: '07', title: 'Networking', blurb: 'Retrofit, kotlinx.serialization, error and retry policy.', tag: 'data' },
  { n: '08', title: 'Database', blurb: 'Room, migrations, DataStore and offline-first sync.', tag: 'data' },
  { n: '09', title: 'Testing', blurb: 'JUnit, Turbine, Compose UI tests and instrumented runs.', tag: 'quality' },
  { n: '10', title: 'Production Android Apps', blurb: 'R8, baseline profiles, CI, Play releases and monitoring.', tag: 'ship' },
];

export interface CompareRow {
  area: string;
  traditional: string;
  modern: string;
  traditionalCode?: string;
  modernCode?: string;
}

export const comparison: CompareRow[] = [
  {
    area: 'Syntax',
    traditional: 'Verbose: getters, setters and explicit type declarations everywhere.',
    modern: 'Properties, type inference and expression bodies remove most of the ceremony.',
    traditionalCode: `public class Holder {
    private String name;
    public String getName() { return name; }
    public void setName(String n) { name = n; }
}`,
    modernCode: `data class Holder(val name: String)

// or, mutable when you really need it
class Holder { var name: String = "" }`,
  },
  {
    area: 'Null safety',
    traditional: 'Any reference may be null; every dereference is a runtime risk.',
    modern: 'Nullable types are explicit — `String?` cannot be passed where `String` is required.',
    traditionalCode: `String name = user.getName();
int len = name.length(); // possible NPE`,
    modernCode: `val name: String? = user.name
val len = name?.length ?: 0`,
  },
  {
    area: 'Asynchronous programming',
    traditional: 'Callbacks, AsyncTask or executor plumbing with manual lifecycle guards.',
    modern: 'Coroutines suspend instead of blocking; scopes cancel with the screen.',
    traditionalCode: `api.getUser(id, new Callback<User>() {
    @Override public void onSuccess(User u) {
        runOnUiThread(() -> render(u));
    }
});`,
    modernCode: `scope.launch {
    val u = api.getUser(id)
    render(u)
}`,
  },
  {
    area: 'UI development',
    traditional: 'XML layouts inflated at runtime, then imperative `findViewById` updates.',
    modern: 'Composable functions declare UI and recompose when state changes.',
    traditionalCode: `val title = findViewById<TextView>(R.id.title)
title.text = "Hello"
title.setOnClickListener { goNext() }`,
    modernCode: `Text(
    text = "Hello",
    modifier = Modifier.clickable { goNext() }
)`,
  },
  {
    area: 'Java interoperability',
    traditional: 'Java is the baseline; Kotlin would have to be introduced project-wide.',
    modern: 'Same module, same bytecode — migrate class by class while CI keeps green.',
    traditionalCode: `// build.gradle
apply plugin: 'java'`,
    modernCode: `plugins {
    id("org.jetbrains.kotlin.android")
}`,
  },
  {
    area: 'Developer tooling',
    traditional: 'Layout preview, lint and instant run with long edit–build cycles.',
    modern: 'Live Edit, Compose preview, K2 analysis and build reuse in Android Studio.',
    traditionalCode: `Edit → Build → Deploy → Wait`,
    modernCode: `Edit → Apply Changes → Interact`,
  },
];
