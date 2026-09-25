export const appCode = `package com.example.kotlinstudio

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.material3.MaterialTheme

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContent {
            MaterialTheme {
                Greeting("Android")
            }
        }
    }
}`;

export const gradleOutput = [
  { t: '> Configure project :app', d: 420 },
  { t: '> Task :app:preBuild UP-TO-DATE', d: 260 },
  { t: '> Task :app:compileDebugKotlin', d: 780 },
  { t: '> Task :app:mergeDebugResources', d: 340 },
  { t: '> Task :app:processDebugManifest', d: 300 },
  { t: '> Task :app:dexBuilderDebug', d: 520 },
  { t: '> Task :app:packageDebug', d: 460 },
  { t: '', d: 120 },
  { t: 'BUILD SUCCESSFUL in 6s', d: 200, kind: 'ok' },
  { t: '31 actionable tasks: 31 executed', d: 160 },
];

export const terminalCommands: Record<string, string[]> = {
  'kotlin --version': ['Kotlin version 2.1.0-release-125 (JRE 17.0.9+0-Ubuntu-0ubuntu22.04.1)'],
  './gradlew build': [
    '> Configure project :app',
    '> Task :app:compileDebugKotlin',
    '> Task :app:compileReleaseKotlin',
    '> Task :app:testDebugUnitTest',
    '',
    'BUILD SUCCESSFUL in 11s',
    '31 actionable tasks: 31 executed, 3 up-to-date',
  ],
  './gradlew assembleDebug': [
    '> Task :app:mergeDebugResources',
    '> Task :app:processDebugManifest',
    '> Task :app:dexBuilderDebug',
    '> Task :app:packageDebug',
    '',
    'BUILD SUCCESSFUL in 6s',
    '31 actionable tasks: 31 executed',
  ],
  'adb install app-debug.apk': [
    'Performing Streamed Install',
    'Success',
    '',
    'Starting: Intent { cmp=com.example.kotlinstudio/.MainActivity }',
  ],
};
