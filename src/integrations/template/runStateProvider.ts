import { berachainClient } from "../../config";
import { TemplatePoolStateProvider } from "./TemplatePoolStateProvider";

const stateProvider = new TemplatePoolStateProvider(berachainClient);

stateProvider.start();
