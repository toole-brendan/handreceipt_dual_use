package com.handreceipt.utils

import android.content.Context
import android.os.Build
import android.provider.Settings

object EmulatorDetection {
    fun isEmulator(context: Context): Boolean {
        // Check ADB enabled
        val adbEnabled = Settings.Global.getInt(
            context.contentResolver,
            Settings.Global.ADB_ENABLED, 0
        ) == 1

        // Check QEMU
        val isQemu = System.getProperty("ro.kernel.qemu") == "1"

        // Check common emulator properties
        return adbEnabled || isQemu || Build.FINGERPRINT.startsWith("generic") ||
                Build.FINGERPRINT.startsWith("unknown") ||
                Build.MODEL.contains("google_sdk") ||
                Build.MODEL.contains("Emulator") ||
                Build.MODEL.contains("Android SDK built for x86") ||
                Build.MANUFACTURER.contains("Genymotion") ||
                (Build.BRAND.startsWith("generic") && Build.DEVICE.startsWith("generic")) ||
                "google_sdk" == Build.PRODUCT
    }
} 