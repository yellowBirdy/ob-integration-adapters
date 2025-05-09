import { berachainClient } from "../../config";
import { NablaPoolProvider } from "./NablaPoolProvider";

// Create and start the pool provider
const stateProvider = new NablaPoolProvider(berachainClient);

// Start fetching pools and listening for events
stateProvider.start(); 