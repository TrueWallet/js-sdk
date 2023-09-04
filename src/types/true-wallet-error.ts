export class TrueWalletError extends Error {
    constructor(error: {message: string, code: string}) {
        super(error.message);
    }
}
