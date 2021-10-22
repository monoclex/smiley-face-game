/**
 * this is a giant hack because the shopItems atom loads shop items far before the routes
 * get globally rewritten (yes i know global state is ugly but /shrug)
 */

// TODO: repurpose this - rather than using it for detecting when the routes are rewritten,
// how about using it for when the useShopItems hook is called?
import PromiseCompletionSource from "./PromiseCompletionSource";
export const routesRewritten = new PromiseCompletionSource();
