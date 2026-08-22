const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Let Metro see workspace packages that live outside apps/mobile.
config.watchFolders = [workspaceRoot];

// pnpm hoists into the workspace root's node_modules (plus each package's own),
// so Metro needs to resolve from both.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// pnpm's node_modules are symlinks — required for Metro to follow them into
// packages/* instead of treating them as opaque/duplicate copies.
config.resolver.unstable_enableSymlinks = true;

// Force module resolution to start from each file's own directory before
// climbing up, which matters once symlinks are in play.
config.resolver.disableHierarchicalLookup = true;

const { withNativeWind } = require("nativewind/metro");
module.exports = withNativeWind(config, { input: "./app/globals.css" });
