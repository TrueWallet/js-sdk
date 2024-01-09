import { TrueWalletModules } from "../types";

export const Modules: Record<TrueWalletModules, string> = {
  SecurityControlModule: <string>process.env.SECURITY_CONTROL_MODULE_ADDRESS,
  SocialRecoveryModule: <string>process.env.SOCIAL_RECOVERY_MODULE_ADDRESS,
};
