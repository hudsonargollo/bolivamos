// jose (used by @bolivibes/api-schema's decodeSessionUnsafe) references the
// global `crypto` object at module load time — React Native/Hermes has no
// such global, so importing jose anywhere in the require graph threw
// "Property 'crypto' doesn't exist" before this ever reached app code. This
// polyfill must execute before expo-router/entry pulls in that chain, so it
// has to be the first import of the app's actual entry point (package.json's
// "main"), not something imported from within app/_layout.tsx.
import "react-native-get-random-values";
import "expo-router/entry";
