export interface TrueWalletSignerConfig {
  type: 'salt' | 'injected' | 'privateKey';
  data: unknown[];
}
