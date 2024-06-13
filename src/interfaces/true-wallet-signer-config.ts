export interface TrueWalletSignerConfig {
  type: 'salt' | 'injected' | 'privateKey' | 'jwt';
  data: unknown[];
}
