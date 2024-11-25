package com.handreceipt

import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors
import com.handreceipt.camera.QRCameraManager

class HandReceiptModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    private val executor: ExecutorService = Executors.newSingleThreadExecutor()
    private val cameraManager = QRCameraManager(reactContext)
    private external fun initializeCore(): Long
    private external fun scanQR(corePtr: Long, data: String): String
    private external fun verifyTransfer(corePtr: Long, scanData: String): Boolean
    private external fun syncPendingTransfers(corePtr: Long)
    private external fun processImageData(corePtr: Long, data: ByteArray, width: Int, height: Int): String?
    private var corePtr: Long = 0

    companion object {
        init {
            System.loadLibrary("handreceipt_mobile")
        }
    }

    override fun getName(): String = "HandReceiptMobile"

    @ReactMethod
    fun initialize(promise: Promise) {
        executor.execute {
            try {
                corePtr = initializeCore()
                promise.resolve(null)
            } catch (e: Exception) {
                promise.reject("INIT_ERROR", e)
            }
        }
    }

    @ReactMethod
    fun startCamera(promise: Promise) {
        try {
            cameraManager.openCamera(promise)
        } catch (e: Exception) {
            promise.reject("CAMERA_ERROR", e)
        }
    }

    @ReactMethod
    fun stopCamera(promise: Promise) {
        try {
            cameraManager.closeCamera()
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("CAMERA_ERROR", e)
        }
    }

    @ReactMethod
    fun scanQRCode(data: String, promise: Promise) {
        executor.execute {
            try {
                val result = scanQR(corePtr, data)
                promise.resolve(result)
            } catch (e: Exception) {
                promise.reject("SCAN_ERROR", e)
            }
        }
    }

    @ReactMethod
    fun verifyTransferData(scanData: String, promise: Promise) {
        executor.execute {
            try {
                val isValid = verifyTransfer(corePtr, scanData)
                promise.resolve(isValid)
            } catch (e: Exception) {
                promise.reject("VERIFY_ERROR", e)
            }
        }
    }

    @ReactMethod
    fun syncTransfers(promise: Promise) {
        executor.execute {
            try {
                syncPendingTransfers(corePtr)
                promise.resolve(null)
            } catch (e: Exception) {
                promise.reject("SYNC_ERROR", e)
            }
        }
    }

    fun processFrame(imageData: ByteArray, width: Int, height: Int) {
        executor.execute {
            try {
                val result = processImageData(corePtr, imageData, width, height)
                if (result != null) {
                    val params = Arguments.createMap().apply {
                        putString("data", result)
                    }
                    sendEvent("onQRCodeDetected", params)
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    private fun sendEvent(eventName: String, params: WritableMap?) {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }

    override fun onCatalystInstanceDestroy() {
        executor.shutdown()
        super.onCatalystInstanceDestroy()
    }
} 