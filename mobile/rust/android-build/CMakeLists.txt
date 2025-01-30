cmake_minimum_required(VERSION 3.10)
project(handreceipt_mobile)

# Set Android specific flags
set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -Wall")
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=c++17 -fexceptions")

# Include directories
include_directories(
    ${CMAKE_SOURCE_DIR}/../../src
    ${ANDROID_NDK}/sources/cxx-stl/llvm-libc++/include
)

# Add Rust library
add_library(handreceipt_mobile SHARED IMPORTED)
set_target_properties(handreceipt_mobile PROPERTIES
    IMPORTED_LOCATION ${CMAKE_SOURCE_DIR}/../target/${ANDROID_ABI}/libhandreceipt_mobile.so
)

# Create JNI bridge library
add_library(handreceipt_bridge SHARED
    ${CMAKE_SOURCE_DIR}/../../src/jni/bridge.cpp
)

# Link against Rust library
target_link_libraries(handreceipt_bridge
    handreceipt_mobile
    android
    log
) 