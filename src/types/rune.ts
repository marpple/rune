export interface RuneConfigType {
  port: number;
  hostname: string;
  mode: 'server' | 'render';
  watchToReloadPaths: string[];
  clientEntry?: string;
  serverEntry?: string;
  showBundleAnalyzer?: boolean;
  publicPath?: string;
}
