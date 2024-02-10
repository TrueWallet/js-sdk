import { TrueWalletModules } from "../types";

export const Modules: Record<TrueWalletModules, string> = {
  SecurityControlModule: <string>process.env.SECURITY_CONTROL_MODULE || '0x559103Ecd6cA2a0b92c973a7783dd83B9d7980ee',
  SocialRecoveryModule: <string>process.env.SOCIAL_RECOVERY_MODULE || '0x929BAF181bFE97F59ecc22c3EFd33c0D9334380F',
};
