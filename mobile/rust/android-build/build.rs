fn main() {
    // Link against Android logging
    println!("cargo:rustc-link-lib=dylib=log");
    
    // Link against Android NDK libraries
    println!("cargo:rustc-link-lib=dylib=android");
    println!("cargo:rustc-link-lib=dylib=EGL");
    println!("cargo:rustc-link-lib=dylib=GLESv2");
    
    // Link path to shared code
    println!("cargo:rustc-link-search=native=../src");
    
    // Ensure Android SDK environment variables are set
    if let Ok(sdk_path) = std::env::var("ANDROID_SDK_ROOT") {
        println!("cargo:warning=Using Android SDK at: {}", sdk_path);
    } else {
        println!("cargo:warning=ANDROID_SDK_ROOT not set");
    }
    
    // Configure for Android NDK
    if let Ok(ndk_path) = std::env::var("ANDROID_NDK_ROOT") {
        println!("cargo:warning=Using Android NDK at: {}", ndk_path);
    } else {
        println!("cargo:warning=ANDROID_NDK_ROOT not set");
    }
} 