package com.handreceipt;

import android.content.Context;
import com.facebook.flipper.android.AndroidFlipperClient;
import com.facebook.flipper.android.utils.FlipperUtils;
import com.facebook.flipper.core.FlipperClient;
import com.facebook.flipper.plugins.databases.DatabasesFlipperPlugin;
import com.facebook.flipper.plugins.fresco.FrescoFlipperPlugin;
import com.facebook.flipper.plugins.inspector.DescriptorMapping;
import com.facebook.flipper.plugins.inspector.InspectorFlipperPlugin;
import com.facebook.flipper.plugins.network.FlipperOkhttpInterceptor;
import com.facebook.flipper.plugins.network.NetworkFlipperPlugin;
import com.facebook.flipper.plugins.sharedpreferences.SharedPreferencesFlipperPlugin;
import com.facebook.react.ReactInstanceEventListener;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.modules.network.NetworkingModule;
import com.handreceipt.BuildConfig;
import okhttp3.OkHttpClient;

public class ReactNativeFlipper {
  public static void initializeFlipper(Context context, ReactInstanceManager reactInstanceManager) {
    if (BuildConfig.DEBUG && FlipperUtils.shouldEnableFlipper(context)) {
      final FlipperClient client = AndroidFlipperClient.getInstance(context);
      client.addPlugin(new InspectorFlipperPlugin(context, DescriptorMapping.withDefaults()));
      client.addPlugin(new DatabasesFlipperPlugin(context));
      client.addPlugin(new SharedPreferencesFlipperPlugin(context));

      NetworkFlipperPlugin networkFlipperPlugin = new NetworkFlipperPlugin();
      NetworkingModule.setCustomClientBuilder(
          builder -> builder.addNetworkInterceptor(new FlipperOkhttpInterceptor(networkFlipperPlugin)));
      client.addPlugin(networkFlipperPlugin);
      client.start();

      // Fresco Plugin needs to ensure that ImagePipelineFactory is initialized
      // Hence we run if after all native modules have been initialized
      ReactContext reactContext = reactInstanceManager.getCurrentReactContext();
      if (reactContext == null) {
        reactInstanceManager.addReactInstanceEventListener(
            new ReactInstanceEventListener() {
              @Override
              public void onReactContextInitialized(ReactContext reactContext) {
                reactInstanceManager.removeReactInstanceEventListener(this);
                FrescoFlipperPlugin frescoFlipperPlugin = new FrescoFlipperPlugin();
                client.addPlugin(frescoFlipperPlugin);
              }
            });
      } else {
        FrescoFlipperPlugin frescoFlipperPlugin = new FrescoFlipperPlugin();
        client.addPlugin(frescoFlipperPlugin);
      }
    }
  }
}
